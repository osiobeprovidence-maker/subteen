import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ArticleCard } from '../components/common/ArticleCard';
import { usePageTitle } from '../hooks/usePageTitle';
import { cn } from '../lib/utils';
import type { Article } from '../types';
import { PILLARS, CATEGORY_SUBCATEGORIES, subcategoriesOf } from '../../convex/lib/taxonomy';

const slugifyLabel = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const ALL_SUBCATEGORY_ENTRIES = PILLARS.flatMap((pillar) =>
  (CATEGORY_SUBCATEGORIES[pillar] ?? []).map((subcategory) => ({ pillar, subcategory })),
);

const LEGACY_CATEGORIES: Record<string, string> = {
  news: 'News',
  reviews: 'Reviews',
  guides: 'Guides',
  esports: 'Esports',
  deals: 'Deals',
  trailers: 'Trailers',
  'patch-notes': 'Patch Notes',
  hardware: 'Hardware',
  opinion: 'Opinion',
  features: 'Features',
  industry: 'Industry',
  playstation: 'PlayStation',
  xbox: 'Xbox',
  nintendo: 'Nintendo',
  pc: 'PC Gaming',
  mobile: 'Mobile Gaming',
};

export const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const slug = (category ?? '').toLowerCase();

  const pillarMatch = PILLARS.find((p) => p.toLowerCase() === slug || slugifyLabel(p) === slug);
  const subMatch = ALL_SUBCATEGORY_ENTRIES.find((e) => slugifyLabel(e.subcategory) === slug);
  const legacyLabel = LEGACY_CATEGORIES[slug];

  const [activeSub, setActiveSub] = useState(subMatch?.subcategory ?? '');

  useEffect(() => {
    setActiveSub(subMatch?.subcategory ?? '');
  }, [slug]);

  const pillarQuery = useQuery(
    api.articles.listByPillar,
    pillarMatch ? { pillar: pillarMatch, subcategory: activeSub || undefined, take: 60 } : 'skip',
  );
  const publishedQuery = useQuery(api.articles.listPublished, pillarMatch ? 'skip' : { take: 100 });

  const displayCategory = pillarMatch ?? legacyLabel ?? (slug === 'pidgin' ? 'Pidgin' : slugifyLabel(slug));

  usePageTitle(displayCategory);

  let filteredArticles: Article[] = [];
  if (pillarMatch) {
    filteredArticles = (pillarQuery ?? []) as unknown as Article[];
  } else {
    const articles = (publishedQuery ?? []) as unknown as Article[];
    if (legacyLabel) {
      filteredArticles = articles.filter(
        (a) => a.language !== 'pidgin' && a.category === legacyLabel,
      );
    } else if (slug === 'pidgin') {
      filteredArticles = articles.filter((a) => a.language === 'pidgin');
    } else {
      const normalized = slugifyLabel(slug);
      filteredArticles = articles.filter(
        (a) =>
          slugifyLabel(a.category) === normalized ||
          slugifyLabel(a.subcategory ?? '') === normalized ||
          a.tags.some((t) => slugifyLabel(t) === normalized),
      );
    }
  }

  const subChips = pillarMatch ? (subcategoriesOf(pillarMatch) as string[]) : [];

  return (
    <div className="pb-32">
      {/* Header */}
      <header className="pt-40 pb-16 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-[#B8FF4D]">{displayCategory}</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase">
            {displayCategory}
          </h1>
          {pillarMatch && (
            <p className="text-sm text-zinc-500 max-w-2xl font-medium">
              {pillarMatch === 'Gaming'
                ? 'Games, consoles, esports, reviews and everything in between.'
                : pillarMatch === 'Anime'
                  ? 'Anime, manga and the culture around them.'
                  : pillarMatch === 'Music'
                    ? 'Music news, drops, artist profiles and the African sound.'
                    : pillarMatch === 'Entertainment'
                      ? 'Movies, TV, celebrities and pop culture.'
                      : pillarMatch === 'Culture'
                        ? 'African culture, people and ideas.'
                        : pillarMatch === 'Events'
                          ? 'Conferences, festivals, gigs and meetups across Africa.'
                          : 'For and about young people across Africa.'}
            </p>
          )}
        </div>
      </header>

      {/* Pillar Subcategory Chips */}
      {subChips.length > 0 && (
        <div className="border-b border-white/5 px-6">
          <div className="max-w-7xl mx-auto flex items-center gap-2 py-5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveSub('')}
              className={cn(
                'px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all shrink-0',
                activeSub === ''
                  ? 'bg-[#B8FF4D] text-black border-[#B8FF4D]'
                  : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white',
              )}
            >
              All
            </button>
            {subChips.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSub(activeSub === sub ? '' : sub)}
                className={cn(
                  'px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all shrink-0',
                  activeSub === sub
                    ? 'bg-[#B8FF4D] text-black border-[#B8FF4D]'
                    : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white',
                )}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center space-y-6 bg-zinc-950 rounded-[40px] border border-white/5">
            <h3 className="text-2xl font-black text-white">No articles published yet</h3>
            <p className="text-zinc-500">Check back later for fresh updates.</p>
            <Link to="/" className="inline-block px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-[#B8FF4D] transition-all">
              Return Home
            </Link>
          </div>
        )}
      </div>

      {filteredArticles.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-16 text-center text-[10px] font-black text-zinc-600 uppercase tracking-widest">
          Showing {filteredArticles.length} published {filteredArticles.length === 1 ? 'story' : 'stories'}
        </div>
      )}
    </div>
  );
};
