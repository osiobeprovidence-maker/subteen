import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, User as UserIcon } from 'lucide-react';
import { Article } from '../../types';
import { cn } from '../../lib/utils';
import { Avatar } from './Avatar';

interface ArticleCardProps {
  article: Article;
  variant?: 'large' | 'compact' | 'minimal';
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, variant = 'large' }) => {
  const authorName = article.authorName ?? 'Staff Writer';
  const authorAvatar = article.authorAvatar;

  if (variant === 'minimal') {
    return (
      <Link to={`/article/${article.slug}`} className="group flex gap-4 items-start">
        <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-zinc-900">
          <img 
            src={article.heroImage} 
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#B8FF4D]">
            {article.category}
          </span>
          <h3 className="text-sm font-bold text-white group-hover:text-[#B8FF4D] transition-colors line-clamp-2 leading-tight">
            {article.title}
          </h3>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/article/${article.slug}`} className="group space-y-3 sm:space-y-4">
        <div className="aspect-video rounded-xl overflow-hidden bg-zinc-900 relative">
          <img 
            src={article.heroImage} 
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {article.reviewScore && (
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-[#B8FF4D] text-black font-black text-base sm:text-lg w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg shadow-xl">
              {article.reviewScore}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#B8FF4D]">
            {article.category}
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#B8FF4D] transition-colors leading-tight line-clamp-2">
            {article.title}
          </h3>
          <div className="flex items-center gap-4 text-[11px] sm:text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Clock size={12} /> {article.readingTime} min read
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/article/${article.slug}`} className="group block space-y-4 sm:space-y-6">
      <div className="aspect-[16/10] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-zinc-900 relative">
        <img 
          src={article.heroImage} 
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-zinc-900 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#B8FF4D] border border-white/5">
            {article.category}
          </span>
          <span className="text-[11px] sm:text-xs text-zinc-500">
            {new Date(article.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        
        <h2 className="text-[22px] sm:text-[32px] lg:text-[44px] font-black text-white group-hover:text-[#B8FF4D] transition-colors leading-[1.15] tracking-tight line-clamp-3 sm:line-clamp-none">
          {article.title}
        </h2>
        
        {article.subtitle && (
          <p className="text-zinc-400 text-[15px] sm:text-[16px] lg:text-[18px] leading-relaxed max-w-3xl line-clamp-2 sm:line-clamp-3">
            {article.subtitle}
          </p>
        )}
        
        <div className="flex items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
          <Avatar src={authorAvatar} name={authorName} size={22} />
          <span className="text-[10px] sm:text-xs font-bold text-zinc-300 uppercase tracking-wider">{authorName}</span>
          <span className="w-1 h-1 rounded-full bg-zinc-700" />
          <span className="text-[10px] sm:text-xs text-zinc-500 flex items-center gap-1.5">
            <Clock size={12} /> {article.readingTime} min read
          </span>
        </div>
      </div>
    </Link>
  );
};
