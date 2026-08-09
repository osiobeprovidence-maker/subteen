import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ArticleCard } from '../components/common/ArticleCard';
import { usePageTitle } from '../hooks/usePageTitle';
import { MessagesSquare } from 'lucide-react';
import type { Article } from '../types';

export const PidginPage = () => {
  usePageTitle('Subteen Pidgin');
  const publishedQuery = useQuery(api.articles.listPublished, { take: 100 });
  const articles = (publishedQuery ?? []) as unknown as Article[];
  const pidginArticles = articles.filter(a => a.language === 'pidgin');

  return (
    <div className="pb-32">
      {/* Header */}
      <header className="pt-40 pb-16 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-[#B8FF4D]">Pidgin</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#B8FF4D] rounded-2xl flex items-center justify-center text-black shrink-0">
              <MessagesSquare size={24} className="sm:w-7 sm:h-7" />
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase">
              Pidgin
            </h1>
          </div>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl">
            Di latest gaming gist for local Nigerians — stories wey dey talk am as we dey talk am.
          </p>
        </div>
      </header>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        {pidginArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {pidginArticles.map(article => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center space-y-6 bg-zinc-950 rounded-[40px] border border-white/5">
            <h3 className="text-2xl font-black text-white">No pidgin stories yet</h3>
            <p className="text-zinc-500">Dem dey come soon — check back later.</p>
            <Link to="/" className="inline-block px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-[#B8FF4D] transition-all">
              Return Home
            </Link>
          </div>
        )}
      </div>

      {pidginArticles.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-16 text-center text-[10px] font-black text-zinc-600 uppercase tracking-widest">
          Showing {pidginArticles.length} published {pidginArticles.length === 1 ? 'story' : 'stories'}
        </div>
      )}
    </div>
  );
};
