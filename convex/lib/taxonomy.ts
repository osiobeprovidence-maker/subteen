/**
 * Subteen content taxonomy.
 *
 * The platform launches focused on two editorial pillars (Gaming and Anime).
 * The remaining pillars (Music, Entertainment, Culture, Events, Youth) keep
 * their approved subcategories below so they can be re-enabled later by
 * adding them back to PILLARS — no other change is required. Legacy gaming
 * categories that predate this taxonomy are mapped back to the Gaming pillar
 * so existing articles, automation records and URLs keep working without any
 * data migration.
 *
 * This file has no Convex runtime imports so it can be shared by the backend
 * (convex) and the frontend (src) as the single source of truth.
 */

export const PILLARS = [
  'Gaming',
  'Anime',
] as const;

export type Pillar = (typeof PILLARS)[number];

export const DEFAULT_PILLAR = 'Gaming' as const;
export const DEFAULT_SUBCATEGORY = 'Gaming News' as const;

/** Approved subcategories per pillar. The AI may only select from these. */
export const CATEGORY_SUBCATEGORIES: Record<string, string[]> = {
  Gaming: [
    'Gaming News',
    'Reviews',
    'Esports',
    'Gaming Industry',
    'Releases',
    'Guides',
    'Hardware',
    'Patch Notes',
    'Deals',
    'Trailers',
  ],
  Anime: [
    'Anime News',
    'Anime Reviews',
    'Anime Releases',
    'Manga',
    'Anime Culture',
    'Cosplay',
    'Otaku Events',
  ],
  Music: [
    'Music News',
    'New Music',
    'Artists',
    'Albums & EPs',
    'Music Culture',
    'Concerts',
    'Festivals',
    'Interviews',
    'African Music',
  ],
  Entertainment: [
    'Movies',
    'TV & Streaming',
    'Celebrity & Creator Culture',
    'Entertainment News',
    'Reviews',
    'Trailers',
  ],
  Culture: [
    'African Youth Culture',
    'Internet Culture',
    'Viral Trends',
    'Fashion',
    'Lifestyle',
    'Relationships',
    'Social Trends',
  ],
  Events: [
    'Concerts',
    'Gaming Events',
    'Anime Events',
    'Otaku Events',
    'Campus Events',
    'Festivals',
    'Creator Events',
    'Cultural Events',
  ],
  Youth: [
    'School & Campus',
    'Youth Issues',
    'Technology',
    'AI',
    'Apps',
    'Social Media',
    'Young Creators',
    'Business',
    'Careers',
    'Opinions',
  ],
};

/**
 * Legacy gaming category values still present in existing data. They resolve
 * to the Gaming pillar and are treated as subcategories of it.
 */
export const LEGACY_GAMING_CATEGORIES = [
  'News',
  'Guides',
  'Features',
  'Esports',
  'Industry',
  'Deals',
  'Trailers',
  'Patch Notes',
  'Hardware',
  'Opinion',
  'Gaming News',
  'PlayStation',
  'Xbox',
  'Nintendo',
  'PC Gaming',
  'Mobile Gaming',
  'Game Releases',
  'Updates',
  'Business',
];

export function isPillar(value: string | undefined | null): value is Pillar {
  return !!value && (PILLARS as readonly string[]).includes(value);
}

/** Resolve any stored category string to a pillar (defaults to Gaming). */
export function pillarOf(category: string | undefined | null): string {
  if (isPillar(category)) return category;
  if (category && LEGACY_GAMING_CATEGORIES.includes(category)) return 'Gaming';
  return DEFAULT_PILLAR;
}

export function subcategoriesOf(pillar: string): string[] {
  return CATEGORY_SUBCATEGORIES[pillar] ?? [];
}

/** All approved subcategories across every pillar (unique). */
export function allSubcategories(): string[] {
  return [...new Set(Object.values(CATEGORY_SUBCATEGORIES).flat())];
}

/** True when the subcategory is a valid choice for the given pillar. */
export function isValidSubcategory(pillar: string, subcategory?: string | null): boolean {
  if (!subcategory) return true;
  return (
    subcategoriesOf(pillar).includes(subcategory) ||
    (pillar === 'Gaming' && LEGACY_GAMING_CATEGORIES.includes(subcategory))
  );
}

/**
 * Normalize a (category, subcategory) pair to safe values. The category is
 * coerced to a valid pillar; the subcategory to a valid choice for it.
 */
export function normalizeCategoryPair(
  category?: string | null,
  subcategory?: string | null,
): { category: string; subcategory?: string } {
  const pillar = pillarOf(category);
  const sub = subcategory?.trim();
  if (sub && isValidSubcategory(pillar, sub)) {
    return { category: pillar, subcategory: sub };
  }
  return { category: pillar };
}

/** The label shown in the UI for a (category, subcategory) pair. */
export function displayCategory(category: string, subcategory?: string | null): string {
  return subcategory?.trim() || category;
}

/** The AI-facing taxonomy description used in classification prompts. */
export function taxonomyPrompt(): string {
  return PILLARS.map((pillar) => `${pillar}: ${subcategoriesOf(pillar).join(', ')}`).join('\n');
}
