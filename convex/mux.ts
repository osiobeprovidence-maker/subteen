import { mutation, MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import { canAccessEditor } from './lib/roles';

const MUX_API = 'https://api.mux.com';

function muxAuthHeader(): string {
  const tokenId = process.env.MUX_TOKEN_ID;
  const tokenSecret = process.env.MUX_TOKEN_SECRET;
  if (!tokenId || !tokenSecret) {
    throw new Error('Mux credentials are not configured.');
  }
  return 'Basic ' + Buffer.from(`${tokenId}:${tokenSecret}`).toString('base64');
}

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
}

export const createUpload = mutation({
  args: {},
  handler: async (ctx) => {
    await requireEditor(ctx);
    const res = await fetch(`${MUX_API}/video/v1/uploads`, {
      method: 'POST',
      headers: {
        Authorization: muxAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cors_origin: '*',
        timeout: '86400',
        new_asset_settings: {
          playback_policy: ['public'],
          mp4_support: 'standard',
        },
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to create Mux upload (${res.status}).`);
    }
    const json = await res.json();
    return json.data as { id: string; url: string; status: string };
  },
});

export const refreshUpload = mutation({
  args: { uploadId: v.string() },
  handler: async (ctx, { uploadId }) => {
    await requireEditor(ctx);
    const res = await fetch(`${MUX_API}/video/v1/uploads/${uploadId}`, {
      headers: { Authorization: muxAuthHeader() },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch Mux upload (${res.status}).`);
    }
    const json = await res.json();
    return json.data as { id: string; status: string; asset_id?: string; error?: unknown };
  },
});

export const getPlaybackId = mutation({
  args: { assetId: v.string() },
  handler: async (ctx, { assetId }) => {
    await requireEditor(ctx);
    const res = await fetch(`${MUX_API}/video/v1/assets/${assetId}/playback-ids`, {
      headers: { Authorization: muxAuthHeader() },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch Mux playback id (${res.status}).`);
    }
    const json = await res.json();
    const list = json.data as Array<{ id: string; policy: string }>;
    return list[0]?.id ?? null;
  },
});

export const saveVideo = mutation({
  args: {
    title: v.string(),
    uploadId: v.string(),
    assetId: v.optional(v.string()),
    playbackId: v.string(),
    articleId: v.optional(v.id('articles')),
  },
  handler: async (ctx, { title, uploadId, assetId, playbackId, articleId }) => {
    await requireEditor(ctx);
    const id = await ctx.db.insert('videos', {
      title,
      uploadId,
      assetId,
      playbackId,
      status: 'ready',
      articleId,
      createdAt: Date.now(),
    });
    return id;
  },
});
