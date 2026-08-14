import { query, mutation, internalMutation, internalAction } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import type { Doc, Id } from './_generated/dataModel';
import { canAccessEditor, canAccessAdmin } from './lib/roles';
import { fetchFeed, parseFeed, type NormalizedFeedItem } from './lib/rss';
import {
  generateNewsDraft,
  generateFeaturedImage,
  DEFAULT_MODEL,
  type DraftGenerationResult,
} from './lib/ai';
import {
  automationStatusSchema,
  DEFAULT_SYNC_FREQUENCY_MINUTES,
  DEFAULT_MAX_STORIES_PER_SYNC,
  DEFAULT_DRAFT_STATUS,
  DEFAULT_AUTO_APPROVE_DELAY_MINUTES,
  sanitizeHtml,
  sanitizeContent,
  slugify,
  titleSimilarity,
  validateFeedUrl,
  KNOWN_CATEGORIES,
} from './lib/automation';
import type { QueryCtx, MutationCtx } from './_generated/server';

const now = () => Date.now();

async function getRole(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const user = await ctx.db
    .query('users')
    .withIndex('by_firebase_uid', (q) => q.eq('firebaseUid', identity.subject))
    .unique();
  return user?.role ?? null;
}

async function requireEditor(ctx: MutationCtx) {
  const role = await getRole(ctx);
  if (!canAccessEditor(role)) {
    throw new Error('You need editor access to do that.');
  }
  return role;
}

async function requireAdmin(ctx: MutationCtx) {
  const role = await getRole(ctx);
  if (!canAccessAdmin(role)) {
    throw new Error('You need admin access to do that.');
  }
  return role;
}

async function log(
  ctx: MutationCtx,
  entry: {
    sourceId?: Id<'rssSources'>;
    action: string;
    status: 'success' | 'error' | 'info' | 'warning';
    message: string;
    metadata?: unknown;
  },
) {
  await ctx.db.insert('automationLogs', {
    sourceId: entry.sourceId,
    action: entry.action,
    status: entry.status,
    message: entry.message,
    metadata: entry.metadata,
    createdAt: now(),
  });
}

export const AUTOMATION_SETTINGS_KEY = 'default';

export async function getSettingsDoc(ctx: QueryCtx | MutationCtx) {
  const existing = await ctx.db
    .query('automationSettings')
    .withIndex('by_key', (q) => q.eq('key', AUTOMATION_SETTINGS_KEY))
    .unique();
  if (existing) return existing;
  return {
    key: AUTOMATION_SETTINGS_KEY,
    syncFrequencyMinutes: DEFAULT_SYNC_FREQUENCY_MINUTES,
    aiProcessing: true,
    autoPublish: false,
    trustedSources: [],
    trustedCategories: [],
    autoApprove: false,
    autoApproveDelayMinutes: DEFAULT_AUTO_APPROVE_DELAY_MINUTES,
    defaultStatus: DEFAULT_DRAFT_STATUS,
    maxStoriesPerSync: DEFAULT_MAX_STORIES_PER_SYNC,
    updatedAt: now(),
  } as const;
}

export async function ensureSettingsDoc(ctx: MutationCtx) {
  const existing = await ctx.db
    .query('automationSettings')
    .withIndex('by_key', (q) => q.eq('key', AUTOMATION_SETTINGS_KEY))
    .unique();
  if (existing) return existing;
  return (await ctx.db.insert('automationSettings', {
    key: AUTOMATION_SETTINGS_KEY,
    syncFrequencyMinutes: DEFAULT_SYNC_FREQUENCY_MINUTES,
    aiProcessing: true,
    autoPublish: false,
    trustedSources: [],
    trustedCategories: [],
    autoApprove: false,
    autoApproveDelayMinutes: DEFAULT_AUTO_APPROVE_DELAY_MINUTES,
    defaultStatus: DEFAULT_DRAFT_STATUS,
    maxStoriesPerSync: DEFAULT_MAX_STORIES_PER_SYNC,
    updatedAt: now(),
  })) as unknown as Doc<'automationSettings'>;
}

async function ensureUniqueSlug(
  ctx: MutationCtx,
  base: string,
  excludeId?: Id<'articles'>,
): Promise<string> {
  let candidate = slugify(base) || `story-${now()}`;
  let i = 2;
  for (;;) {
    const existing = await ctx.db
      .query('articles')
      .withIndex('by_slug', (q) => q.eq('slug', candidate))
      .first();
    if (!existing || existing._id === excludeId) return candidate;
    candidate = `${slugify(base)}-${i}`;
    i += 1;
  }
}

/** Find an existing record that this item is a duplicate of. */
async function findDuplicate(
  ctx: QueryCtx | MutationCtx,
  item: NormalizedFeedItem,
  excludeSourceId?: Id<'rssSources'>,
): Promise<{ id: Id<'importedNews'>; reason: string } | null> {
  if (item.guid) {
    const byGuid = await ctx.db
      .query('importedNews')
      .withIndex('by_guid', (q) => q.eq('guid', item.guid))
      .first();
    if (byGuid) return { id: byGuid._id, reason: 'Same RSS GUID already imported' };
  }

  const byUrl = await ctx.db
    .query('importedNews')
    .withIndex('by_originalUrl', (q) => q.eq('originalUrl', item.link))
    .first();
  if (byUrl) return { id: byUrl._id, reason: 'Same original URL already imported' };

  const existingArticle = await ctx.db
    .query('articles')
    .withIndex('by_originalUrl', (q) => q.eq('originalUrl', item.link))
    .first();
  if (existingArticle) {
    return { id: null as never, reason: 'Story already published on Subteen' };
  }

  const recent = await ctx.db
    .query('importedNews')
    .order('desc')
    .take(150);
  for (const candidate of recent) {
    if (candidate.sourceId === excludeSourceId) continue;
    const sim = titleSimilarity(item.title, candidate.originalTitle);
    if (sim >= 0.85) {
      return { id: candidate._id, reason: `Nearly identical title (${Math.round(sim * 100)}% match)` };
    }
  }

  const recentArticles = await ctx.db
    .query('articles')
    .withIndex('by_status', (q) => q.eq('status', 'published'))
    .order('desc')
    .take(150);
  for (const candidate of recentArticles) {
    const sim = titleSimilarity(item.title, candidate.title);
    if (sim >= 0.85) {
      return { id: null as never, reason: `Story already published on Subteen (${Math.round(sim * 100)}% title match)` };
    }
  }

  return null;
}

/** Internal: fetch a single feed over the network and import the result. */
export const syncSource = internalAction({
  args: { sourceId: v.id('rssSources') },
  handler: async (ctx, { sourceId }) => {
    const meta = await ctx.runMutation(internal.newsAutomation.getSourceMeta, { sourceId });
    if (!meta) return { error: 'RSS source not found.' };

    let feedText = '';
    let fetchError: string | undefined;
    try {
      feedText = await fetchFeed(meta.feedUrl);
    } catch (err) {
      fetchError = err instanceof Error ? err.message : 'Feed fetch failed';
    }

    return ctx.runMutation(internal.newsAutomation.applySyncResult, {
      sourceId,
      sourceName: meta.name,
      pidgin: meta.pidgin ?? false,
      feedText,
      fetchError,
    });
  },
});

/** Internal: read the fields an action needs before a network fetch. */
export const getSourceMeta = internalMutation({
  args: { sourceId: v.id('rssSources') },
  handler: async (ctx, { sourceId }) => {
    const source = await ctx.db.get(sourceId);
    return source
      ? { name: source.name, feedUrl: source.feedUrl, pidgin: source.pidgin ?? false }
      : null;
  },
});

/** Internal: ingest a fetched feed body. Returns sync stats. */
export const applySyncResult = internalMutation({
  args: {
    sourceId: v.id('rssSources'),
    sourceName: v.string(),
    pidgin: v.optional(v.boolean()),
    feedText: v.string(),
    fetchError: v.optional(v.string()),
  },
  handler: async (ctx, { sourceId, sourceName, pidgin, feedText, fetchError }) => {
    const startedAt = now();
    let newStories = 0;
    let duplicates = 0;
    let failed = 0;

    if (fetchError) {
      await ctx.db.patch(sourceId, {
        lastSyncedAt: now(),
        lastSyncStatus: 'error',
        lastSyncError: fetchError,
        updatedAt: now(),
      });
      await log(ctx, {
        sourceId,
        action: 'SOURCE_CHECK',
        status: 'error',
        message: `Feed unavailable for ${sourceName}: ${fetchError}`,
      });
      return { newStories: 0, duplicates: 0, failed: 0, processingTimeMs: now() - startedAt, error: fetchError };
    }

    const items = parseFeed(feedText);
    if (items.length === 0) {
      await ctx.db.patch(sourceId, {
        lastSyncedAt: now(),
        lastSyncStatus: 'error',
        lastSyncError: 'Feed returned no readable items (malformed or empty RSS).',
        updatedAt: now(),
      });
      await log(ctx, {
        sourceId,
        action: 'SOURCE_CHECK',
        status: 'warning',
        message: `Malformed or empty feed for ${sourceName}.`,
      });
      return { newStories: 0, duplicates: 0, failed: 0, processingTimeMs: now() - startedAt, error: 'Malformed or empty feed.' };
    }

    const settings = await getSettingsDoc(ctx);
    const max = Math.max(1, settings.maxStoriesPerSync);

    for (const item of items) {
      if (newStories >= max) break;

      const duplicate = await findDuplicate(ctx, item, sourceId);
      if (duplicate) {
        duplicates += 1;
        const insertedId = await ctx.db.insert('importedNews', {
          sourceId,
          guid: item.guid,
          originalUrl: item.link,
          originalTitle: sanitizeHtml(item.title),
          originalDescription: item.description ? sanitizeHtml(item.description) : undefined,
          originalAuthor: item.author,
          originalPublishedAt: item.publishedAt,
          originalImageUrl: item.imageUrl,
          videoUrl: item.videoUrl,
          language: pidgin ? 'pidgin' : 'en',
          status: 'REJECTED',
          duplicateOf: duplicate.id ?? undefined,
          duplicateReason: duplicate.reason,
          createdAt: now(),
          updatedAt: now(),
        });
        await log(ctx, {
          sourceId,
          action: 'DUPLICATE_REJECTED',
          status: 'info',
          message: `Duplicate rejected: ${item.title.slice(0, 80)}`,
          metadata: { importedNewsId: insertedId, reason: duplicate.reason },
        });
        continue;
      }

      try {
        await ctx.db.insert('importedNews', {
          sourceId,
          guid: item.guid,
          originalUrl: item.link,
          originalTitle: sanitizeHtml(item.title),
          originalDescription: item.description ? sanitizeHtml(item.description) : undefined,
          originalAuthor: item.author,
          originalPublishedAt: item.publishedAt,
          originalImageUrl: item.imageUrl,
          videoUrl: item.videoUrl,
          language: pidgin ? 'pidgin' : 'en',
          status: 'IMPORTED',
          createdAt: now(),
          updatedAt: now(),
        });
        newStories += 1;
        await log(ctx, {
          sourceId,
          action: 'NEW_STORY_DETECTED',
          status: 'success',
          message: `New story detected: ${item.title.slice(0, 80)}`,
        });
      } catch (err) {
        failed += 1;
        await log(ctx, {
          sourceId,
          action: 'IMPORT_ERROR',
          status: 'error',
          message: `Failed to import "${item.title.slice(0, 80)}": ${err instanceof Error ? err.message : 'unknown error'}`,
        });
      }
    }

    await ctx.db.patch(sourceId, {
      lastSyncedAt: now(),
      lastSyncStatus: 'success',
      lastSyncError: undefined,
      lastSyncStats: {
        newStories,
        duplicates,
        failed,
        processingTimeMs: now() - startedAt,
      },
      updatedAt: now(),
    });

    await log(ctx, {
      sourceId,
      action: 'SOURCE_CHECK',
      status: 'success',
      message: `${sourceName} sync complete — ${newStories} new, ${duplicates} duplicates, ${failed} failed.`,
      metadata: { newStories, duplicates, failed, processingTimeMs: now() - startedAt },
    });

    if (newStories > 0) {
      await ctx.scheduler.runAfter(2000, internal.newsAutomation.processQueue, { batchSize: 2 });
    }

    return { newStories, duplicates, failed, processingTimeMs: now() - startedAt };
  },
});

/** Internal: process queued imported stories (batched, reschedules itself). */
export const processQueue = internalMutation({
  args: { batchSize: v.optional(v.number()) },
  handler: async (ctx, { batchSize }) => {
    await ensureSettingsDoc(ctx);
    const settings = await getSettingsDoc(ctx);

    // Recover items stuck in PROCESSING (e.g. a crashed action), but only
    // once they've been stuck long enough that an in-flight action can't
    // still be running for them.
    const stuckCutoff = now() - 2 * 60 * 1000;
    const stuck = await ctx.db
      .query('importedNews')
      .withIndex('by_status', (q) => q.eq('status', 'PROCESSING'))
      .order('asc')
      .take(50);
    for (const item of stuck) {
      if (item.updatedAt <= stuckCutoff) {
        await ctx.db.patch(item._id, { status: 'IMPORTED', updatedAt: now() });
      }
    }

    const batch = await ctx.db
      .query('importedNews')
      .withIndex('by_status', (q) => q.eq('status', 'IMPORTED'))
      .order('asc')
      .take(batchSize ?? 2);

    for (const imported of batch) {
      const source = await ctx.db.get(imported.sourceId);
      if (!source) continue;

      if (settings.aiProcessing) {
        await ctx.db.patch(imported._id, { status: 'PROCESSING', updatedAt: now() });
        await ctx.scheduler.runAfter(0, internal.newsAutomation.processItemAction, {
          importedNewsId: imported._id,
          sourceId: source._id,
          sourceName: source.name,
          defaultCategory: source.defaultCategory ?? 'Gaming News',
          material: {
            title: imported.originalTitle,
            description: imported.originalDescription ?? '',
            author: imported.originalAuthor ?? '',
            publishedAt: imported.originalPublishedAt,
            sourceName: source.name,
            categories: [],
            videoUrl: imported.videoUrl,
            language: imported.language ?? 'en',
          },
        });
      } else {
        const description = imported.originalDescription ?? '';
        await ctx.db.insert('automatedNewsDrafts', {
          importedNewsId: imported._id,
          sourceId: source._id,
          title: imported.originalTitle,
          subtitle: undefined,
          summary: undefined,
          body: description ? `# ${imported.originalTitle}\n\n${description}` : `# ${imported.originalTitle}`,
          category: source.defaultCategory ?? 'Gaming News',
          tags: [],
          seoTitle: imported.originalTitle.slice(0, 60),
          seoDescription: undefined,
          slug: slugify(imported.originalTitle),
          featuredImage: imported.originalImageUrl,
          sourceImageUrl: imported.originalImageUrl,
          videoUrl: imported.videoUrl,
          language: imported.language ?? 'en',
          aiModel: undefined,
          status: (settings.defaultStatus as Doc<'automatedNewsDrafts'>['status']) ?? 'PENDING_REVIEW',
          createdAt: now(),
          updatedAt: now(),
        });
        await ctx.db.patch(imported._id, { status: 'PENDING_REVIEW', updatedAt: now() });
        await log(ctx, {
          sourceId: source._id,
          action: 'AI_DRAFT_CREATED',
          status: 'success',
          message: `Draft created for "${imported.originalTitle.slice(0, 80)}" (AI processing disabled).`,
        });
      }
    }

    const remaining = await ctx.db
      .query('importedNews')
      .withIndex('by_status', (q) => q.eq('status', 'IMPORTED'))
      .take(1);
    if (remaining.length > 0) {
      await ctx.scheduler.runAfter(2000, internal.newsAutomation.processQueue, { batchSize: 2 });
    }
  },
});

/** Action: run AI generation for a single imported story (slow external call). */
export const processItemAction = internalAction({
  args: {
    importedNewsId: v.id('importedNews'),
    sourceId: v.id('rssSources'),
    sourceName: v.string(),
    defaultCategory: v.string(),
    material: v.object({
      title: v.string(),
      description: v.string(),
      author: v.string(),
      publishedAt: v.optional(v.number()),
      sourceName: v.string(),
      categories: v.array(v.string()),
      videoUrl: v.optional(v.string()),
      language: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    let result: DraftGenerationResult | null = null;
    let error: string | null = null;
    try {
      result = await generateNewsDraft(args.material, { language: args.material.language });
    } catch (err) {
      error = err instanceof Error ? err.message : 'AI processing failed';
    }
    await ctx.runMutation(internal.newsAutomation.finishProcessing, {
      importedNewsId: args.importedNewsId,
      sourceId: args.sourceId,
      sourceName: args.sourceName,
      defaultCategory: args.defaultCategory,
      videoUrl: args.material.videoUrl,
      language: args.material.language,
      ...(result ? { result } : { error: error ?? 'AI processing failed' }),
    });
  },
});

/** Mutation: persist AI results into a draft (or mark failed). */
export const finishProcessing = internalMutation({
  args: {
    importedNewsId: v.id('importedNews'),
    sourceId: v.id('rssSources'),
    sourceName: v.string(),
    defaultCategory: v.string(),
    videoUrl: v.optional(v.string()),
    language: v.optional(v.string()),
    result: v.optional(
      v.object({
        headline: v.string(),
        subheadline: v.string(),
        summary: v.string(),
        body: v.string(),
        category: v.string(),
        tags: v.array(v.string()),
        seoTitle: v.string(),
        seoDescription: v.string(),
        slug: v.string(),
        keywords: v.array(v.string()),
      }),
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const imported = await ctx.db.get(args.importedNewsId);
    if (!imported) return;

    if (args.error || !args.result) {
      await ctx.db.patch(args.importedNewsId, { status: 'FAILED', updatedAt: now() });
      await log(ctx, {
        sourceId: args.sourceId,
        action: 'AI_ERROR',
        status: 'error',
        message: `AI processing failed for "${imported.originalTitle.slice(0, 80)}": ${args.error ?? 'unknown error'}`,
      });
      return;
    }

    const result = args.result;
    const settings = await getSettingsDoc(ctx);
    const defaultStatus = (settings.defaultStatus as Doc<'automatedNewsDrafts'>['status']) ?? 'PENDING_REVIEW';

    const draftId = await ctx.db.insert('automatedNewsDrafts', {
      importedNewsId: args.importedNewsId,
      sourceId: args.sourceId,
      title: result.headline || imported.originalTitle,
      subtitle: result.subheadline || undefined,
      summary: result.summary || undefined,
      body: sanitizeContent(result.body) || `# ${result.headline || imported.originalTitle}`,
      category: result.category || args.defaultCategory,
      tags: result.tags ?? [],
      seoTitle: result.seoTitle || undefined,
      seoDescription: result.seoDescription || undefined,
      slug: slugify(result.slug || result.headline),
      featuredImage: imported.originalImageUrl,
      sourceImageUrl: imported.originalImageUrl,
      videoUrl: args.videoUrl,
      language: args.language ?? 'en',
      aiModel: DEFAULT_MODEL,
      status: 'AI_DRAFT',
      createdAt: now(),
      updatedAt: now(),
    });

    await ctx.db.patch(args.importedNewsId, { status: defaultStatus, updatedAt: now() });

    await log(ctx, {
      sourceId: args.sourceId,
      action: 'AI_DRAFT_CREATED',
      status: 'success',
      message: `AI draft created: ${result.headline.slice(0, 80)}`,
      metadata: { draftId },
    });

    const autoPublish =
      settings.autoPublish &&
      (settings.trustedSources.includes(args.sourceName) ||
        settings.trustedCategories.includes(result.category));

    if (autoPublish) {
      await publishDraftInternal(ctx, draftId as Id<'automatedNewsDrafts'>, undefined, true);
    } else {
      await ctx.db.patch(draftId as Id<'automatedNewsDrafts'>, {
        status: defaultStatus,
        updatedAt: now(),
      });
    }
  },
});

async function publishDraftInternal(
  ctx: MutationCtx,
  draftId: Id<'automatedNewsDrafts'>,
  reviewerId?: Id<'users'>,
  autoPublish = false,
): Promise<Id<'articles'> | null> {
  const draft = await ctx.db.get(draftId);
  if (!draft) throw new Error('Draft not found.');
  if (draft.status === 'PUBLISHED' && draft.articleId) return draft.articleId;

  const imported = await ctx.db.get(draft.importedNewsId);
  const source = await ctx.db.get(draft.sourceId);
  if (!imported || !source) throw new Error('Draft references missing source data.');

  const body = sanitizeContent(draft.body);
  const words = body.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(words / 200));
  const baseSlug = draft.slug || slugify(draft.title);
  const slug = await ensureUniqueSlug(ctx, baseSlug);

  const articleId = await ctx.db.insert('articles', {
    title: draft.title,
    subtitle: draft.subtitle,
    slug,
    content: body,
    heroImage: draft.featuredImage ?? draft.sourceImageUrl ?? '',
    category: draft.category,
    authorName: 'Subteen Newsroom',
    publishDate: new Date().toISOString().slice(0, 10),
    readingTime,
    tags: draft.tags ?? [],
    status: 'published',
    views: 0,
    videoUrl: draft.videoUrl,
    language: draft.language ?? 'en',
    sourceName: source.name,
    sourceUrl: source.websiteUrl,
    originalUrl: imported.originalUrl,
    originalTitle: imported.originalTitle,
  });

  const publishedAt = now();
  await ctx.db.patch(draftId, {
    status: 'PUBLISHED',
    publishedAt,
    articleId,
    reviewedBy: reviewerId,
    reviewedAt: reviewerId ? publishedAt : draft.reviewedAt,
    updatedAt: publishedAt,
  });
  await ctx.db.patch(imported._id, { status: 'PUBLISHED', updatedAt: publishedAt });

  await log(ctx, {
    sourceId: source._id,
    action: 'STORY_PUBLISHED',
    status: 'success',
    message: `${autoPublish ? 'Auto-' : ''}Published "${draft.title.slice(0, 80)}"`,
    metadata: { draftId, articleId },
  });

  return articleId;
}

// ---------------------------------------------------------------------------
// Public queries (editor+)
// ---------------------------------------------------------------------------

export const overview = query({
  args: {},
  handler: async (ctx) => {
    const role = await getRole(ctx);
    if (!canAccessEditor(role)) {
      throw new Error('You need editor access to view the automation dashboard.');
    }
    const [sources, imported, drafts, logs] = await Promise.all([
      ctx.db.query('rssSources').collect(),
      ctx.db.query('importedNews').collect(),
      ctx.db.query('automatedNewsDrafts').collect(),
      ctx.db
        .query('automationLogs')
        .order('desc')
        .take(30),
    ]);

    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const discoveredToday = imported.filter((i) => i.createdAt >= startOfToday).length;

    const publishedFromAutomation = drafts.filter((d) => d.status === 'PUBLISHED').length;

    const lastSyncs = sources
      .filter((s) => s.lastSyncedAt)
      .map((s) => ({ name: s.name, at: s.lastSyncedAt as number, status: s.lastSyncStatus }));
    lastSyncs.sort((a, b) => (b.at ?? 0) - (a.at ?? 0));

    return {
      activeSources: sources.filter((s) => s.active).length,
      totalSources: sources.length,
      discoveredToday,
      awaitingProcessing: imported.filter((i) => i.status === 'IMPORTED').length,
      awaitingReview: drafts.filter((d) => d.status === 'PENDING_REVIEW').length,
      publishedFromAutomation,
      failedImports: imported.filter((i) => i.status === 'FAILED').length,
      lastSuccessfulSync: lastSyncs.find((l) => l.status === 'success')?.at ?? null,
      activityFeed: logs.map((entry) => ({
        _id: entry._id,
        sourceId: entry.sourceId,
        action: entry.action,
        status: entry.status,
        message: entry.message,
        createdAt: entry.createdAt,
        metadata: entry.metadata,
      })),
      sourcesWithIssues: sources.filter((s) => s.active && s.lastSyncStatus === 'error').length,
    };
  },
});

export const settings = query({
  args: {},
  handler: async (ctx) => {
    const role = await getRole(ctx);
    if (!canAccessEditor(role)) {
      throw new Error('You need editor access to view automation settings.');
    }
    const doc = await getSettingsDoc(ctx);
    const sources = await ctx.db.query('rssSources').collect();
    return {
      ...doc,
      knownSources: sources.map((s) => s.name),
      knownCategories: KNOWN_CATEGORIES,
    };
  },
});

export const listDrafts = query({
  args: { status: v.optional(automationStatusSchema) },
  handler: async (ctx, { status }) => {
    const role = await getRole(ctx);
    if (!canAccessEditor(role)) {
      throw new Error('You need editor access to view drafts.');
    }
    let drafts: Doc<'automatedNewsDrafts'>[];
    if (status) {
      drafts = await ctx.db
        .query('automatedNewsDrafts')
        .withIndex('by_status', (q) => q.eq('status', status))
        .order('desc')
        .take(100);
    } else {
      drafts = await ctx.db.query('automatedNewsDrafts').order('desc').take(150);
    }
    return Promise.all(
      drafts.map(async (draft) => {
        const source = await ctx.db.get(draft.sourceId);
        const imported = await ctx.db.get(draft.importedNewsId);
        return {
          ...draft,
          sourceName: source?.name ?? 'Unknown',
          sourceLogoUrl: source?.logoUrl,
          originalUrl: imported?.originalUrl,
          originalTitle: imported?.originalTitle,
        };
      }),
    );
  },
});

export const listImported = query({
  args: { status: v.optional(automationStatusSchema), take: v.optional(v.number()) },
  handler: async (ctx, { status, take }) => {
    const role = await getRole(ctx);
    if (!canAccessEditor(role)) {
      throw new Error('You need editor access to view imported stories.');
    }
    let imported: Doc<'importedNews'>[];
    if (status) {
      imported = await ctx.db
        .query('importedNews')
        .withIndex('by_status', (q) => q.eq('status', status))
        .order('desc')
        .take(take ?? 100);
    } else {
      imported = await ctx.db.query('importedNews').order('desc').take(take ?? 150);
    }
    return Promise.all(
      imported.map(async (entry) => {
        const source = await ctx.db.get(entry.sourceId);
        return { ...entry, sourceName: source?.name ?? 'Unknown', sourceLogoUrl: source?.logoUrl };
      }),
    );
  },
});

export const getDraft = query({
  args: { draftId: v.id('automatedNewsDrafts') },
  handler: async (ctx, { draftId }) => {
    const role = await getRole(ctx);
    if (!canAccessEditor(role)) {
      throw new Error('You need editor access to review drafts.');
    }
    const draft = await ctx.db.get(draftId);
    if (!draft) return null;
    const [imported, source, article] = await Promise.all([
      ctx.db.get(draft.importedNewsId),
      ctx.db.get(draft.sourceId),
      draft.articleId ? ctx.db.get(draft.articleId) : null,
    ]);
    return { draft, imported, source, article };
  },
});

// ---------------------------------------------------------------------------
// Editor review mutations
// ---------------------------------------------------------------------------

export const saveDraftEdits = mutation({
  args: {
    draftId: v.id('automatedNewsDrafts'),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    summary: v.optional(v.string()),
    body: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    slug: v.optional(v.string()),
    featuredImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireEditor(ctx);
    const { draftId, ...patch } = args;
    const draft = await ctx.db.get(draftId);
    if (!draft) throw new Error('Draft not found.');
    await ctx.db.patch(draftId, {
      ...patch,
      updatedAt: now(),
    });
    await log(ctx, {
      sourceId: draft.sourceId,
      action: 'EDITORIAL_REVIEW',
      status: 'info',
      message: `Draft saved: ${(patch.title ?? draft.title).slice(0, 80)}`,
    });
    return ctx.db.get(draftId);
  },
});

export const reviewDraft = mutation({
  args: {
    draftId: v.id('automatedNewsDrafts'),
    action: v.union(v.literal('approve'), v.literal('publish'), v.literal('reject'), v.literal('save')),
  },
  handler: async (ctx, { draftId, action }) => {
    const role = await requireEditor(ctx);
    const identity = await ctx.auth.getUserIdentity();
    let reviewerId: Id<'users'> | undefined;
    if (identity) {
      const user = await ctx.db
        .query('users')
        .withIndex('by_firebase_uid', (q) => q.eq('firebaseUid', identity.subject))
        .unique();
      reviewerId = user?._id;
    }

    const draft = await ctx.db.get(draftId);
    if (!draft) throw new Error('Draft not found.');

    const reviewedAt = now();

    if (action === 'approve') {
      await ctx.db.patch(draftId, { status: 'APPROVED', reviewedBy: reviewerId, reviewedAt, updatedAt: reviewedAt });
      await ctx.db.patch(draft.importedNewsId, { status: 'APPROVED', updatedAt: reviewedAt });
      await log(ctx, {
        sourceId: draft.sourceId,
        action: 'EDITORIAL_REVIEW',
        status: 'success',
        message: `Editorial review completed — approved: ${draft.title.slice(0, 80)}`,
        metadata: { role },
      });
      return ctx.db.get(draftId);
    }

    if (action === 'publish') {
      await ctx.db.patch(draftId, { status: 'APPROVED', reviewedBy: reviewerId, reviewedAt, updatedAt: reviewedAt });
      const articleId = await publishDraftInternal(ctx, draftId, reviewerId, false);
      return { articleId };
    }

    if (action === 'reject') {
      await ctx.db.patch(draftId, { status: 'REJECTED', reviewedBy: reviewerId, reviewedAt, updatedAt: reviewedAt });
      await ctx.db.patch(draft.importedNewsId, { status: 'REJECTED', updatedAt: reviewedAt });
      await log(ctx, {
        sourceId: draft.sourceId,
        action: 'EDITORIAL_REVIEW',
        status: 'warning',
        message: `Draft rejected: ${draft.title.slice(0, 80)}`,
      });
      return ctx.db.get(draftId);
    }

    return ctx.db.get(draftId);
  },
});

export const retryDraft = mutation({
  args: { importedNewsId: v.id('importedNews') },
  handler: async (ctx, { importedNewsId }) => {
    await requireEditor(ctx);
    const imported = await ctx.db.get(importedNewsId);
    if (!imported) throw new Error('Imported story not found.');
    if (imported.status !== 'FAILED' && imported.status !== 'IMPORTED') {
      throw new Error('Only failed or pending stories can be retried.');
    }
    const source = await ctx.db.get(imported.sourceId);
    if (!source) throw new Error('Source not found.');

    await ctx.db.patch(importedNewsId, { status: 'PROCESSING', updatedAt: now() });
    await ctx.scheduler.runAfter(0, internal.newsAutomation.processItemAction, {
      importedNewsId,
      sourceId: source._id,
      sourceName: source.name,
      defaultCategory: source.defaultCategory ?? 'Gaming News',
      material: {
        title: imported.originalTitle,
        description: imported.originalDescription ?? '',
        author: imported.originalAuthor ?? '',
        publishedAt: imported.originalPublishedAt,
        sourceName: source.name,
        categories: [],
        videoUrl: imported.videoUrl,
        language: imported.language ?? 'en',
      },
    });
    await log(ctx, {
      sourceId: source._id,
      action: 'RETRY',
      status: 'info',
      message: `Retrying AI processing for "${imported.originalTitle.slice(0, 80)}".`,
    });
  },
});

// ---------------------------------------------------------------------------
// Featured image generation (editor+)
// ---------------------------------------------------------------------------

export const generateImage = mutation({
  args: {
    draftId: v.id('automatedNewsDrafts'),
    prompt: v.optional(v.string()),
  },
  handler: async (ctx, { draftId, prompt }) => {
    await requireEditor(ctx);
    const draft = await ctx.db.get(draftId);
    if (!draft) throw new Error('Draft not found.');
    await ctx.scheduler.runAfter(0, internal.newsAutomation.generateImageAction, {
      draftId,
      prompt:
        prompt ??
        `Editorial hero image for a gaming news article titled "${draft.title}". Original, high-quality, wide 16:9, no text.`,
    });
  },
});

export const generateImageAction = internalAction({
  args: {
    draftId: v.id('automatedNewsDrafts'),
    prompt: v.string(),
  },
  handler: async (ctx, { draftId, prompt }) => {
    const image = await generateFeaturedImage(prompt);
    let storageId: string | null = null;
    let error: string | null = null;
    if (image) {
      try {
        const binary = atob(image.base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: image.mimeType });
        storageId = await ctx.storage.store(blob);
      } catch (err) {
        error = err instanceof Error ? err.message : 'image upload failed';
      }
    }
    await ctx.runMutation(internal.newsAutomation.finishImage, {
      draftId,
      storageId,
      error,
    });
  },
});

export const finishImage = internalMutation({
  args: {
    draftId: v.id('automatedNewsDrafts'),
    storageId: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { draftId, storageId, error }) => {
    const draft = await ctx.db.get(draftId);
    if (!draft) return;
    if (!storageId || error) {
      await log(ctx, {
        sourceId: draft.sourceId,
        action: 'IMAGE_ERROR',
        status: 'error',
        message: `Image generation failed for "${draft.title.slice(0, 80)}": ${error ?? 'unknown error'}`,
      });
      return;
    }
    try {
      const url = await ctx.storage.getUrl(storageId as never);
      if (url) {
        await ctx.db.patch(draftId, { featuredImage: url, updatedAt: now() });
        await log(ctx, {
          sourceId: draft.sourceId,
          action: 'IMAGE_GENERATED',
          status: 'success',
          message: `Generated Subteen image for "${draft.title.slice(0, 80)}".`,
        });
      }
    } catch (err) {
      await log(ctx, {
        sourceId: draft.sourceId,
        action: 'IMAGE_ERROR',
        status: 'error',
        message: `Image processing failed for "${draft.title.slice(0, 80)}": ${err instanceof Error ? err.message : 'unknown error'}`,
      });
    }
  },
});

// ---------------------------------------------------------------------------
// Settings + scheduled sync (admin+ / internal)
// ---------------------------------------------------------------------------

export const updateSettings = mutation({
  args: {
    syncFrequencyMinutes: v.optional(v.number()),
    aiProcessing: v.optional(v.boolean()),
    autoPublish: v.optional(v.boolean()),
    trustedSources: v.optional(v.array(v.string())),
    trustedCategories: v.optional(v.array(v.string())),
    autoApprove: v.optional(v.boolean()),
    autoApproveDelayMinutes: v.optional(v.number()),
    defaultStatus: v.optional(v.string()),
    maxStoriesPerSync: v.optional(v.number()),
  },
  handler: async (ctx, patch) => {
    await requireAdmin(ctx);
    await ensureSettingsDoc(ctx);
    const existing = await ctx.db
      .query('automationSettings')
      .withIndex('by_key', (q) => q.eq('key', AUTOMATION_SETTINGS_KEY))
      .unique();
    if (!existing) throw new Error('Settings not found.');
    const updates: Record<string, unknown> = { ...patch };
    if (patch.autoApprove === true && !existing.autoApprove) {
      updates.autoApproveEnabledAt = now();
    }
    await ctx.db.patch(existing._id, { ...updates, updatedAt: now() });
    await log(ctx, {
      action: 'SETTINGS_CHANGED',
      status: 'info',
      message: 'Automation settings updated.',
      metadata: patch,
    });
    return ctx.db.get(existing._id);
  },
});

export const scheduledSync = internalMutation({
  args: {},
  handler: async (ctx) => {
    const settings = await getSettingsDoc(ctx);
    if (settings.syncFrequencyMinutes <= 0) {
      return { synced: 0 };
    }
    const frequencyMs = settings.syncFrequencyMinutes * 60 * 1000;
    const sources = await ctx.db
      .query('rssSources')
      .withIndex('by_active', (q) => q.eq('active', true))
      .collect();
    let synced = 0;
    for (const source of sources) {
      const last = source.lastSyncedAt ?? 0;
      if (now() - last >= frequencyMs) {
        try {
          await ctx.scheduler.runAfter(0, internal.newsAutomation.syncSource, { sourceId: source._id });
          synced += 1;
        } catch {
          // individual source failures must not stop the scheduler
        }
      }
    }
    return { synced };
  },
});

/** Internal: requeue FAILED imported stories back to IMPORTED and process them. */
export const retryFailedImports = internalMutation({
  args: {},
  handler: async (ctx) => {
    const failed = await ctx.db
      .query('importedNews')
      .withIndex('by_status', (q) => q.eq('status', 'FAILED'))
      .order('asc')
      .take(100);
    let requeued = 0;
    for (const item of failed) {
      await ctx.db.patch(item._id, { status: 'IMPORTED', updatedAt: now() });
      requeued += 1;
    }
    if (requeued > 0) {
      await ctx.scheduler.runAfter(0, internal.newsAutomation.processQueue, { batchSize: 2 });
    }
    return { requeued };
  },
});

/**
 * Internal: auto-approve & publish drafts that have been sitting in
 * PENDING_REVIEW for >= autoApproveDelayMinutes. Runs on a short cron.
 */
export const autoApproveDueDrafts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const settings = await getSettingsDoc(ctx);
    if (!settings.autoApprove) return { published: 0, reviewed: 0 };

    const delayMs = Math.max(1, settings.autoApproveDelayMinutes ?? DEFAULT_AUTO_APPROVE_DELAY_MINUTES) * 60 * 1000;
    const enabledAt = settings.autoApproveEnabledAt ?? 0;
    const cutoff = now() - delayMs;

    const drafts = await ctx.db
      .query('automatedNewsDrafts')
      .withIndex('by_status', (q) => q.eq('status', 'PENDING_REVIEW'))
      .order('asc')
      .take(25);

    let published = 0;
    let reviewed = 0;
    for (const draft of drafts) {
      if (draft.createdAt > cutoff) continue;
      if (draft.createdAt < enabledAt) continue;
      try {
        await publishDraftInternal(ctx, draft._id, undefined, true);
        published += 1;
      } catch {
        await ctx.db.patch(draft._id, {
          status: 'APPROVED',
          updatedAt: now(),
        });
        reviewed += 1;
      }
    }
    if (published > 0 || reviewed > 0) {
      await log(ctx, {
        action: 'AUTO_APPROVAL',
        status: 'info',
        message: `Auto-approval pass: ${published} published, ${reviewed} approved/reviewed.`,
      });
    }
    return { published, reviewed };
  },
});

/**
 * Internal: publish every draft currently in PENDING_REVIEW regardless of
 * age. Used by admins to bulk-clear the editorial review queue.
 */
export const publishAllPendingReview = internalMutation({
  args: {},
  handler: async (ctx) => {
    const drafts = await ctx.db
      .query('automatedNewsDrafts')
      .withIndex('by_status', (q) => q.eq('status', 'PENDING_REVIEW'))
      .order('asc')
      .take(1000);

    const results: {
      title: string;
      status: 'published' | 'failed';
      articleId?: Id<'articles'>;
      error?: string;
    }[] = [];
    let published = 0;
    for (const draft of drafts) {
      try {
        const articleId = await publishDraftInternal(ctx, draft._id);
        published += 1;
        results.push({ title: draft.title, status: 'published', articleId: articleId ?? undefined });
      } catch (e) {
        results.push({
          title: draft.title,
          status: 'failed',
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }
    if (drafts.length > 0) {
      await log(ctx, {
        action: 'BULK_PUBLISH',
        status: published > 0 ? 'success' : 'error',
        message: `Bulk publish pass: ${published} published, ${results.length - published} failed.`,
      });
    }
    return {
      total: drafts.length,
      published,
      failed: results.filter((r) => r.status === 'failed'),
      results,
    };
  },
});
