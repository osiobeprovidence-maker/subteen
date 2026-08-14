import { v } from 'convex/values';
import { PILLARS, allSubcategories, LEGACY_GAMING_CATEGORIES } from './taxonomy';

/**
 * Shared status model for the news automation pipeline.
 * IMPORTED -> PROCESSING -> AI_DRAFT -> PENDING_REVIEW -> APPROVED -> PUBLISHED
 *                              |-> REJECTED
 *                              |-> FAILED
 */
export const automationStatusSchema = v.union(
  v.literal('IMPORTED'),
  v.literal('PROCESSING'),
  v.literal('AI_DRAFT'),
  v.literal('PENDING_REVIEW'),
  v.literal('APPROVED'),
  v.literal('PUBLISHED'),
  v.literal('REJECTED'),
  v.literal('FAILED'),
);

export type AutomationStatus =
  | 'IMPORTED'
  | 'PROCESSING'
  | 'AI_DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'FAILED';

export const DEFAULT_SYNC_FREQUENCY_MINUTES = 15;
export const DEFAULT_MAX_STORIES_PER_SYNC = 15;
export const DEFAULT_DRAFT_STATUS = 'PENDING_REVIEW';
export const DEFAULT_AUTO_APPROVE_DELAY_MINUTES = 30;

export const SYNC_FREQUENCY_OPTIONS = [
  { label: '5 minutes', value: 5 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '6 hours', value: 360 },
  { label: 'Manual only', value: 0 },
];

/**
 * Recognized Subteen categories the AI may classify into: every pillar plus
 * every approved subcategory (and legacy gaming values still in circulation).
 * The AI must never create arbitrary category names.
 */
export const KNOWN_CATEGORIES = [
  ...PILLARS,
  ...allSubcategories(),
  ...LEGACY_GAMING_CATEGORIES,
];

export const DEFAULT_RSS_SOURCES = [
  {
    name: 'IGN',
    feedUrl: 'https://feeds.ign.com/ign/all',
    websiteUrl: 'https://www.ign.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/IGN_2017_logo.svg/2560px-IGN_2017_logo.svg.png',
    description: 'Breaking gaming news, reviews and entertainment coverage.',
    defaultCategory: 'Gaming News',
    defaultSubcategory: 'Gaming News',
  },
  {
    name: 'GameSpot',
    feedUrl: 'https://www.gamespot.com/feeds/news/',
    websiteUrl: 'https://www.gamespot.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/GameSpot_Logo.svg/2560px-GameSpot_Logo.svg.png',
    description: 'News, reviews, and previews from GameSpot.',
    defaultCategory: 'Gaming News',
    defaultSubcategory: 'Gaming News',
  },
  {
    name: 'PC Gamer',
    feedUrl: 'https://www.pcgamer.com/rss/',
    websiteUrl: 'https://www.pcgamer.com',
    logoUrl: 'https://assetsio.reedpopcdn.com/pc-gamer-master-logo-square.png',
    description: 'The global authority on PC games.',
    defaultCategory: 'PC Gaming',
    defaultSubcategory: 'PC Gaming',
  },
  {
    name: 'Eurogamer',
    feedUrl: 'https://www.eurogamer.net/feed',
    websiteUrl: 'https://www.eurogamer.net',
    logoUrl: 'https://assetsio.reedpopcdn.com/eurogamer-logo.svg',
    description: 'European gaming news, reviews and opinion.',
    defaultCategory: 'Gaming News',
    defaultSubcategory: 'Gaming News',
  },
  {
    name: 'Rock Paper Shotgun',
    feedUrl: 'https://www.rockpapershotgun.com/feed',
    websiteUrl: 'https://www.rockpapershotgun.com',
    logoUrl: 'https://assetsio.reedpopcdn.com/rock-paper-shotgun-logo.svg',
    description: 'PC gaming news, reviews and guides.',
    defaultCategory: 'PC Gaming',
    defaultSubcategory: 'PC Gaming',
  },
];

export function sanitizeHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/** Strip HTML but keep it safe as markdown body content. */
export function sanitizeContent(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<link[\s\S]*?>/gi, '')
    .replace(/<meta[\s\S]*?>/gi, '')
    .trim();
}

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(a|an|the|and|or|of|to|in|on|for|with|at|by|from)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function titleSimilarity(a: string, b: string): number {
  const tokensA = new Set(normalizeTitle(a).split(' ').filter(Boolean));
  const tokensB = new Set(normalizeTitle(b).split(' ').filter(Boolean));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  const intersection = [...tokensA].filter((t) => tokensB.has(t)).length;
  const union = new Set([...tokensA, ...tokensB]).size;
  return intersection / union;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

export function isLikelyUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Validate an RSS feed URL. */
export function validateFeedUrl(value: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.includes('.');
  } catch {
    return false;
  }
}
