import { query, mutation, MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';

const MEDIA_FIELDS = v.union(v.literal('avatar'), v.literal('coverImage'));

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
