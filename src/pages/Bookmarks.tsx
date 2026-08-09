import React from 'react';
import { Bookmark, Trash2 } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ArticleCard } from '../components/common/ArticleCard';
import { useAuth } from '../context/AuthContext';
import type { Article } from '../types';
import { usePageTitle } from '../hooks/usePageTitle';

export const Bookmarks = () => {
  const { dbUser } = useAuth();
  const ids = (dbUser?.bookmarks ?? []) as any[];
  const savedQuery = useQuery(api.articles.byIds, { ids });
  const clearBookmarks = useMutation(api.users.clearBookmarks);
  const bookmarkedArticles = (savedQuery ?? []) as unknown as Article[];

  usePageTitle('Bookmarks');

  const handleClear = async () => {
    if (!dbUser) return;
    await clearBookmarks({ userId: dbUser._id });
  };

  return (
    <div className="pb-32 pt-32 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center justify-between border-b border-white/5 pb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter">Bookmarks</h1>
            <p className="text-zinc-500 mt-2 font-medium">Stories you've saved to read later.</p>
          </div>
          {bookmarkedArticles.length > 0 && (
            <button onClick={handleClear} className="flex items-center gap-2 text-xs font-black text-zinc-500 hover:text-red-500 uppercase tracking-widest transition-colors">
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
