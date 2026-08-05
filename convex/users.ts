import { query, mutation, MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { roleSchema, isSuperAdminEmail, SUPER_ADMIN_EMAIL } from './lib/roles';

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
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const firebaseUid = identity?.subject ?? args.firebaseUid;
    let existing = await ctx.db
      .query('users')
      .withIndex('by_firebase_uid', (q) => q.eq('firebaseUid', firebaseUid))
      .unique();

    if (!existing && args.email) {
      existing = await ctx.db
        .query('users')
        .withIndex('by_email', (q) => q.eq('email', args.email))
        .unique();
    }

    if (existing) {
      await ctx.db.patch(existing._id, {
        firebaseUid,
        name: args.name,
        email: args.email ?? existing.email,
        avatar: args.avatar ?? existing.avatar,
        ...(isSuperAdminEmail(args.email ?? existing.email) ? { role: 'super_admin' } : {}),
      });
      return (await ctx.db.get(existing._id))!;
    }

    const id = await ctx.db.insert('users', {
      firebaseUid,
      name: args.name,
      email: args.email ?? '',
      avatar: args.avatar,
      role: isSuperAdminEmail(args.email) ? 'super_admin' : 'member',
      status: 'active',
      joined: new Date().toISOString().slice(0, 10),
      articleCount: 0,
      bookmarks: [],
      readingHistory: [],
      preferences: { darkMode: true, newsletter: false },
    });
    return (await ctx.db.get(id))!;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.optional(roleSchema),
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
      role: isSuperAdminEmail(args.email) ? 'super_admin' : (args.role ?? 'member'),
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
    role: v.optional(roleSchema),
    status: v.optional(v.union(v.literal('active'), v.literal('suspended'))),
    articleCount: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, patch);
  },
});

export const updateProfile = mutation({
  args: {
    id: v.id('users'),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    preferences: v.optional(
      v.object({
        darkMode: v.optional(v.boolean()),
        newsletter: v.optional(v.boolean()),
      }),
    ),
  },
  handler: async (ctx, { id, name, avatar, coverImage, preferences }) => {
    await requireOwnUser(ctx, id);
    const patch: Record<string, unknown> = {};
    if (name !== undefined) patch.name = name;
    if (avatar !== undefined) patch.avatar = avatar;
    if (coverImage !== undefined) patch.coverImage = coverImage;
    if (preferences) {
      const current = await ctx.db.get(id);
      patch.preferences = {
        darkMode: preferences.darkMode ?? current?.preferences?.darkMode ?? true,
        newsletter: preferences.newsletter ?? current?.preferences?.newsletter ?? false,
      };
    }
    await ctx.db.patch(id, patch as never);
  },
});

export const setRole = mutation({
  args: {
    userId: v.id('users'),
    role: roleSchema,
  },
  handler: async (ctx, { userId, role }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('You must be signed in to change roles.');
    }
    if (!isSuperAdminEmail(identity.email)) {
      throw new Error('Only the super admin can assign or change roles.');
    }
    const target = await ctx.db.get(userId);
    if (!target) throw new Error('User not found.');
    if (target.role === 'super_admin' && role !== 'super_admin') {
      throw new Error('Cannot demote the super admin.');
    }
    await ctx.db.patch(userId, { role });
  },
});

export const ensureSuperAdmin = mutation({
  args: { email: v.optional(v.string()) },
  handler: async (ctx, { email }) => {
    const targetEmail = (email ?? SUPER_ADMIN_EMAIL).toLowerCase();
    const existing = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', targetEmail))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { role: 'super_admin' });
      return (await ctx.db.get(existing._id))!;
    }
    const id = await ctx.db.insert('users', {
      email: targetEmail,
      name: 'Super Admin',
      role: 'super_admin',
      status: 'active',
      joined: new Date().toISOString().slice(0, 10),
      articleCount: 0,
      bookmarks: [],
      readingHistory: [],
      preferences: { darkMode: true, newsletter: false },
    });
    return (await ctx.db.get(id))!;
  },
});

export const toggleBookmark = mutation({
  args: {
    userId: v.id('users'),
    articleId: v.id('articles'),
  },
  handler: async (ctx, { userId, articleId }) => {
    await requireOwnUser(ctx, userId);
    const user = await ctx.db.get(userId);
    if (!user) throw new Error('User not found.');
    const bookmarks = user.bookmarks ?? [];
    const has = bookmarks.some((id) => id === articleId);
    await ctx.db.patch(userId, {
      bookmarks: has
        ? bookmarks.filter((id) => id !== articleId)
        : [...bookmarks, articleId],
    });
  },
});

export const clearBookmarks = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    await requireOwnUser(ctx, userId);
    await ctx.db.patch(userId, { bookmarks: [] });
  },
});

export const markRead = mutation({
  args: {
    userId: v.id('users'),
    articleId: v.id('articles'),
  },
  handler: async (ctx, { userId, articleId }) => {
    await requireOwnUser(ctx, userId);
    const user = await ctx.db.get(userId);
    if (!user) return;
    const history = (user.readingHistory ?? []).filter((id) => id !== articleId);
    await ctx.db.patch(userId, {
      readingHistory: [articleId, ...history].slice(0, 50),
    });
  },
});

export const clearHistory = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    await requireOwnUser(ctx, userId);
    await ctx.db.patch(userId, { readingHistory: [] });
  },
});

export const remove = mutation({
  args: { id: v.id('users') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
