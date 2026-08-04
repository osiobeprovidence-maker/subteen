import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const listCampaigns = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query('adCampaigns').order('desc').collect();
  },
});

export const listPlacements = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query('adPlacements').order('asc').collect();
  },
});

export const createCampaign = mutation({
  args: {
    advertiser: v.string(),
    campaignName: v.string(),
    status: v.union(v.literal('Active'), v.literal('Paused'), v.literal('Ended')),
    clicks: v.number(),
    views: v.number(),
    ctr: v.string(),
    revenue: v.number(),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('adCampaigns', args);
  },
});

export const updateCampaign = mutation({
  args: {
    id: v.id('adCampaigns'),
    advertiser: v.optional(v.string()),
    campaignName: v.optional(v.string()),
    status: v.optional(v.union(v.literal('Active'), v.literal('Paused'), v.literal('Ended'))),
    clicks: v.optional(v.number()),
    views: v.optional(v.number()),
    ctr: v.optional(v.string()),
    revenue: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
  },
});

export const removeCampaign = mutation({
  args: { id: v.id('adCampaigns') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const createPlacement = mutation({
  args: {
    name: v.string(),
    enabled: v.boolean(),
    platform: v.string(),
    size: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert('adPlacements', args);
  },
});

export const updatePlacement = mutation({
  args: {
    id: v.id('adPlacements'),
    name: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    platform: v.optional(v.string()),
    size: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
  },
});

export const removePlacement = mutation({
  args: { id: v.id('adPlacements') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const campaigns = await ctx.db.query('adCampaigns').collect();
    const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
    const totalViews = campaigns.reduce((sum, c) => sum + c.views, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const activeAds = campaigns.filter((c) => c.status === 'Active').length;
    const avgCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';
    return {
      totalRevenue,
      totalViews,
      avgCtr: `${avgCtr}%`,
      activeAds,
    };
  },
});
