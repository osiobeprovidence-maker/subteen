import { query, mutation, MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { canAccessAdmin } from './lib/roles';

const reportStatus = v.union(v.literal('pending'), v.literal('resolved'), v.literal('dismissed'));

async function getRole(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const user = await ctx.db
    .query('users')
    .withIndex('by_firebase_uid', (q) => q.eq('firebaseUid', identity.subject))
    .unique();
  return user?.role ?? null;
}

async function requireAdmin(ctx: MutationCtx) {
  const role = await getRole(ctx);
  if (!canAccessAdmin(role)) {
    throw new Error('You need admin access to do that.');
  }
}

/** Signed-in user submits a report against content. */
export const create = mutation({
  args: {
    reason: v.string(),
    description: v.optional(v.string()),
    targetType: v.string(),
    targetId: v.string(),
    targetTitle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('You must be signed in to report content.');
    }
    const reason = args.reason.trim();
    if (!reason) throw new Error('A reason is required.');
    if (!args.targetId.trim()) throw new Error('A target is required.');
    return ctx.db.insert('reports', {
      reason,
      description: args.description?.trim() || undefined,
      targetType: args.targetType,
      targetId: args.targetId,
      targetTitle: args.targetTitle?.trim() || undefined,
      reporterUserId: identity.subject,
      status: 'pending',
      createdAt: Date.now(),
    });
  },
});

/** Admin: all reports, newest first. */
export const list = query({
  args: { take: v.optional(v.number()) },
  handler: async (ctx, { take }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const user = await ctx.db
      .query('users')
      .withIndex('by_firebase_uid', (q) => q.eq('firebaseUid', identity.subject))
      .unique();
    if (!canAccessAdmin(user?.role)) return [];
    return ctx.db.query('reports').order('desc').take(take ?? 200);
  },
});

/** Admin: resolve or dismiss a report. */
export const updateStatus = mutation({
  args: {
    id: v.id('reports'),
    status: reportStatus,
    resolutionNote: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, resolutionNote }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error('Report not found.');
    const identity = await ctx.auth.getUserIdentity();
    await ctx.db.patch(id, {
      status,
      resolutionNote: resolutionNote?.trim() || undefined,
      resolvedAt: Date.now(),
      resolvedBy: identity?.email ?? identity?.name,
    });
  },
});
