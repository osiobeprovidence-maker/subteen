import { query, mutation, internalMutation, QueryCtx, MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import { canAccessEditor } from './lib/roles';

const statusSchema = v.union(
  v.literal('published'),
  v.literal('draft'),
  v.literal('scheduled'),
);

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

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function ensureUniqueSlug(
  ctx: MutationCtx,
  base: string,
  excludeId?: Id<'articles'>,
): Promise<string> {
  let candidate = base;
  let i = 2;
  for (;;) {
    const existing = await ctx.db
      .query('articles')
      .withIndex('by_slug', (q) => q.eq('slug', candidate))
      .unique();
    if (!existing || existing._id === excludeId) return candidate;
    candidate = `${base}-${i}`;
    i += 1;
  }
}

async function attachAuthor(ctx: QueryCtx, article: Doc<'articles'>) {
  if (article.authorName && !article.authorId) {
    return article;
  }
  let authorName: string | undefined = article.authorName;
  let authorAvatar: string | undefined = article.authorAvatar;
  if (article.authorId) {
    const author = await ctx.db.get(article.authorId);
    if (author) {
      authorName = author.name;
      authorAvatar = author.avatar;
    }
  }
  return { ...article, authorName, authorAvatar };
}

/** Attaches the linked community's public name/slug/icon so cards can link to it. */
async function attachCommunity(ctx: QueryCtx, article: Doc<'articles'>) {
  let communityName: string | undefined;
  let communitySlug: string | undefined;
  let communityIcon: string | undefined;
  if (article.communityId) {
    try {
      const community = await ctx.db.get(article.communityId as Id<'communities'>);
      if (community && community.status === 'published') {
        communityName = community.name;
        communitySlug = community.slug;
        communityIcon = community.icon;
      }
    } catch {
      // communityId may reference a removed or legacy entry
    }
  }
  return { ...article, communityName, communitySlug, communityIcon };
}

/** Card projection: drops the heavy `content` body used only by the article page. */
function toCard(article: Doc<'articles'>) {
  const { content: _content, ...card } = article;
  return { ...card, content: undefined };
}

export const listPublished = query({
  args: { take: v.optional(v.number()) },
  handler: async (ctx, { take }) => {
    const articles = await ctx.db
      .query('articles')
      .withIndex('by_status', (q) => q.eq('status', 'published'))
      .order('desc')
      .take(take ?? 50);
    return Promise.all(articles.map((a) => attachAuthor(ctx, a).then((a) => attachCommunity(ctx, a)).then(toCard)));
  },
});

export const featured = query({
  args: { take: v.optional(v.number()) },
  handler: async (ctx, { take }) => {
    const all = await ctx.db
      .query('articles')
      .withIndex('by_status', (q) => q.eq('status', 'published'))
      .order('desc')
      .take(50);
    const featuredOnes = all.filter((a) => a.isFeatured);
    const base = featuredOnes.length > 0 ? featuredOnes : all;
    return Promise.all(base.slice(0, take ?? 5).map((a) => attachAuthor(ctx, a).then((a) => attachCommunity(ctx, a)).then(toCard)));
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const article = await ctx.db
      .query('articles')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique();
    if (!article || article.status !== 'published') return null;
    return attachAuthor(ctx, article).then((a) => attachCommunity(ctx, a));
  },
});

export const getEditableBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const role = await getRole(ctx);
    if (!canAccessEditor(role)) return null;
    return ctx.db
      .query('articles')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique();
  },
});

export const getEditable = query({
  args: { id: v.id('articles') },
  handler: async (ctx, { id }) => {
    const role = await getRole(ctx);
    if (!canAccessEditor(role)) return null;
    return ctx.db.get(id);
  },
});

export const listAll = query({
  args: { take: v.optional(v.number()) },
  handler: async (ctx, { take }) => {
    const role = await getRole(ctx);
    if (!canAccessEditor(role)) {
      throw new Error('You need editor access to view all articles.');
    }
    return ctx.db.query('articles').order('desc').take(take ?? 100);
  },
});

export const counts = query({
  args: {},
  handler: async (ctx) => {
    const role = await getRole(ctx);
    if (!canAccessEditor(role)) {
      throw new Error('You need editor access to view statistics.');
    }
    const all = await ctx.db.query('articles').order('desc').take(1000);
    return {
      total: all.length,
      published: all.filter((a) => a.status === 'published').length,
      drafts: all.filter((a) => a.status === 'draft').length,
      scheduled: all.filter((a) => a.status === 'scheduled').length,
    };
  },
});

export const byIds = query({
  args: { ids: v.array(v.id('articles')) },
  handler: async (ctx, { ids }) => {
    const all = await Promise.all(ids.map((id) => ctx.db.get(id)));
    const published = all.filter((a): a is Doc<'articles'> => !!a && a.status === 'published');
    const sorted = ids
      .map((id) => published.find((a) => a._id === id))
      .filter((a): a is Doc<'articles'> => !!a);
    return Promise.all(sorted.map((a) => attachAuthor(ctx, a).then((a) => attachCommunity(ctx, a)).then(toCard)));
  },
});

export const byAuthor = query({
  args: { authorId: v.id('authors') },
  handler: async (ctx, { authorId }) => {
    const articles = await ctx.db
      .query('articles')
      .withIndex('by_author', (q) => q.eq('authorId', authorId))
      .order('desc')
      .take(100);
    const published = articles.filter((a) => a.status === 'published');
    return Promise.all(published.map((a) => attachAuthor(ctx, a).then((a) => attachCommunity(ctx, a)).then(toCard)));
  },
});

export const related = query({
  args: {
    category: v.string(),
    excludeId: v.optional(v.id('articles')),
  },
  handler: async (ctx, { category, excludeId }) => {
    const all = await ctx.db
      .query('articles')
      .withIndex('by_status', (q) => q.eq('status', 'published'))
      .order('desc')
      .take(50);
    const rel = all
      .filter((a) => a.category === category && a._id !== excludeId)
      .slice(0, 3);
    return Promise.all(rel.map((a) => attachAuthor(ctx, a).then((a) => attachCommunity(ctx, a)).then(toCard)));
  },
});

export const listGames = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query('games').order('desc').take(50);
  },
});

export const getGame = query({
  args: { id: v.union(v.id('games'), v.string()) },
  handler: async (ctx, { id }) => {
    if (id.startsWith('game_') || id.startsWith('g_')) {
      return ctx.db
        .query('games')
        .withIndex('by_slug', (q) => q.eq('slug', id))
        .first();
    }
    const byId = await ctx.db.get(id as Id<'games'>);
    if (byId) return byId;
    return ctx.db
      .query('games')
      .withIndex('by_slug', (q) => q.eq('slug', id))
      .first();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    subtitle: v.optional(v.string()),
    slug: v.optional(v.string()),
    content: v.string(),
    heroImage: v.optional(v.string()),
    category: v.string(),
    gameId: v.optional(v.string()),
    communityId: v.optional(v.string()),
    isFeatured: v.optional(v.boolean()),
    isTrending: v.optional(v.boolean()),
    reviewScore: v.optional(v.number()),
    videoUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    readingTime: v.optional(v.number()),
    publishDate: v.optional(v.string()),
    status: v.optional(statusSchema),
    scheduledFor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireEditor(ctx);
    const identity = await ctx.auth.getUserIdentity();
    let authorName: string | undefined;
    let authorAvatar: string | undefined;
    if (identity) {
      const user = await ctx.db
        .query('users')
        .withIndex('by_firebase_uid', (q) => q.eq('firebaseUid', identity.subject))
        .unique();
      if (user) {
        authorName = user.name;
        authorAvatar = user.avatar;
      }
    }
    const baseSlug = args.slug?.trim() || slugify(args.title) || `article-${Date.now()}`;
    const slug = await ensureUniqueSlug(ctx, baseSlug);
    const id = await ctx.db.insert('articles', {
      title: args.title,
      subtitle: args.subtitle,
      slug,
      content: args.content,
      heroImage: args.heroImage ?? '',
      category: args.category,
      authorName,
      authorAvatar,
      publishDate: args.publishDate ?? new Date().toISOString().slice(0, 10),
      readingTime: args.readingTime ?? 1,
      tags: args.tags ?? [],
      gameId: args.gameId,
      communityId: args.communityId,
      isFeatured: args.isFeatured,
      isTrending: args.isTrending,
      reviewScore: args.reviewScore,
      videoUrl: args.videoUrl,
      status: args.status ?? 'draft',
      scheduledFor: args.scheduledFor,
      views: 0,
    });
    return ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id('articles'),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    slug: v.optional(v.string()),
    content: v.optional(v.string()),
    heroImage: v.optional(v.string()),
    category: v.optional(v.string()),
    gameId: v.optional(v.string()),
    communityId: v.optional(v.string()),
    isFeatured: v.optional(v.boolean()),
    isTrending: v.optional(v.boolean()),
    reviewScore: v.optional(v.number()),
    videoUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    readingTime: v.optional(v.number()),
    publishDate: v.optional(v.string()),
    status: v.optional(statusSchema),
    scheduledFor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireEditor(ctx);
    const { id, slug, ...rest } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error('Article not found.');
    const patch: Record<string, unknown> = { ...rest };
    if (slug) {
      const trimmed = slug.trim();
      if (trimmed) patch.slug = await ensureUniqueSlug(ctx, trimmed, id);
    }
    if (rest.status === 'published' && !existing.publishDate) {
      patch.publishDate = existing.publishDate ?? new Date().toISOString().slice(0, 10);
    }
    await ctx.db.patch(id, patch as never);
    return ctx.db.get(id);
  },
});

export const setStatus = mutation({
  args: { id: v.id('articles'), status: statusSchema },
  handler: async (ctx, { id, status }) => {
    await requireEditor(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error('Article not found.');
    await ctx.db.patch(id, {
      status,
      ...(status === 'published' && !existing.publishDate
        ? { publishDate: new Date().toISOString().slice(0, 10) }
        : {}),
    });
  },
});

export const remove = mutation({
  args: { id: v.id('articles') },
  handler: async (ctx, { id }) => {
    await requireEditor(ctx);
    await ctx.db.delete(id);
  },
});

export const incrementViews = mutation({
  args: { id: v.id('articles') },
  handler: async (ctx, { id }) => {
    const article = await ctx.db.get(id);
    if (!article) return;
    await ctx.db.patch(id, { views: (article.views ?? 0) + 1 });
  },
});

export const publishScheduled = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const all = await ctx.db.query('articles').collect();
    let published = 0;
    for (const a of all) {
      if (a.status !== 'scheduled') continue;
      if (a.scheduledFor !== undefined && a.scheduledFor > now) continue;
      await ctx.db.patch(a._id, {
        status: 'published',
        publishDate: a.publishDate || new Date(now).toISOString().slice(0, 10),
        scheduledFor: undefined,
      });
      published += 1;
    }
    return { published };
  },
});

export const backfillStatus = mutation({
  args: {
    status: v.optional(statusSchema),
  },
  handler: async (ctx, { status }) => {
    await requireEditor(ctx);
    const all = await ctx.db.query('articles').collect();
    let updated = 0;
    for (const a of all) {
      if (!a.status) {
        await ctx.db.patch(a._id, {
          status: status ?? 'published',
          views: a.views ?? 0,
        });
        updated += 1;
      }
    }
    return { updated };
  },
});
