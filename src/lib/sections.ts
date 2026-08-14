import { CATEGORY_SUBCATEGORIES } from '../../convex/lib/taxonomy';

export interface EditorialSectionRow {
  slug: string;
  name: string;
  active: boolean;
  isDefault: boolean;
  order: number;
}

export interface EditorialSectionNav extends EditorialSectionRow {
  path: string;
  subcategories: string[];
}

/** Where a section's landing page lives. Community and Events have dedicated hubs. */
export function sectionPath(slug: string): string {
  if (slug === 'community') return '/communities';
  if (slug === 'events') return '/events';
  return `/category/${slug}`;
}

/** Subcategories shown in the section dropdown (pillars only; Community has none). */
export function sectionSubcategories(name: string): string[] {
  return CATEGORY_SUBCATEGORIES[name] ?? [];
}

export function toSectionNav(section: EditorialSectionRow): EditorialSectionNav {
  return {
    ...section,
    path: sectionPath(section.slug),
    subcategories: sectionSubcategories(section.name),
  };
}
