import React from 'react';
import { ArrowRight, ChevronRight, Play, Trophy, Cpu, Gamepad2, Layers, MessagesSquare, Sparkles } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ArticleCard } from '../components/common/ArticleCard';
import { CommunityCard } from '../components/common/CommunityCard';
import { CommunityImage } from '../components/common/CommunityImage';
import { usePageTitle } from '../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import type { Article, Community } from '../types';
import { PILLARS } from '../../convex/lib/taxonomy';

const PILLAR_STRIP = [
  { name: 'Gaming', icon: Gamepad2, blurb: 'Games, esports & reviews' },
  { name: 'Anime', icon: Sparkles, blurb: 'Anime & manga' },
];

const NON_GAMING_PILLARS = PILLARS.filter((p) => p !== 'Gaming');

export const Home = () => {
  usePageTitle();
  const publishedQuery = useQuery(api.articles.listPublished, { take: 12 });
  const featuredQuery = useQuery(api.articles.featured, { take: 1 });
  const latestReviewsQuery = useQuery(api.articles.listPublishedByCategory, { category: 'Reviews', take: 3 });
  const communitiesQuery = useQuery(api.communities.listForPublic);
  const featuredCommunityQuery = useQuery(api.communities.featured);
  const pillarQueries = NON_GAMING_PILLARS.map((pillar) =>
    useQuery(api.articles.listByPillar, { pillar, take: 3 }),
  );
  const articles = (publishedQuery ?? []) as unknown as Article[];
  const featuredArticles = (featuredQuery ?? []) as unknown as Article[];
  const latestReviews = (latestReviewsQuery ?? []) as unknown as Article[];
  const communities = (communitiesQuery ?? []) as unknown as Community[];
  const featuredCommunity = featuredCommunityQuery as Community | undefined | null;

  const featuredArticle = featuredArticles[0] ?? articles[0];
  const latestNews = articles.filter(a => a.category !== 'Reviews' && a.language !== 'pidgin').slice(0, 4);
  const trendingStories = articles.filter(a => a.isTrending).slice(0, 4);
  const pidginArticles = articles.filter(a => a.language === 'pidgin').slice(0, 4);

  const pillarSections = NON_GAMING_PILLARS.map((pillar, i) => ({
    pillar,
    articles: (pillarQueries[i] ?? []) as unknown as Article[],
  })).filter((s) => s.articles.length > 0);

  return (
    <div className="space-y-16 sm:space-y-24 lg:space-y-32 pb-20 sm:pb-32">
      {/* Hero Story */}
      <section className="relative pt-24 sm:pt-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {featuredArticle ? (
            <ArticleCard article={featuredArticle} />
          ) : (
            <div className="py-24 text-center space-y-6 bg-zinc-950 rounded-[40px] border border-white/5">
              <h2 className="text-3xl font-black text-white">No articles published yet</h2>
              <p className="text-zinc-500">Publish your first story and it will appear here instantly.</p>
            </div>
          )}
        </div>
      </section>

      {/* Explore by Topic */}
      <section className="px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-3">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 sm:gap-3">
              <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-[#B8FF4D]" />
              EXPLORE BY TOPIC
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {PILLAR_STRIP.map((pillar) => (
              <Link
                key={pillar.name}
                to={`/category/${pillar.name.toLowerCase()}`}
                className="group bg-zinc-950 border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between gap-8 hover:border-[#B8FF4D]/50 transition-colors"
              >
                <pillar.icon size={18} className="text-[#B8FF4D] sm:w-6 sm:h-6" />
                <div>
                  <h3 className="text-sm sm:text-lg font-bold text-white group-hover:text-[#B8FF4D] transition-colors">
                    {pillar.name}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-zinc-600 mt-1 hidden sm:block">{pillar.blurb}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News & Trending */}
      <section className="px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16">
          <div className="lg:col-span-8 space-y-8 sm:space-y-12">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 sm:pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 sm:gap-3">
                <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-[#B8FF4D]" />
                LATEST NEWS
              </h2>
              <Link to="/category/news" className="text-xs sm:text-sm font-bold text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5 sm:gap-2">
                VIEW ALL <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
              {latestNews.length > 0 ? latestNews.map(article => (
                <ArticleCard key={article.id} article={article} variant="compact" />
              )) : (
                <p className="text-zinc-600 text-sm col-span-full">No articles published yet.</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8 sm:space-y-12">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 sm:pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-white">TRENDING</h2>
            </div>
            
            <div className="space-y-6 sm:space-y-8">
              {trendingStories.length > 0 ? trendingStories.map((article, index) => (
                <div key={article.id} className="flex gap-4 sm:gap-6 items-start group">
                  <span className="text-4xl sm:text-5xl font-black text-zinc-900 group-hover:text-zinc-800 transition-colors shrink-0">
                    0{index + 1}
                  </span>
                  <div className="space-y-1 sm:space-y-2">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#B8FF4D]">
                      {article.category}
                    </span>
                    <Link to={`/article/${article.slug}`}>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#B8FF4D] transition-colors leading-tight line-clamp-2">
                        {article.title}
                      </h3>
                    </Link>
                  </div>
                </div>
              )) : (
                <p className="text-zinc-600 text-sm">No trending stories yet.</p>
              )}
            </div>

            {/* Newsletter Mini */}
            <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6 sm:p-8 space-y-4 sm:space-y-6">
              <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">The day's best stories, direct to your inbox.</h3>
              <p className="text-[13px] sm:text-sm text-zinc-400">Join 50,000+ gamers who start their day with Subteen.</p>
              <form className="space-y-2 sm:space-y-3">
                <input 
                  type="email" 
                  placeholder="Email address"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B8FF4D] transition-colors"
                />
                <button className="w-full bg-[#B8FF4D] text-black py-3 rounded-xl font-bold hover:bg-white transition-colors text-sm sm:text-base">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Reviews */}
      <section className="bg-zinc-950 py-16 sm:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-10 sm:space-y-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">LATEST REVIEWS</h2>
            <Link to="/category/reviews" className="w-fit px-5 py-2.5 sm:px-6 sm:py-3 border border-white/10 rounded-full text-xs sm:text-sm font-bold text-white hover:bg-white hover:text-black transition-all">
              SEE ALL REVIEWS
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {latestReviewsQuery === undefined ? (
              <p className="text-zinc-600 text-sm">Loading...</p>
            ) : latestReviews.length > 0 ? latestReviews.map(article => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            )) : (
              <p className="text-zinc-600 text-sm">No reviews published yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* Subteen Pidgin */}
      <section className="px-4 sm:px-6">
        <div className="max-w-7xl mx-auto bg-zinc-950 border border-white/5 rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 space-y-8 sm:space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#B8FF4D] rounded-2xl flex items-center justify-center text-black shrink-0">
                <MessagesSquare size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter">SUBTEEEN PIDGIN</h2>
                <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 sm:mt-1">Di latest gaming gist for local Nigerians</p>
              </div>
            </div>
            <Link to="/pidgin" className="w-fit px-5 py-2.5 sm:px-6 sm:py-3 border border-white/10 rounded-full text-xs sm:text-sm font-bold text-white hover:bg-[#B8FF4D] hover:text-black transition-all">
              SEE ALL PIDGIN STORIES
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {pidginArticles.length > 0 ? pidginArticles.map(article => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            )) : (
              <p className="text-zinc-600 text-sm col-span-full">No pidgin stories yet — dem dey come soon.</p>
            )}
          </div>
        </div>
      </section>

      {/* Categories Grid (Bento) */}
      <section className="px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Link to="/category/esports" className="col-span-2 row-span-1 md:row-span-2 bg-zinc-900 rounded-3xl p-6 sm:p-8 flex flex-col justify-between group cursor-pointer border border-white/5 hover:border-[#B8FF4D]/50 transition-colors">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-800 rounded-xl sm:rounded-2xl flex items-center justify-center text-[#B8FF4D] mb-4 sm:mb-0">
              <Trophy size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2">ESPORTS</h3>
              <p className="text-[13px] sm:text-sm text-zinc-400 mb-4 sm:mb-6 max-w-xs line-clamp-2">Pro players, tournament results, and major team roster changes.</p>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-white/10 flex items-center justify-center text-white group-hover:bg-[#B8FF4D] group-hover:text-black transition-all">
                <ChevronRight size={18} className="sm:w-5 sm:h-5" />
              </div>
            </div>
          </Link>
          
          <Link to="/category/hardware" className="bg-zinc-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between group cursor-pointer border border-white/5 hover:border-[#B8FF4D]/50 transition-colors">
            <Cpu size={20} className="text-[#B8FF4D] sm:w-6 sm:h-6" />
            <h3 className="text-sm sm:text-xl font-bold text-white">HARDWARE</h3>
          </Link>
          
          <Link to="/category/patch-notes" className="bg-zinc-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between group cursor-pointer border border-white/5 hover:border-[#B8FF4D]/50 transition-colors">
            <Layers size={20} className="text-[#B8FF4D] sm:w-6 sm:h-6" />
            <h3 className="text-sm sm:text-xl font-bold text-white">PATCH NOTES</h3>
          </Link>
          
          <Link to="/category/trailers" className="bg-zinc-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between group cursor-pointer border border-white/5 hover:border-[#B8FF4D]/50 transition-colors">
            <Play size={20} className="text-[#B8FF4D] sm:w-6 sm:h-6" />
            <h3 className="text-sm sm:text-xl font-bold text-white">TRAILERS</h3>
          </Link>
          
          <Link to="/category/deals" className="bg-zinc-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col justify-between group cursor-pointer border border-white/5 hover:border-[#B8FF4D]/50 transition-colors">
            <Gamepad2 size={20} className="text-[#B8FF4D] sm:w-6 sm:h-6" />
            <h3 className="text-sm sm:text-xl font-bold text-white">DEALS</h3>
          </Link>
        </div>
      </section>

      {/* Non-Gaming Pillar Sections */}
      {pillarSections.map((section) => (
        <section key={section.pillar} className="px-4 sm:px-6">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-10">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 sm:pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 sm:gap-3">
                <div className="w-1.5 sm:w-2 h-6 sm:h-8 bg-[#B8FF4D]" />
                {section.pillar.toUpperCase()}
              </h2>
              <Link
                to={`/category/${section.pillar.toLowerCase()}`}
                className="text-xs sm:text-sm font-bold text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5 sm:gap-2"
              >
                VIEW ALL <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {section.articles.map((article) => (
                <ArticleCard key={article.id} article={article} variant="compact" />
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Popular Communities */}
      <section className="px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">POPULAR COMMUNITIES</h2>
            <Link to="/communities" className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">EXPLORE ALL</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {communities.slice(0, 6).map(community => (
              <CommunityCard key={community._id} community={community} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Community */}
      {featuredCommunity && (
        <section className="px-4 sm:px-6">
          <div className="max-w-7xl mx-auto bg-white rounded-[32px] sm:rounded-[40px] p-8 sm:p-12 lg:p-20 overflow-hidden relative">
            <div className="relative z-10 space-y-8 sm:space-y-12">
              <div className="space-y-3 sm:space-y-4">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-black/50">
                  {featuredCommunity.platform ?? 'FEATURED COMMUNITY'}
                </span>
                <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-black leading-[1.1] tracking-tighter">
                  {featuredCommunity.name}
                </h2>
                {featuredCommunity.gameTitle && (
                  <p className="text-black/50 font-bold uppercase tracking-widest text-sm sm:text-base">
                    {featuredCommunity.gameTitle}
                  </p>
                )}
              </div>
              
              <div className="flex flex-wrap gap-8 sm:gap-12">
                {featuredCommunity.releaseYear && (
                  <div className="space-y-0.5 sm:space-y-1">
                    <span className="text-3xl sm:text-5xl font-black text-black">{featuredCommunity.releaseYear}</span>
                    <p className="text-[10px] sm:text-sm font-bold text-black/40 uppercase tracking-widest">RELEASE YEAR</p>
                  </div>
                )}
                {featuredCommunity.setting && (
                  <div className="space-y-0.5 sm:space-y-1">
                    <span className="text-3xl sm:text-5xl font-black text-black">{featuredCommunity.setting}</span>
                    <p className="text-[10px] sm:text-sm font-bold text-black/40 uppercase tracking-widest">SETTING</p>
                  </div>
                )}
                {featuredCommunity.protagonist && (
                  <div className="space-y-0.5 sm:space-y-1">
                    <span className="text-3xl sm:text-5xl font-black text-black">{featuredCommunity.protagonist}</span>
                    <p className="text-[10px] sm:text-sm font-bold text-black/40 uppercase tracking-widest">PROTAGONIST</p>
                  </div>
                )}
              </div>

              <Link to={`/communities/${featuredCommunity.slug}`} className="inline-flex items-center gap-2 sm:gap-3 bg-black text-white px-8 py-4 sm:px-10 sm:py-5 rounded-full font-black text-base sm:text-lg hover:bg-[#B8FF4D] hover:text-black transition-all">
                GO TO COMMUNITY <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
            </div>
            
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 md:opacity-100">
               <CommunityImage 
                 src={featuredCommunity.coverImage}
                 className="w-full h-full object-cover"
                 alt={featuredCommunity.name}
               />
               <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent" />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
