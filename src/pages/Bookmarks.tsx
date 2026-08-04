import React from 'react';
import { Bookmark, Trash2 } from 'lucide-react';
import { ARTICLES } from '../data/mockData';
import { ArticleCard } from '../components/common/ArticleCard';

export const Bookmarks = () => {
  // Mock data for user
  const bookmarkedArticles = ARTICLES.slice(0, 4);

  return (
    <div className="pb-32 pt-32 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center justify-between border-b border-white/5 pb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter">Bookmarks</h1>
            <p className="text-zinc-500 mt-2 font-medium">Stories you've saved to read later.</p>
          </div>
          {bookmarkedArticles.length > 0 && (
            <button className="flex items-center gap-2 text-xs font-black text-zinc-500 hover:text-red-500 uppercase tracking-widest transition-colors">
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </div>
        
        {bookmarkedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
            {bookmarkedArticles.map(article => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-zinc-950 rounded-[40px] border border-white/5">
            <Bookmark size={48} className="mx-auto text-zinc-800 mb-6" />
            <h2 className="text-xl font-bold text-white mb-2">No bookmarks yet</h2>
            <p className="text-zinc-500">Stories you bookmark will appear here for easy access.</p>
          </div>
        )}
      </div>
    </div>
  );
};
