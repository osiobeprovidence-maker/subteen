import { query, mutation, MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import { canAccessAdmin } from './lib/roles';

const brandKind = v.union(v.literal('icon'), v.literal('dark'), v.literal('light'));

const BRAND_FIELD: Record<string, 'iconLogo' | 'darkLogo' | 'lightLogo'> = {
  icon: 'iconLogo',
  dark: 'darkLogo',
  light: 'lightLogo',
};

const DEFAULT_SETTINGS = {
  siteName: 'SUBTEEN',
  siteDescription: 'The ultimate gaming news publication.',
  language: 'English (US)',
  timezone: 'UTC-7 (Pacific)',
  accentColor: '#B8FF4D',
  featuredLayout: 'Hero',
  trendingLimit: 5,
  latestLimit: 10,
  autoApproveEnabled: false,
  autoApproveDelayMinutes: 5,
};

async function requireAdmin(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('You must be signed in.');
  }
  const user = await ctx.db
    .query('users')
    .withIndex('by_firebase_uid', (q) => q.eq('firebaseUid', identity.subject))
    .unique();
  if (!canAccessAdmin(user?.role)) {
    throw new Error('You need admin access to do that.');
  }
  return { user, identity };
}

async function upsertBrandField(
  ctx: MutationCtx,
  field: 'iconLogo' | 'darkLogo' | 'lightLogo',
  storageId: string | undefined,
  updatedBy: string,
) {
  const existing = await ctx.db.query('settings').first();
  const prev = existing?.[field];
  if (
    storageId &&
    typeof prev === 'string' &&
    prev !== storageId &&
    !prev.startsWith('http')
  ) {
    await ctx.storage.delete(prev as never);
  }
  const patch = {
    [field]: storageId,
    brandUpdatedAt: Date.now(),
    brandUpdatedBy: updatedBy,
  };
  if (existing) {
    await ctx.db.patch(existing._id, patch as never);
    return existing._id;
  }
  return ctx.db.insert('settings', { ...DEFAULT_SETTINGS, ...patch });
}

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
    autoApproveEnabled: v.optional(v.boolean()),
    autoApproveDelayMinutes: v.optional(v.number()),
  },
  handler: async (ctx, patch) => {
    const existing = await ctx.db.query('settings').first();
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }
    return ctx.db.insert('settings', { ...DEFAULT_SETTINGS, ...patch });
  },
});

/** Admin: store an uploaded brand asset (icon, dark wordmark or light wordmark). */
export const setBrandAsset = mutation({
  args: { kind: brandKind, storageId: v.string() },
  handler: async (ctx, { kind, storageId }) => {
    const { identity } = await requireAdmin(ctx);
    const field = BRAND_FIELD[kind];
    const updatedBy = identity.email ?? identity.name ?? 'Admin';
    await upsertBrandField(ctx, field, storageId, updatedBy);
  },
});

/** Admin: remove a brand asset and fall back to the default branding. */
export const clearBrandAsset = mutation({
  args: { kind: brandKind },
  handler: async (ctx, { kind }) => {
    const { identity } = await requireAdmin(ctx);
    const existing = await ctx.db.query('settings').first();
    if (!existing) return;
    const field = BRAND_FIELD[kind];
    const prev = existing[field];
    if (typeof prev === 'string' && !prev.startsWith('http')) {
      await ctx.storage.delete(prev as never);
    }
    const updatedBy = identity.email ?? identity.name ?? 'Admin';
    await ctx.db.patch(existing._id, {
      [field]: undefined,
      brandUpdatedAt: Date.now(),
      brandUpdatedBy: updatedBy,
    } as never);
  },
});
