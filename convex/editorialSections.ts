import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { canAccessAdmin } from './lib/roles';
import { pillarOf } from './lib/taxonomy';
import type { QueryCtx, MutationCtx } from './_generated/server';

/**
 * Editorial sections drive the public header navigation. Each row is one
 * navigable section (a pillar or the Community hub). Visibility is controlled
 * by the `active` flag, persisted in the database and toggled by admins from
 * the admin dashboard. `isDefault` marks the sections that ship live from day
 * one; `order` controls their position in the public header.
 *
 * This is a navigation/visibility config for the existing taxonomy, not a
 * duplicate category system: section names still resolve to taxonomy pillars
 * (and their subcategories) or to the Community hub.
 */

export type EditorialSection = {
  slug: string;
  name: string;
  active: boolean;
  isDefault: boolean;
  order: number;
};

/** Initial set of editorial sections and their default activation. */
export const DEFAULT_SECTIONS: EditorialSection[] = [
  { slug: 'gaming', name: 'Gaming', active: true, isDefault: true, order: 0 },
  { slug: 'anime', name: 'Anime', active: true, isDefault: true, order: 1 },
  { slug: 'events', name: 'Events', active: true, isDefault: true, order: 2 },
  { slug: 'community', name: 'Community', active: true, isDefault: true, order: 3 },
  { slug: 'music', name: 'Music', active: false, isDefault: false, order: 4 },
  { slug: 'entertainment', name: 'Entertainment', active: false, isDefault: false, order: 5 },
  { slug: 'culture', name: 'Culture', active: false, isDefault: false, order: 6 },
  { slug: 'youth', name: 'Youth', active: false, isDefault: false, order: 7 },
];

async function getRole(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const user = await ctx.db
    .query('users')
    .withIndex('by_firebase_uid', (q) => q.eq('firebaseUid', identity.subject))
    .unique();
  return user?.role ?? null;
}

async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const role = await getRole(ctx);
  if (!canAccessAdmin(role)) {
    throw new Error('You need admin access to manage editorial sections.');
  }
  return role;
}

function toSectionShape(row: { slug: string; name: string; active: boolean; isDefault: boolean; order: number }): EditorialSection {
  return {
    slug: row.slug,
    name: row.name,
    active: row.active,
    isDefault: row.isDefault,
    order: row.order,
  };
}

/** All editorial sections ordered for display. Falls back to defaults until seeded. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const rows = await ctx.db.query('editorialSections').order('asc').collect();
    if (rows.length === 0) return DEFAULT_SECTIONS;
    return rows.map(toSectionShape);
  },
});

/** The sections that should appear in the public header, in nav order. */
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query('editorialSections')
      .withIndex('by_active', (q) => q.eq('active', true))
      .collect();
    if (rows.length === 0) return DEFAULT_SECTIONS.filter((s) => s.active);
    return rows
      .filter((s) => s.active)
      .sort((a, b) => a.order - b.order)
      .map(toSectionShape);
  },
});

/**
 * Published content counts per section (published only — drafts, pending,
 * rejected, scheduled and imported rows are never counted). Used by the admin
 * UI so an editor can see whether a section is actually alive before activating
 * it.
 */
export const publishedCounts = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const published = await ctx.db
      .query('articles')
      .withIndex('by_status', (q) => q.eq('status', 'published'))
      .take(5000);
    const counts: Record<string, number> = {};
    for (const article of published) {
      const pillar = pillarOf(article.category);
      counts[pillar] = (counts[pillar] ?? 0) + 1;
    }
    const communities = await ctx.db
      .query('communities')
      .withIndex('by_status', (q) => q.eq('status', 'published'))
      .take(5000);
    counts['Community'] = communities.length;
    return counts;
  },
});

/** Persist the default sections if any are missing. Idempotent and safe to re-run. */
export const ensureSections = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('editorialSections').collect();
    const existingSlugs = new Set(existing.map((s) => s.slug));
    let inserted = 0;
    for (const section of DEFAULT_SECTIONS) {
      if (existingSlugs.has(section.slug)) continue;
      await ctx.db.insert('editorialSections', section);
      inserted += 1;
    }
    return { inserted, total: DEFAULT_SECTIONS.length };
  },
});

/** Admin-only: activate or deactivate a section. Public header updates live. */
export const setActive = mutation({
  args: {
    id: v.id('editorialSections'),
    active: v.boolean(),
  },
  handler: async (ctx, { id, active }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error('Section not found.');
    await ctx.db.patch(id, { active });
  },
});
