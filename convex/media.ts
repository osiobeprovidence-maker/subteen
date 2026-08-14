import { query, mutation, MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { canAccessEditor } from './lib/roles';

const MEDIA_FIELDS = v.union(v.literal('avatar'), v.literal('coverImage'));

async function getRole(ctx: MutationCtx) {
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

async function requireOwnUser(ctx: MutationCtx, userId: Id<'users'>) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error('You must be signed in.');
  }
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error('User not found.');
  }
  if (user.firebaseUid && user.firebaseUid !== identity.subject) {
    throw new Error('You can only edit your own profile.');
  }
}

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('You must be signed in to upload images.');
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const getUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId as never);
  },
});

/** Resolve several storageIds to URLs in a single round trip. */
export const getUrls = query({
  args: { ids: v.array(v.string()) },
  handler: async (ctx, { ids }) => {
    const unique = [...new Set(ids)];
    const out: Record<string, string | null> = {};
    for (const id of unique) {
      out[id] = await ctx.storage.getUrl(id as never);
    }
    return out;
  },
});

export const saveImage = mutation({
  args: {
    userId: v.id('users'),
    field: MEDIA_FIELDS,
    storageId: v.string(),
  },
  handler: async (ctx, { userId, field, storageId }) => {
    await requireOwnUser(ctx, userId);
    const user = await ctx.db.get(userId);
    if (!user) throw new Error('User not found.');
    const prev = user[field];
    if (typeof prev === 'string' && prev !== storageId && !prev.startsWith('http')) {
      await ctx.storage.delete(prev as never);
    }
    await ctx.db.patch(userId, { [field]: storageId } as never);
  },
});

export const removeImage = mutation({
  args: {
    userId: v.id('users'),
    field: MEDIA_FIELDS,
  },
  handler: async (ctx, { userId, field }) => {
    await requireOwnUser(ctx, userId);
    const user = await ctx.db.get(userId);
    if (!user) throw new Error('User not found.');
    const prev = user[field];
    if (typeof prev === 'string' && !prev.startsWith('http')) {
      await ctx.storage.delete(prev as never);
    }
    await ctx.db.patch(userId, { [field]: undefined } as never);
  },
});

/** Editor/admin: record an uploaded file in the shared media library. */
export const saveAsset = mutation({
  args: {
    storageId: v.string(),
    name: v.string(),
    mimeType: v.string(),
    size: v.number(),
    kind: v.union(v.literal('image'), v.literal('video'), v.literal('file')),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireEditor(ctx);
    const identity = await ctx.auth.getUserIdentity();
    return ctx.db.insert('mediaAssets', {
      ...args,
      uploadedBy: identity?.email ?? identity?.name,
      createdAt: Date.now(),
    });
  },
});

/** Editor/admin: all media assets, newest first. */
export const listAssets = query({
  args: { take: v.optional(v.number()) },
  handler: async (ctx, { take }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query('users')
      .withIndex('by_firebase_uid', (q) => q.eq('firebaseUid', identity.subject))
      .unique();
    if (!canAccessEditor(user?.role)) return [];
    return ctx.db.query('mediaAssets').order('desc').take(take ?? 200);
  },
});

/** Editor/admin: delete an asset from storage and the library. */
export const removeAsset = mutation({
  args: { id: v.id('mediaAssets') },
  handler: async (ctx, { id }) => {
    await requireEditor(ctx);
    const asset = await ctx.db.get(id);
    if (!asset) throw new Error('Asset not found.');
    await ctx.storage.delete(asset.storageId as never);
    await ctx.db.delete(id);
  },
});
