import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query('users').order('asc').collect();
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', email))
      .unique();
  },
});

export const getByFirebaseUid = query({
  args: { firebaseUid: v.string() },
  handler: async (ctx, { firebaseUid }) => {
    return ctx.db
      .query('users')
      .withIndex('by_firebase_uid', (q) => q.eq('firebaseUid', firebaseUid))
      .unique();
  },
});

export const upsertFromFirebase = mutation({
  args: {
    firebaseUid: v.string(),
    name: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_firebase_uid', (q) => q.eq('firebaseUid', args.firebaseUid))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email ?? existing.email,
      });
      return { id: existing._id, created: false };
    }
    const id = await ctx.db.insert('users', {
      firebaseUid: args.firebaseUid,
      name: args.name,
      email: args.email ?? '',
      role: 'user',
      status: 'active',
      joined: new Date().toISOString().slice(0, 10),
      articleCount: 0,
      bookmarks: [],
      readingHistory: [],
      preferences: { darkMode: true, newsletter: false },
    });
    return { id, created: true };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.optional(v.union(v.literal('admin'), v.literal('editor'), v.literal('user'))),
    status: v.optional(v.union(v.literal('active'), v.literal('suspended'))),
    joined: v.optional(v.string()),
    articleCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique();
    if (existing) {
      throw new Error('A user with this email already exists');
    }
    return ctx.db.insert('users', {
      name: args.name,
      email: args.email,
      role: args.role ?? 'user',
      status: args.status ?? 'active',
      joined: args.joined ?? new Date().toISOString().slice(0, 10),
      articleCount: args.articleCount ?? 0,
      bookmarks: [],
      readingHistory: [],
      preferences: { darkMode: true, newsletter: false },
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('users'),
    name: v.optional(v.string()),
    role: v.optional(v.union(v.literal('admin'), v.literal('editor'), v.literal('user'))),
    status: v.optional(v.union(v.literal('active'), v.literal('suspended'))),
    articleCount: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: { id: v.id('users') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
