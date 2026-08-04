import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {},
  handler: async (ctx) => {
    const tags = await ctx.db.query('tags').order('asc').collect();
    const articleCounts = new Map<string, number>();
    for (const tag of tags) {
      const count = await ctx.db
        .query('articles')
        .filter((q) => q.eq(q.field('status'), 'published'))
        .collect();
      articleCounts.set(
        tag._id,
        count.filter((a) => a.tags.includes(tag.name)).length,
      );
    }
    return tags.map((tag) => ({
      ...tag,
      articleCount: articleCounts.get(tag._id) ?? 0,
    }));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    status: v.union(v.literal('Active'), v.literal('Disabled')),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('tags')
      .withIndex('by_name', (q) => q.eq('name', args.name))
      .unique();
    if (existing) {
      throw new Error(`Tag "${args.name}" already exists`);
    }
    return ctx.db.insert('tags', args);
  },
});

export const update = mutation({
  args: {
    id: v.id('tags'),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    status: v.optional(v.union(v.literal('Active'), v.literal('Disabled'))),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id('tags') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const merge = mutation({
  args: {
    sourceId: v.id('tags'),
    targetName: v.string(),
  },
  handler: async (ctx, { sourceId, targetName }) => {
    const source = await ctx.db.get(sourceId);
    if (!source) throw new Error('Source tag not found');
    await ctx.db.delete(sourceId);
    return { merged: source.name, into: targetName };
  },
});
