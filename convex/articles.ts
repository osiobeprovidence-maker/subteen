import { query } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query('articles').order('desc').take(20);
  },
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return ctx.db
      .query('articles')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .unique();
  },
});

export const byCategory = query({
  args: { category: v.string() },
  handler: async (ctx, { category }) => {
    return ctx.db
      .query('articles')
      .withIndex('by_category', (q) => q.eq('category', category))
      .order('desc')
      .take(50);
  },
});

export const listGames = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query('games').order('desc').take(50);
  },
});
