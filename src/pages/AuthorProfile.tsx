import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Twitter, Instagram, Globe, Mail, Clock } from 'lucide-react';
import { ARTICLES, AUTHORS } from '../data/mockData';
import { ArticleCard } from '../components/common/ArticleCard';

export const AuthorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const author = AUTHORS.find(a => a.id === id);
  
  if (!author) {
    return (
      <div className="pt-40 pb-40 text-center space-y-6">
        <h1 className="text-4xl font-black text-white">Author not found</h1>
        <Link to="/" className="text-[#B8FF4D] hover:underline font-bold">Go back home</Link>
      </div>
    );
  }

  const authorArticles = ARTICLES.filter(a => a.authorId === author.id);

  return (
    <div className="pb-32">
      {/* Header */}
      <header className="pt-40 pb-20 bg-zinc-950 border-b border-white/5 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center text-center md:text-left">
          <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-[#B8FF4D]/20 shrink-0">
            <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-[#B8FF4D]">STAFF WRITER</span>
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter">{author.name}</h1>
            </div>
            
            <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl">
              {author.bio}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-8">
              <div className="flex items-center gap-4">
                <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Twitter size={20} /></a>
                <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Instagram size={20} /></a>
                <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Globe size={20} /></a>
                <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Mail size={20} /></a>
              </div>
              <div className="h-6 w-px bg-zinc-800" />
              <div className="flex flex-wrap gap-2">
                {author.expertise.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-zinc-900 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest border border-white/5">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Articles Feed */}
      <div className="max-w-4xl mx-auto px-6 mt-24 space-y-16">
        <div className="flex items-center justify-between border-b border-white/5 pb-6">
          <h2 className="text-2xl font-black text-white">ARTICLES BY {author.name.toUpperCase()}</h2>
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{authorArticles.length} STORIES</p>
        </div>

        <div className="space-y-16">
          {authorArticles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
};
