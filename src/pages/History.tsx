import React from 'react';
import { History as HistoryIcon, Trash2, Clock } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Article } from '../types';

export const ReadingHistory = () => {
  const { dbUser } = useAuth();
  const ids = (dbUser?.readingHistory ?? []) as any[];
  const savedQuery = useQuery(api.articles.byIds, { ids });
  const clearHistory = useMutation(api.users.clearHistory);
  const historyArticles = (savedQuery ?? []) as unknown as Article[];

  const handleClear = async () => {
    if (!dbUser) return;
    await clearHistory({ userId: dbUser._id });
  };

  return (
    <div className="pb-32 pt-32 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center justify-between border-b border-white/5 pb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter">History</h1>
            <p className="text-zinc-500 mt-2 font-medium">Keep track of everything you've read.</p>
          </div>
          {historyArticles.length > 0 && (
            <button onClick={handleClear} className="flex items-center gap-2 text-xs font-black text-zinc-500 hover:text-red-500 uppercase tracking-widest transition-colors">
              <Trash2 size={14} /> Clear History
            </button>
          )}
        </div>
        
        {historyArticles.length > 0 ? (
          <div className="space-y-6">
            {historyArticles.map(article => (
              <div key={article.id} className="flex flex-col md:flex-row gap-6 p-6 bg-zinc-950 border border-white/5 rounded-[24px] group hover:border-[#B8FF4D]/30 transition-all">
                <Link to={`/article/${article.slug}`} className="w-full md:w-56 aspect-[16/10] sm:aspect-video rounded-xl overflow-hidden shrink-0 bg-zinc-900">
                  <img src={article.heroImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={article.title} />
                </Link>
                <div className="flex-1 flex flex-col justify-center gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-[#B8FF4D] uppercase tracking-widest">{article.category}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-800" />
                    <span className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                      <Clock size={12} /> {article.readingTime} min read
                    </span>
                  </div>
                  <Link to={`/article/${article.slug}`}>
                    <h3 className="text-xl font-bold text-white group-hover:text-[#B8FF4D] transition-colors leading-tight">{article.title}</h3>
                  </Link>
                  <p className="text-sm text-zinc-500 mt-1">Read 2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-zinc-950 rounded-[40px] border border-white/5">
            <HistoryIcon size={48} className="mx-auto text-zinc-800 mb-6" />
            <h2 className="text-xl font-bold text-white mb-2">Your history is empty</h2>
            <p className="text-zinc-500">Articles you finish reading will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
