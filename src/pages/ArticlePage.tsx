import React, { useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Clock, Share2, Bookmark, ChevronRight, ExternalLink } from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Avatar } from '../components/common/Avatar';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import type { Article } from '../types';

export const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === '1';
  const { user, dbUser, role } = useAuth();
  const canEdit = role === 'editor' || role === 'admin' || role === 'super_admin';

  const articleQuery = isPreview && canEdit ? api.articles.getEditableBySlug : api.articles.getBySlug;
  const articleDoc = useQuery(articleQuery, slug ? { slug } : 'skip');
  const article = articleDoc as unknown as Article | null | undefined;
  const articleId = articleDoc?._id as any;

  const gameQuery = useQuery(
    api.articles.getGame,
    articleDoc && articleDoc.gameId ? { id: articleDoc.gameId } : 'skip',
  );
  const relatedQuery = useQuery(
    api.articles.related,
    articleDoc && articleDoc.status === 'published' ? { category: articleDoc.category, excludeId: articleDoc._id } : 'skip',
  );
  const relatedArticles = (relatedQuery ?? []) as unknown as Article[];

  const incrementViews = useMutation(api.articles.incrementViews);
  const markRead = useMutation(api.users.markRead);
  const toggleBookmark = useMutation(api.users.toggleBookmark);

  useEffect(() => {
    if (!articleDoc || articleDoc.status !== 'published' || isPreview) return;
    incrementViews({ id: articleDoc._id });
    if (dbUser) {
      markRead({ userId: dbUser._id, articleId: articleDoc._id }).catch(() => {});
    }
  }, [articleDoc?._id, isPreview, dbUser?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const bookmarked = !!dbUser && !!articleId && (dbUser.bookmarks ?? []).includes(articleId);

  const handleToggleBookmark = async () => {
    if (!dbUser || !articleId) return;
    try {
      await toggleBookmark({ userId: dbUser._id, articleId });
    } catch {
      // ignore
    }
  };

  if (!article) {
    return (
      <div className="pt-40 pb-40 text-center space-y-6">
        <h1 className="text-4xl font-black text-white">Article not found</h1>
        <Link to="/" className="text-[#B8FF4D] hover:underline font-bold">Go back home</Link>
      </div>
    );
  }

  const authorName = article.authorName ?? 'Staff Writer';
  const authorAvatar = article.authorAvatar;
  const game = gameQuery ?? null;

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
              <Avatar src={authorAvatar} name={authorName} size={44} />
              <div>
                <p className="text-[10px] sm:text-xs font-black text-white uppercase tracking-widest">{authorName}</p>
                <p className="text-[10px] sm:text-xs text-zinc-500 flex items-center gap-1.5 mt-1">
                  <Clock size={12} /> {article.readingTime} min read
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <button onClick={handleToggleBookmark} className="p-2.5 sm:p-3 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors" title="Bookmark">
                <Bookmark className={cn("w-5 h-5", bookmarked && "fill-[#B8FF4D] text-[#B8FF4D]")} />
              </button>
              <button className="p-2.5 sm:p-3 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors" title="Share">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 sm:mb-20">
        <div className="aspect-[16/10] sm:aspect-[21/9] rounded-[24px] sm:rounded-[40px] overflow-hidden bg-zinc-900 shadow-2xl">
          {article.heroImage ? (
            <img src={article.heroImage} alt={article.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChevronRight size={48} className="text-zinc-800 rotate-180" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        <article className="lg:col-span-8">
          <div className="prose prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-p:text-zinc-400 prose-p:leading-relaxed prose-strong:text-white prose-blockquote:border-l-4 prose-blockquote:border-[#B8FF4D] prose-blockquote:bg-zinc-950 prose-blockquote:p-6 sm:prose-blockquote:p-8 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-li:text-zinc-400">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-12 sm:mt-20 pt-8 sm:pt-10 border-t border-white/5 flex flex-wrap gap-2 sm:gap-3">
              {article.tags.map(tag => (
                <span key={tag} className="px-3 py-1.5 sm:px-4 sm:py-2 bg-zinc-900 rounded-lg text-xs sm:text-sm text-zinc-400 hover:text-white cursor-pointer transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Source attribution */}
          {(article.sourceName || article.originalUrl) && (
            <div className="mt-10 sm:mt-16 bg-zinc-950 border border-white/5 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0">
                  {article.sourceLogoUrl ? (
                    <img src={article.sourceLogoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ExternalLink size={16} className="text-[#B8FF4D]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">
                    Source
                  </p>
                  {article.sourceName && (
                    <p className="text-sm font-black text-white uppercase tracking-tight">
                      {article.sourceName}
                    </p>
                  )}
                  {article.originalUrl && (
                    <a
                      href={article.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 text-xs sm:text-sm font-bold text-[#B8FF4D] hover:text-white transition-colors"
                    >
                      <ExternalLink size={13} />
                      Read the original story
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
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
                    to={`/game/${game.slug}`}
                    className="inline-block mt-6 text-sm font-bold text-[#B8FF4D] hover:underline"
                  >
                    View Game Hub →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {relatedArticles.length > 0 && (
            <div className="space-y-8">
              <h4 className="text-xl font-black text-white">RELATED STORIES</h4>
              <div className="space-y-8">
                {relatedArticles.map(a => (
                  <Link key={a.id} to={`/article/${a.slug}`} className="group block space-y-3">
                     <div className="aspect-video rounded-xl overflow-hidden bg-zinc-900">
                       {a.heroImage ? (
                         <img src={a.heroImage} alt={a.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-zinc-800"><ChevronRight size={24} /></div>
                       )}
                     </div>
                     <h5 className="font-bold text-white group-hover:text-[#B8FF4D] transition-colors leading-tight">
                       {a.title}
                     </h5>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
