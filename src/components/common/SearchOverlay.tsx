import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, X, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { cn } from '../../lib/utils';
import type { Article } from '../../types';
import { PILLARS } from '../../../convex/lib/taxonomy';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [pillar, setPillar] = useState('');
  const searchQuery = useQuery(
    api.articles.search,
    isOpen && query.trim() ? { query: query.trim(), pillar: pillar || undefined, take: 24 } : 'skip',
  );
  const games = useQuery(api.articles.listGames, isOpen ? {} : 'skip');
  const articles = (searchQuery ?? []) as unknown as Article[];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const filteredGames = query
    ? (games ?? []).filter(g => g.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl p-6 overflow-y-auto"
        >
          <div className="max-w-4xl mx-auto pt-20 space-y-12">
            <div className="flex items-center justify-between">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-500" size={32} />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search stories, games, authors..."
                  className="w-full bg-transparent border-none text-3xl md:text-5xl font-black text-white focus:outline-none pl-12 placeholder:text-zinc-800 tracking-tighter"
                />
              </div>
              <button
                onClick={onClose}
                className="p-4 bg-zinc-900 rounded-full text-white hover:bg-white hover:text-black transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Pillar Filter Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setPillar('')}
                className={cn(
                  'px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all',
                  pillar === '' ? 'bg-[#B8FF4D] text-black border-[#B8FF4D]' : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white',
                )}
              >
                All
              </button>
              {PILLARS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPillar(pillar === p ? '' : p)}
                  className={cn(
                    'px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all',
                    pillar === p ? 'bg-[#B8FF4D] text-black border-[#B8FF4D]' : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              <div className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600">ARTICLES</h3>
                <div className="space-y-6">
                  {articles.length > 0 ? (
                    articles.map(article => (
                      <Link
                        key={article.id}
                        to={`/article/${article.slug}`}
                        onClick={onClose}
                        className="group flex items-start gap-4"
                      >
                        <div className="w-12 h-12 bg-zinc-900 rounded-lg flex items-center justify-center text-zinc-600 group-hover:text-[#B8FF4D] group-hover:bg-[#B8FF4D]/10 transition-all shrink-0">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="text-white font-bold group-hover:text-[#B8FF4D] transition-colors leading-tight">{article.title}</h4>
                          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">
                            {article.category}
                            {article.subcategory ? ` · ${article.subcategory}` : ''}
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-zinc-600 text-sm">
                      {query ? (searchQuery === undefined ? 'Searching...' : 'No articles found.') : 'Start typing to search...'}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600">GAMES</h3>
                <div className="space-y-6">
                  {filteredGames.length > 0 ? (
                    filteredGames.map(game => (
                      <Link
                        key={game._id}
                        to={`/game/${game.slug}`}
                        onClick={onClose}
                        className="group flex items-center gap-4"
                      >
                        <div className="w-12 h-16 bg-zinc-900 rounded-lg overflow-hidden shrink-0">
                          <img src={game.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                          <h4 className="text-white font-bold group-hover:text-[#B8FF4D] transition-colors leading-tight">{game.title}</h4>
                          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">{game.publisher}</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-zinc-600 text-sm">{query ? 'No games found.' : 'Search for your favorite titles.'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            {!query && (
              <div className="pt-12 border-t border-white/5">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600 mb-8">TRENDING SEARCHES</h3>
                <div className="flex flex-wrap gap-4">
                  {['GTA VI', 'Elden Ring DLC', 'PS5 Pro', 'Nintendo Switch 2', 'Valorant Meta'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-6 py-3 bg-zinc-900 rounded-full text-sm font-bold text-white hover:bg-white hover:text-black transition-all"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
