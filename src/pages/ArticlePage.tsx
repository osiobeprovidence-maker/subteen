import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Clock, Calendar, Share2, Bookmark, ChevronRight } from 'lucide-react';
import { ARTICLES, AUTHORS, GAMES } from '../data/mockData';
import { Avatar } from '../components/common/Avatar';

export const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = ARTICLES.find(a => a.slug === slug);
  
  if (!article) {
    return (
      <div className="pt-40 pb-40 text-center space-y-6">
        <h1 className="text-4xl font-black text-white">Article not found</h1>
        <Link to="/" className="text-[#B8FF4D] hover:underline font-bold">Go back home</Link>
      </div>
    );
  }

  const author = AUTHORS.find(a => a.id === article.authorId);
  const game = article.gameId ? GAMES.find(g => g.id === article.gameId) : null;
  const relatedArticles = ARTICLES.filter(a => a.category === article.category && a.id !== article.id).slice(0, 3);

  return (
    <div className="pb-20 sm:pb-32">
      {/* Header */}
      <header className="pt-24 sm:pt-32 pb-10 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to={`/category/${article.category.toLowerCase()}`} className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#B8FF4D]">
              {article.category}
            </Link>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest">
              {new Date(article.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          
          <h1 className="text-[28px] sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="text-[16px] sm:text-xl lg:text-2xl text-zinc-400 font-medium leading-relaxed">
              {article.subtitle}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-y border-white/5 py-6 sm:py-8">
            <div className="flex items-center gap-4">
              <Avatar src={author?.avatar} name={author?.name} size={44} />
              <div>
                <p className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest">{author?.name}</p>
                <p className="text-[10px] sm:text-xs text-zinc-500 flex items-center gap-1.5 mt-1">
                  <Clock size={12} /> {article.readingTime} min read
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <button className="p-2.5 sm:p-3 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors">
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="p-2.5 sm:p-3 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 sm:mb-20">
        <div className="aspect-[16/10] sm:aspect-[21/9] rounded-[24px] sm:rounded-[40px] overflow-hidden bg-zinc-900 shadow-2xl">
          <img src={article.heroImage} alt={article.title} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        <article className="lg:col-span-8">
          <div className="prose prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-p:text-zinc-400 prose-p:leading-relaxed prose-strong:text-white prose-blockquote:border-l-4 prose-blockquote:border-[#B8FF4D] prose-blockquote:bg-zinc-950 prose-blockquote:p-6 sm:prose-blockquote:p-8 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-li:text-zinc-400">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>

          {/* Tags */}
          <div className="mt-12 sm:mt-20 pt-8 sm:pt-10 border-t border-white/5 flex flex-wrap gap-2 sm:gap-3">
            {article.tags.map(tag => (
              <span key={tag} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-zinc-900 rounded-lg text-xs sm:text-sm text-zinc-400 hover:text-white cursor-pointer transition-colors">
                #{tag}
              </span>
            ))}
          </div>
        </article>

        <aside className="lg:col-span-4 space-y-10 sm:space-y-12">
          {game && (
            <div className="bg-zinc-950 border border-white/5 rounded-3xl p-8 space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-20 h-28 shrink-0 rounded-lg overflow-hidden bg-zinc-900">
                  <img src={game.coverImage} alt={game.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white leading-tight">{game.title}</h3>
                  <p className="text-xs text-zinc-500 mt-2 uppercase font-bold tracking-widest">{game.publisher}</p>
                  <Link 
                    to={`/game/${game.id}`}
                    className="inline-block mt-6 text-sm font-bold text-[#B8FF4D] hover:underline"
                  >
                    View Game Hub →
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-8">
            <h4 className="text-xl font-black text-white">RELATED STORIES</h4>
            <div className="space-y-8">
              {relatedArticles.map(a => (
                <Link key={a.id} to={`/article/${a.slug}`} className="group block space-y-3">
                   <div className="aspect-video rounded-xl overflow-hidden bg-zinc-900">
                     <img src={a.heroImage} alt={a.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                   </div>
                   <h5 className="font-bold text-white group-hover:text-[#B8FF4D] transition-colors leading-tight">
                     {a.title}
                   </h5>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
