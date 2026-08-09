import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { CommunityCard } from '../components/common/CommunityCard';
import { usePageTitle } from '../hooks/usePageTitle';
import { Search, MessagesSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Community } from '../types';

const PLATFORM_FILTERS = ['All', 'PC', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile'] as const;

export const CommunitiesPage = () => {
  usePageTitle('Communities');
  const communitiesQuery = useQuery(api.communities.listForPublic);
  const communities = (communitiesQuery ?? []) as unknown as Community[];
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState<(typeof PLATFORM_FILTERS)[number]>('All');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return communities.filter((c) => {
      const matchesPlatform =
        platform === 'All' || (c.platform ?? '').toLowerCase() === platform.toLowerCase();
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.gameTitle ?? '').toLowerCase().includes(q) ||
        (c.category ?? '').toLowerCase().includes(q);
      return matchesPlatform && matchesQuery;
    });
  }, [communities, query, platform]);

  return (
    <div className="pb-32">
      {/* Header */}
      <header className="pt-40 pb-16 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-[#B8FF4D]">Communities</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#B8FF4D] rounded-2xl flex items-center justify-center text-black shrink-0">
              <MessagesSquare size={24} className="sm:w-7 sm:h-7" />
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase">
              Communities
            </h1>
          </div>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl">
            The home of every game on Subteen. Dive into a community, find the latest stories, and
            follow the conversation.
          </p>
        </div>
      </header>

      {/* Search + Filters */}
      <div className="sticky top-[72px] z-40 bg-black/80 backdrop-blur-md border-b border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between py-6">
          <div className="relative w-full lg:w-96">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search communities..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#B8FF4D] transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {PLATFORM_FILTERS.map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={cn(
                  'px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors shrink-0',
                  platform === p
                    ? 'bg-[#B8FF4D] text-black'
                    : 'bg-zinc-900 text-zinc-500 hover:text-white',
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filtered.map((community) => (
              <CommunityCard key={community._id} community={community} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center space-y-6 bg-zinc-950 rounded-[40px] border border-white/5">
            <h3 className="text-2xl font-black text-white">No communities found</h3>
            <p className="text-zinc-500">Check back later — new communities are added all the time.</p>
            <Link to="/" className="inline-block px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-[#B8FF4D] transition-all">
              Return Home
            </Link>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-16 text-center text-[10px] font-black text-zinc-600 uppercase tracking-widest">
          Showing {filtered.length} published {filtered.length === 1 ? 'community' : 'communities'}
        </div>
      )}
    </div>
  );
};
