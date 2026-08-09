import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ArticleCard } from '../components/common/ArticleCard';
import { CommunityImage } from '../components/common/CommunityImage';
import { usePageTitle } from '../hooks/usePageTitle';
import { Gamepad2, Users, Calendar, MapPin, User } from 'lucide-react';
import type { Article } from '../types';

export const CommunityPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const community = useQuery(api.communities.getBySlug, slug ? { slug } : 'skip');
  const postsQuery = useQuery(
    api.communities.postsByCommunity,
    community ? { communityId: community._id as any, take: 50 } : 'skip',
  );
  const posts = (postsQuery ?? []) as unknown as Article[];

  usePageTitle(community?.name);

  if (community === undefined) {
    return (
      <div className="pt-40 pb-40 text-center">
        <div className="w-8 h-8 border-2 border-[#B8FF4D] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (community === null) {
    return (
      <div className="pt-40 pb-40 text-center space-y-6">
        <h1 className="text-4xl font-black text-white">Community not found</h1>
        <Link to="/communities" className="text-[#B8FF4D] hover:underline font-bold">Browse all communities</Link>
      </div>
    );
  }

  const platform = community.platform?.toUpperCase();

  return (
    <div className="pb-32">
      {/* Hero */}
      <header className="relative">
        <div className="relative h-[45vh] min-h-[340px] max-h-[560px] w-full overflow-hidden">
          <CommunityImage
            src={community.coverImage}
            alt={community.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/40 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative -mt-20 sm:-mt-24 space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-zinc-500 text-xs font-bold uppercase tracking-widest">
              <Link to="/" className="hover:text-white">Home</Link>
              <span>/</span>
              <Link to="/communities" className="hover:text-white">Communities</Link>
              <span>/</span>
              <span className="text-[#B8FF4D]">{community.name}</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/10 bg-zinc-950 shrink-0">
                <CommunityImage
                  src={community.icon ?? community.coverImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-4">
                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase">
                  {community.name}
                </h1>
                {community.gameTitle && (
                  <p className="text-zinc-400 font-medium text-lg">
                    {community.gameTitle}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-400">
                  {platform && (
                    <span className="flex items-center gap-1.5">
                      <Gamepad2 size={13} className="text-[#B8FF4D]" /> {platform}
                    </span>
                  )}
                  {community.category && (
                    <span>{community.category}</span>
                  )}
                  {community.postCount !== undefined && (
                    <span className="flex items-center gap-1.5">
                      <Users size={13} className="text-[#B8FF4D]" />{' '}
                      {community.postCount} {community.postCount === 1 ? 'Story' : 'Stories'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* About + Game metadata */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-zinc-950 border border-white/5 rounded-[32px] p-8 sm:p-10">
            <h2 className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-4">About this community</h2>
            <p className="text-lg text-zinc-300 leading-relaxed font-medium">
              {community.description}
            </p>
          </div>

          <div className="flex items-center justify-between border-b border-white/5 pb-3 sm:pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
              <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-[#B8FF4D]" />
              LATEST FROM THIS COMMUNITY
            </h2>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
              {posts.map((article) => (
                <ArticleCard key={article.id} article={article} variant="compact" />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center space-y-4 bg-zinc-950 rounded-[40px] border border-white/5">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 mx-auto flex items-center justify-center text-zinc-600">
                <Gamepad2 size={24} />
              </div>
              <h3 className="text-xl font-black text-white">No stories yet</h3>
              <p className="text-zinc-500 text-sm">The first stories for this community will appear here.</p>
            </div>
          )}
        </div>

        <aside className="lg:col-span-4 space-y-6">
          {(community.releaseYear || community.setting || community.protagonist) && (
            <div className="bg-zinc-950 border border-white/5 rounded-[32px] p-8 space-y-6">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Quick Facts</h3>
              {community.releaseYear && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    <Calendar size={13} className="text-[#B8FF4D]" /> Release Year
                  </span>
                  <span className="text-sm font-bold text-white">{community.releaseYear}</span>
                </div>
              )}
              {community.setting && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    <MapPin size={13} className="text-[#B8FF4D]" /> Setting
                  </span>
                  <span className="text-sm font-bold text-white">{community.setting}</span>
                </div>
              )}
              {community.protagonist && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    <User size={13} className="text-[#B8FF4D]" /> Protagonist
                  </span>
                  <span className="text-sm font-bold text-white">{community.protagonist}</span>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
