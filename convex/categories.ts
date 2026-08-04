import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query('categories').order('asc').collect();
    return categories;
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query('categories')
      .filter((q) => q.eq(q.field('status'), 'Active'))
      .order('asc')
      .collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return ctx.db
      .query('categories')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    icon: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal('Active'), v.literal('Disabled')),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('categories', args);
  },
});

export const update = mutation({
  args: {
    id: v.id('categories'),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    icon: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal('Active'), v.literal('Disabled'))),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id('categories') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
