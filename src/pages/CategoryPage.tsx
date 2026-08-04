import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ARTICLES } from '../data/mockData';
import { ArticleCard } from '../components/common/ArticleCard';
import { Filter, SlidersHorizontal } from 'lucide-react';

export const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  
  // Normalize category string for filtering
  const displayCategory = category?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const filteredArticles = ARTICLES.filter(a => 
    a.category.toLowerCase() === category?.toLowerCase() || 
    a.tags.some(t => t.toLowerCase() === category?.toLowerCase())
  );

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
            <h3 className="text-2xl font-black text-white">No stories found in this category</h3>
            <p className="text-zinc-500">Check back later for fresh updates.</p>
            <Link to="/" className="inline-block px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-[#B8FF4D] transition-all">
              Return Home
            </Link>
          </div>
        )}
      </div>

      {/* Pagination Mock */}
      {filteredArticles.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-24 flex items-center justify-center gap-4">
           <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white transition-all">1</button>
           <button className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-all">2</button>
           <button className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-all">3</button>
           <span className="text-zinc-700">...</span>
           <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white transition-all">Next</button>
        </div>
      )}
    </div>
  );
};
