import { query, mutation, QueryCtx, MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Doc, Id } from './_generated/dataModel';
import { canAccessEditor } from './lib/roles';

const statusSchema = v.union(v.literal('published'), v.literal('draft'));

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

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

async function ensureUniqueSlug(
  ctx: MutationCtx,
  base: string,
  excludeId?: Id<'communities'>,
): Promise<string> {
  let candidate = base;
  let i = 2;
  for (;;) {
    const existing = await ctx.db
      .query('communities')
      .withIndex('by_slug', (q) => q.eq('slug', candidate))
      .unique();
    if (!existing || existing._id === excludeId) return candidate;
    candidate = `${base}-${i}`;
    i += 1;
  }
}

async function postCountFor(ctx: QueryCtx | MutationCtx, communityId: Id<'communities'>) {
  const posts = await ctx.db
    .query('articles')
    .withIndex('by_community', (q) => q.eq('communityId', communityId))
    .filter((q) => q.eq(q.field('status'), 'published'))
    .collect();
  return posts.length;
}

async function withCount(ctx: QueryCtx | MutationCtx, c: Doc<'communities'>) {
  const postCount = await postCountFor(ctx, c._id);
  return { ...c, postCount };
}

/** Public: all published communities, featured first, then newest. */
export const listForPublic = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('communities').order('desc').take(100);
    const published = all.filter((c) => c.status === 'published');
    const featured = published
      .filter((c) => c.featured)
      .sort((a, b) => b.updatedAt - a.updatedAt);
    const rest = published
      .filter((c) => !c.featured)
      .sort((a, b) => b.createdAt - a.createdAt);
    const ordered = [...featured, ...rest];
    return Promise.all(ordered.map((c) => withCount(ctx, c)));
  },
});

/** Public: featured published community (most recently featured), null fallback. */
export const featured = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('communities').order('desc').take(100);
    const published = all.filter((c) => c.status === 'published');
    const featuredOnes = published
      .filter((c) => c.featured)
      .sort((a, b) => b.updatedAt - a.updatedAt);
    const pick = featuredOnes[0] ?? published[0] ?? null;
    return pick ? withCount(ctx, pick) : null;
  },
});

/** Public: single published community by slug. */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const community = await ctx.db
      .query('communities')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique();
    if (!community || community.status !== 'published') return null;
    return withCount(ctx, community);
  },
});

/** Public: published posts tagged to a community, newest first. */
export const postsByCommunity = query({
  args: {
    communityId: v.id('communities'),
    take: v.optional(v.number()),
  },
  handler: async (ctx, { communityId, take }) => {
    const articles = await ctx.db
      .query('articles')
      .withIndex('by_community', (q) => q.eq('communityId', communityId))
      .order('desc')
      .take(take ?? 50);
    return articles.filter((a) => a.status === 'published');
  },
});

/** Public: communities by platform (for filter UI). */
export const listByPlatform = query({
  args: { platform: v.optional(v.string()) },
  handler: async (ctx, { platform }) => {
    const all = await ctx.db.query('communities').order('desc').take(100);
    const published = all.filter((c) => c.status === 'published');
    const filtered = platform
      ? published.filter((c) => (c.platform ?? '').toLowerCase() === platform.toLowerCase())
      : published;
    const ordered = filtered.sort((a, b) => {
      if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
      return b.updatedAt - a.updatedAt;
    });
    return Promise.all(ordered.map((c) => withCount(ctx, c)));
  },
});

/** Editor: all communities (for management + article editor picker). */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const role = await getRole(ctx);
    if (!canAccessEditor(role)) {
      throw new Error('You need editor access to view communities.');
    }
    const all = await ctx.db.query('communities').order('desc').take(200);
    return Promise.all(all.map((c) => withCount(ctx, c)));
  },
});

/** Editor: single community by id (for the edit form). */
export const get = query({
  args: { id: v.id('communities') },
  handler: async (ctx, { id }) => {
    const role = await getRole(ctx);
    if (!canAccessEditor(role)) return null;
    return ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.optional(v.string()),
    description: v.string(),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    platform: v.optional(v.string()),
    category: v.optional(v.string()),
    gameTitle: v.optional(v.string()),
    releaseYear: v.optional(v.string()),
    setting: v.optional(v.string()),
    protagonist: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    status: statusSchema,
  },
  handler: async (ctx, args) => {
    await requireEditor(ctx);
    const name = args.name.trim();
    if (!name) throw new Error('Community name is required.');
    if (!args.description.trim()) throw new Error('Description is required.');
    const now = Date.now();
    const baseSlug = args.slug?.trim() || slugify(name) || `community-${now}`;
    const slug = await ensureUniqueSlug(ctx, baseSlug);
    const id = await ctx.db.insert('communities', {
      name,
      slug,
      description: args.description.trim(),
      coverImage: args.coverImage?.trim() || undefined,
      icon: args.icon?.trim() || undefined,
      platform: args.platform?.trim() || undefined,
      category: args.category?.trim() || undefined,
      gameTitle: args.gameTitle?.trim() || undefined,
      releaseYear: args.releaseYear?.trim() || undefined,
      setting: args.setting?.trim() || undefined,
      protagonist: args.protagonist?.trim() || undefined,
      featured: args.featured ?? false,
      status: args.status,
      createdAt: now,
      updatedAt: now,
    });
    return ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id('communities'),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    platform: v.optional(v.string()),
    category: v.optional(v.string()),
    gameTitle: v.optional(v.string()),
    releaseYear: v.optional(v.string()),
    setting: v.optional(v.string()),
    protagonist: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    status: v.optional(statusSchema),
  },
  handler: async (ctx, { id, ...patch }) => {
    await requireEditor(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error('Community not found.');
    const clean: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(patch)) {
      if (typeof value === 'string') clean[key] = value.trim() || undefined;
      else clean[key] = value;
    }
    if (patch.slug) {
      const trimmed = patch.slug.trim();
      if (trimmed) clean.slug = await ensureUniqueSlug(ctx, trimmed, id);
    }
    if (clean.name === undefined && !existing.name) clean.name = undefined;
    clean.updatedAt = Date.now();
    await ctx.db.patch(id, clean as never);
    return ctx.db.get(id);
  },
});

export const setStatus = mutation({
  args: { id: v.id('communities'), status: statusSchema },
  handler: async (ctx, { id, status }) => {
    await requireEditor(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error('Community not found.');
    await ctx.db.patch(id, { status, updatedAt: Date.now() });
  },
});

export const setFeatured = mutation({
  args: { id: v.id('communities'), featured: v.boolean() },
  handler: async (ctx, { id, featured }) => {
    await requireEditor(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error('Community not found.');
    if (featured && existing.status !== 'published') {
      throw new Error('Only published communities can be featured.');
    }
    await ctx.db.patch(id, { featured, updatedAt: Date.now() });
  },
});

/** Editor: delete a community, unassigning (not deleting) its posts. */
export const remove = mutation({
  args: { id: v.id('communities') },
  handler: async (ctx, { id }) => {
    await requireEditor(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error('Community not found.');
    const linked = await ctx.db
      .query('articles')
      .withIndex('by_community', (q) => q.eq('communityId', id))
      .collect();
    for (const article of linked) {
      await ctx.db.patch(article._id, { communityId: undefined });
    }
    await ctx.db.delete(id);
    return { unassigned: linked.length };
  },
});
