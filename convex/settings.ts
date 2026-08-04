import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const get = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query('settings').first();
  },
});

export const update = mutation({
  args: {
    siteName: v.optional(v.string()),
    siteDescription: v.optional(v.string()),
    language: v.optional(v.string()),
    timezone: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    featuredLayout: v.optional(v.string()),
    trendingLimit: v.optional(v.number()),
    latestLimit: v.optional(v.number()),
  },
  handler: async (ctx, patch) => {
    const existing = await ctx.db.query('settings').first();
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }
    return ctx.db.insert('settings', {
      siteName: patch.siteName ?? 'SUBTEEN',
      siteDescription: patch.siteDescription ?? 'The ultimate gaming news publication.',
      language: patch.language ?? 'English (US)',
      timezone: patch.timezone ?? 'UTC-7 (Pacific)',
      accentColor: patch.accentColor ?? '#B8FF4D',
      featuredLayout: patch.featuredLayout ?? 'Hero',
      trendingLimit: patch.trendingLimit ?? 5,
      latestLimit: patch.latestLimit ?? 10,
    });
  },
});
