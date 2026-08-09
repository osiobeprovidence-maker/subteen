import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ArticleCard } from '../components/common/ArticleCard';
import { Filter, SlidersHorizontal } from 'lucide-react';
import type { Article } from '../types';

export const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const publishedQuery = useQuery(api.articles.listPublished, { take: 100 });
  const articles = (publishedQuery ?? []) as unknown as Article[];
  
  // Normalize category string for filtering
  const displayCategory = category?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const normalizedCategory = category?.toLowerCase() ?? '';
  const filteredArticles = articles.filter(a => {
    if (normalizedCategory === 'news') return a.language !== 'pidgin' && a.category !== 'Reviews';
    if (normalizedCategory === 'reviews') return a.category === 'Reviews' && a.language !== 'pidgin';
    if (normalizedCategory === 'pidgin') return a.language === 'pidgin';
    return a.category.toLowerCase() === normalizedCategory ||
      a.tags.some(t => t.toLowerCase() === normalizedCategory);
  });

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
        </div>
      </header>

      {/* Filter Bar */}
      <div className="sticky top-[72px] z-40 bg-black/80 backdrop-blur-md border-b border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-6">
          <div className="flex items-center gap-8">
             {['All', 'Latest', 'Trending', 'Highest Rated'].map((filter, i) => (
               <button key={filter} className={`text-xs font-bold uppercase tracking-widest transition-colors ${i === 0 ? 'text-[#B8FF4D]' : 'text-zinc-500 hover:text-white'}`}>
                 {filter}
               </button>
             ))}
          </div>
          <button className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest">
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredArticles.map(article => (
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
