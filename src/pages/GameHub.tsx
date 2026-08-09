import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ArticleCard } from '../components/common/ArticleCard';
import type { Article } from '../types';
import { 
  Gamepad2, 
  Info, 
  Star, 
  ChevronRight, 
  Play, 
  Clock, 
  Monitor, 
  Download, 
  Calendar,
  Share2,
  Heart,
  Globe,
  ExternalLink,
  ChevronDown,
  Trophy,
  History,
  ShieldCheck,
  Cpu,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { usePageTitle } from '../hooks/usePageTitle';

export const GameHub = () => {
  const { id } = useParams<{ id: string }>();
  const games = useQuery(api.articles.listGames);
  const publishedQuery = useQuery(api.articles.listPublished, { take: 100 });
  const articles = (publishedQuery ?? []) as unknown as Article[];
  // Match by ID or Slug
  const game = games?.find(g => g._id === id || g.slug === id);
  const [activeTab, setActiveTab] = React.useState('Overview');
  
  usePageTitle(game?.title ?? 'Games');
  
  if (!game) {
    return (
      <div className="pt-40 pb-40 text-center space-y-6">
        <h1 className="text-4xl font-black text-white">Game not found</h1>
        <Link to="/" className="text-[#B8FF4D] hover:underline font-bold">Go back home</Link>
      </div>
    );
  }

  const relatedArticles = articles.filter(a => a.gameId === game._id || a.gameId === game.slug);
  const news = relatedArticles.filter(a => a.category === 'News');
  const reviews = relatedArticles.filter(a => a.category === 'Reviews');
  const guides = relatedArticles.filter(a => a.category === 'Guides');

  const tabs = [
    'Overview', 
    'News', 
    'Reviews', 
    'Guides', 
    'Videos', 
    'Screenshots',
    'Timeline',
    'DLC',
    'Requirements'
  ];

  const renderOverview = () => (
    <div className="space-y-24">
      {/* About & Quick Info */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">About {game.title}</h2>
            <p className="text-xl text-zinc-400 leading-relaxed font-medium">
              {game.description}
            </p>
            <button className="text-[#B8FF4D] font-black text-xs uppercase tracking-widest hover:text-white transition-colors">Read Full Description</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-10 border-y border-white/5">
             <div className="space-y-2">
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Release Date</p>
               <p className="text-sm font-bold text-white">{game.releaseDate}</p>
             </div>
             <div className="space-y-2">
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Developer</p>
               <p className="text-sm font-bold text-white">{game.developer}</p>
             </div>
             <div className="space-y-2">
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Publisher</p>
               <p className="text-sm font-bold text-white">{game.publisher}</p>
             </div>
             <div className="space-y-2">
               <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">PEGI Rating</p>
               <p className="text-sm font-bold text-white">{game.pegiRating || '18+'}</p>
             </div>
          </div>

          {/* Latest News Preview */}
          <div className="space-y-10 pt-12">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">Latest Updates</h3>
              <button onClick={() => setActiveTab('News')} className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                View All News <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {news.slice(0, 2).map(a => <ArticleCard key={a.id} article={a} variant="compact" />)}
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-12">
          {/* Ad Slot */}
          <div className="aspect-[3/4] bg-zinc-950 border border-white/5 rounded-[40px] flex flex-col items-center justify-center p-8 text-center space-y-4">
             <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">Advertisement</span>
             <div className="w-full h-full bg-zinc-900/50 rounded-2xl border border-white/5 flex items-center justify-center italic text-zinc-700 text-sm">
               Premium Gaming Ad Slot
             </div>
          </div>

          <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 space-y-8">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Official Links</h4>
            <div className="space-y-4">
              {game.officialWebsite && (
                <a href={game.officialWebsite} target="_blank" rel="noreferrer" className="w-full flex items-center justify-between p-4 bg-zinc-900 rounded-2xl hover:bg-[#B8FF4D] hover:text-black transition-all group">
                  <span className="text-xs font-bold uppercase tracking-widest">Official Website</span>
                  <ExternalLink size={14} className="opacity-40 group-hover:opacity-100" />
                </a>
              )}
              <button className="w-full flex items-center justify-between p-4 bg-zinc-900 rounded-2xl hover:bg-white hover:text-black transition-all group">
                <span className="text-xs font-bold uppercase tracking-widest">Steam Store</span>
                <Globe size={14} className="opacity-40 group-hover:opacity-100" />
              </button>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );

  const renderTimeline = () => (
    <div className="max-w-3xl mx-auto py-12 space-y-12">
      <div className="relative pl-12 border-l border-white/10 space-y-24">
        {game.timeline?.map((item, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[53px] top-0 w-10 h-10 bg-black border border-white/20 rounded-full flex items-center justify-center text-[#B8FF4D] shadow-[0_0_20px_rgba(184,255,77,0.2)]">
              <History size={16} />
            </div>
            <div className="space-y-4">
              <span className="text-4xl font-black text-white/20 tracking-tighter">{item.year}</span>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">{item.event}</h3>
              <p className="text-zinc-500 leading-relaxed">Key milestone in the development cycle of {game.title}.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRequirements = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-12">
      <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-12 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
            <Cpu size={24} />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Minimum Specs</h3>
        </div>
        <ul className="space-y-4">
          {game.systemRequirements?.minimum.map((req, i) => (
            <li key={i} className="flex items-center gap-3 text-zinc-400 py-3 border-b border-white/5 last:border-0 text-sm font-medium">
              <ShieldCheck size={14} className="text-[#B8FF4D]" /> {req}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-12 space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-blue-400">
            <Monitor size={24} />
          </div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Recommended</h3>
        </div>
        <ul className="space-y-4">
          {game.systemRequirements?.recommended.map((req, i) => (
            <li key={i} className="flex items-center gap-3 text-zinc-400 py-3 border-b border-white/5 last:border-0 text-sm font-medium">
              <ShieldCheck size={14} className="text-blue-400" /> {req}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="pb-32 pt-12 md:pt-16 lg:pt-24">
      {/* Dynamic Hero Section */}
      <div className="relative h-[65vh] min-h-[500px] max-h-[750px] w-full overflow-hidden rounded-[48px] mx-auto max-w-[1600px] group/hero">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5 }}
          src={game.heroImage} 
          alt={game.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover/hero:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />
        
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto w-full px-6 md:px-12 lg:px-24">
            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr_280px] gap-8 lg:gap-16 items-center">
              {/* Box Art */}
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="hidden lg:block aspect-[2/3] rounded-[24px] overflow-hidden shadow-2xl border-2 border-white/10 relative group"
              >
                <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <button className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white">
                     <Play size={20} fill="white" />
                   </button>
                </div>
              </motion.div>
              
              {/* Main Info */}
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {game.genres?.map(g => (
                    <span key={g} className="px-4 py-1 bg-white/10 backdrop-blur-xl rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/10">
                      {g}
                    </span>
                  ))}
                  <span className="px-4 py-1 bg-[#B8FF4D]/20 backdrop-blur-xl rounded-full text-[9px] font-black text-[#B8FF4D] uppercase tracking-widest border border-[#B8FF4D]/20">
                    {game.pegiRating || '18+'}
                  </span>
                </div>
                <div className="space-y-2">
                  <motion.h1 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-5xl md:text-6xl xl:text-7xl font-black text-white tracking-tighter leading-[0.92] uppercase"
                    style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}
                  >
                    {game.title}
                  </motion.h1>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div className="flex items-center gap-2.5">
                     <div className="flex items-center gap-0.5">
                       {[1,2,3,4,5].map(i => <Star key={i} size={14} className={i <= 4 ? "text-[#B8FF4D] fill-[#B8FF4D]" : "text-zinc-600"} />)}
                     </div>
                     <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-80">{game.rating ? `${game.rating} Rating` : '4.8 Rating'}</span>
                  </div>
                  <div className="h-3 w-px bg-white/20 hidden md:block" />
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <Calendar size={14} className="text-[#B8FF4D]" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{game.releaseDate}</span>
                  </div>
                  <div className="h-3 w-px bg-white/20 hidden md:block" />
                  <div className="flex items-center gap-2.5 text-zinc-300">
                    <Gamepad2 size={14} className="text-[#B8FF4D]" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{game.developer}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-2">
                   <button className="px-8 py-4 bg-[#B8FF4D] text-black rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:scale-105 transition-all shadow-xl shadow-[#B8FF4D]/20">
                      Wishlist Game
                   </button>
                   <div className="flex items-center gap-2">
                     <button className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white hover:bg-white hover:text-black transition-all">
                        <Share2 size={18} />
                     </button>
                     <button className="p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl text-white hover:bg-white hover:text-black transition-all">
                        <Heart size={18} />
                     </button>
                   </div>
                </div>
              </div>

              {/* Platform Badges - Desktop Only */}
              <div className="hidden xl:flex flex-col gap-6 items-end">
                <div className="space-y-3 text-right">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest opacity-40">AVAILABLE ON</p>
                  <div className="flex flex-wrap justify-end gap-2.5">
                    {game.platforms.map(p => (
                      <div key={p} className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-[#B8FF4D] hover:border-[#B8FF4D]/30 transition-all cursor-help" title={p}>
                        <Monitor size={20} />
                      </div>
                    ))}
                  </div>
                </div>
                {game.officialWebsite && (
                  <a href={game.officialWebsite} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-[0.2em] transition-colors group">
                    Official Site <ExternalLink size={12} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="sticky top-[72px] z-40 bg-black/80 backdrop-blur-xl border-b border-white/5 mt-8 md:mt-12">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-10 whitespace-nowrap">
            {tabs.map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "py-8 text-xs font-black uppercase tracking-widest transition-all relative group",
                  activeTab === tab ? "text-[#B8FF4D]" : "text-zinc-500 hover:text-white"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-[#B8FF4D]"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'Overview' && renderOverview()}
            {activeTab === 'Timeline' && renderTimeline()}
            {activeTab === 'Requirements' && renderRequirements()}
            
            {activeTab === 'News' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 py-12">
                {news.map(a => <ArticleCard key={a.id} article={a} variant="compact" />)}
              </div>
            )}

            {activeTab === 'DLC' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12">
                 {game.dlc?.map((d, i) => (
                   <div key={i} className="bg-zinc-950 border border-white/5 p-8 rounded-[40px] flex items-center justify-between group hover:border-[#B8FF4D]/30 transition-all">
                      <div className="space-y-1">
                        <h4 className="text-lg font-black text-white uppercase tracking-tight">{d.name}</h4>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">{d.type}</p>
                      </div>
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        d.status === 'Upcoming' ? "bg-[#B8FF4D]/10 text-[#B8FF4D]" : "bg-zinc-900 text-zinc-500"
                      )}>
                        {d.status}
                      </span>
                   </div>
                 ))}
              </div>
            )}

            {/* Simple placeholders for others */}
            {['Reviews', 'Guides', 'Videos', 'Screenshots'].includes(activeTab) && (
              <div className="py-40 text-center space-y-4 opacity-30">
                 <div className="w-20 h-20 rounded-full bg-zinc-900 mx-auto flex items-center justify-center text-white">
                   <Layers size={32} />
                 </div>
                 <p className="text-xs font-black uppercase tracking-[0.4em]">{activeTab} coming soon</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
