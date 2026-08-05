import { query } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query('authors').order('desc').collect();
  },
});

export const get = query({
  args: { id: v.id('authors') },
  handler: async (ctx, { id }) => {
    return ctx.db.get(id);
  },
});
