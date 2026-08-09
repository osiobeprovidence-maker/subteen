import { query, mutation, action, internalMutation } from './_generated/server';
import { v } from 'convex/values';
import { internal } from './_generated/api';
import type { Id } from './_generated/dataModel';
import { canAccessAdmin } from './lib/roles';
import { DEFAULT_RSS_SOURCES, validateFeedUrl } from './lib/automation';
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

async function requireAdmin(ctx: MutationCtx) {
  const role = await getRole(ctx);
  if (!canAccessAdmin(role)) {
    throw new Error('You need admin access to manage RSS sources.');
  }
  return role;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const role = await getRole(ctx);
    if (!canAccessAdmin(role)) {
      throw new Error('You need admin access to view RSS sources.');
    }
    const sources = await ctx.db.query('rssSources').order('asc').collect();
    return Promise.all(
      sources.map(async (source) => {
        const imported = await ctx.db
          .query('importedNews')
          .withIndex('by_source', (q) => q.eq('sourceId', source._id))
          .collect();
        const drafts = await ctx.db
          .query('automatedNewsDrafts')
          .withIndex('by_source', (q) => q.eq('sourceId', source._id))
          .collect();
        return {
          ...source,
          storiesImported: imported.length,
          publishedStories: drafts.filter((d) => d.status === 'PUBLISHED').length,
          pendingReview: drafts.filter((d) => d.status === 'PENDING_REVIEW').length,
        };
      }),
    );
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    feedUrl: v.string(),
    websiteUrl: v.string(),
    logoUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    defaultCategory: v.optional(v.string()),
    active: v.optional(v.boolean()),
    pidgin: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (!args.name.trim()) throw new Error('Source name is required.');
    if (!validateFeedUrl(args.feedUrl)) {
      throw new Error('Invalid RSS feed URL. Must be a valid http(s) URL.');
    }
    if (!validateFeedUrl(args.websiteUrl)) {
      throw new Error('Invalid website URL.');
    }
    const id = await ctx.db.insert('rssSources', {
      name: args.name.trim(),
      feedUrl: args.feedUrl.trim(),
      websiteUrl: args.websiteUrl.trim(),
      logoUrl: args.logoUrl?.trim() || undefined,
      description: args.description?.trim() || undefined,
      defaultCategory: args.defaultCategory?.trim() || undefined,
      active: args.active ?? true,
      pidgin: args.pidgin ?? false,
      createdAt: now(),
      updatedAt: now(),
    });
    return ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id('rssSources'),
    name: v.optional(v.string()),
    feedUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    defaultCategory: v.optional(v.string()),
    active: v.optional(v.boolean()),
    pidgin: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error('Source not found.');
    if (patch.feedUrl !== undefined && !validateFeedUrl(patch.feedUrl)) {
      throw new Error('Invalid RSS feed URL.');
    }
    if (patch.websiteUrl !== undefined && !validateFeedUrl(patch.websiteUrl)) {
      throw new Error('Invalid website URL.');
    }
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(patch)) {
      if (typeof value === 'string') clean[key] = value.trim();
      else clean[key] = value;
    }
    if ('logoUrl' in clean && clean.logoUrl === '') clean.logoUrl = undefined;
    if ('description' in clean && clean.description === '') clean.description = undefined;
    await ctx.db.patch(id, { ...clean, updatedAt: now() } as never);
    return ctx.db.get(id);
  },
});

export const setActive = mutation({
  args: {
    id: v.id('rssSources'),
    active: v.boolean(),
  },
  handler: async (ctx, { id, active }) => {
    await requireAdmin(ctx);
    await ctx.db.patch(id, { active, updatedAt: now() });
  },
});

export const remove = mutation({
  args: { id: v.id('rssSources') },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    const imported = await ctx.db
      .query('importedNews')
      .withIndex('by_source', (q) => q.eq('sourceId', id))
      .collect();
    for (const entry of imported) {
      await ctx.db.delete(entry._id);
    }
    const drafts = await ctx.db
      .query('automatedNewsDrafts')
      .withIndex('by_source', (q) => q.eq('sourceId', id))
      .collect();
    for (const draft of drafts) {
      if (draft.articleId) {
        await ctx.db.delete(draft.articleId);
      }
      await ctx.db.delete(draft._id);
    }
    const logs = await ctx.db
      .query('automationLogs')
      .withIndex('by_source', (q) => q.eq('sourceId', id))
      .collect();
    for (const entry of logs) {
      await ctx.db.delete(entry._id);
    }
    await ctx.db.delete(id);
  },
});

/** Trigger a manual sync for a source. Returns sync stats. */
/** Admin check usable from an action. */
export const requireAdminCheck = internalMutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
  },
});

/** Manually trigger a sync for a source. Runs as an action so it can reach the network. */
export const syncNow = action({
  args: { sourceId: v.id('rssSources') },
  handler: async (ctx, { sourceId }) => {
    await ctx.runMutation(internal.rssSources.requireAdminCheck, {});
    const source = await ctx.runMutation(internal.rssSources.getSourceForSync, { sourceId });
    if (!source) throw new Error('Source not found.');
    return ctx.runAction(internal.newsAutomation.syncSource, { sourceId });
  },
});

/** Internal: fetch a source's metadata for a pre-fetch admin check. */
export const getSourceForSync = internalMutation({
  args: { sourceId: v.id('rssSources') },
  handler: async (ctx, { sourceId }) => {
    const source = await ctx.db.get(sourceId);
    return source ? { _id: source._id, name: source.name } : null;
  },
});

/** Seed the five default publications if no sources exist yet. */
export const seedSources = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.query('rssSources').first();
    if (existing) return { seeded: false, count: 1 };
    let count = 0;
    for (const source of DEFAULT_RSS_SOURCES) {
      await ctx.db.insert('rssSources', {
        name: source.name,
        feedUrl: source.feedUrl,
        websiteUrl: source.websiteUrl,
        logoUrl: source.logoUrl,
        description: source.description,
        defaultCategory: source.defaultCategory,
        active: true,
        createdAt: now(),
        updatedAt: now(),
      });
      count += 1;
    }
    return { seeded: true, count };
  },
});

export const ensureDefaults = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('rssSources').first();
    if (existing) return { seeded: false };
    for (const source of DEFAULT_RSS_SOURCES) {
      await ctx.db.insert('rssSources', {
        name: source.name,
        feedUrl: source.feedUrl,
        websiteUrl: source.websiteUrl,
        logoUrl: source.logoUrl,
        description: source.description,
        defaultCategory: source.defaultCategory,
        active: true,
        createdAt: now(),
        updatedAt: now(),
      });
    }
    return { seeded: true };
  },
});
