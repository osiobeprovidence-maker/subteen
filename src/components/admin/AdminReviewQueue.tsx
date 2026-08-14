import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Inbox,
  Loader2,
  X,
  Eye,
  Pencil,
  CheckCheck,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import type { Doc, Id } from '../../../convex/_generated/dataModel';
import { cn } from '../../lib/utils';
import { ArticleImage } from '../common/ArticleImage';

const formatCountdown = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

const Countdown = ({ target }: { target?: number }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!target) {
    return <span className="text-zinc-500">Awaiting editorial review</span>;
  }
  const remaining = target - now;
  if (remaining <= 0) {
    return <span className="text-[#B8FF4D]">Auto-approving now…</span>;
  }
  return <span>Auto-approval in {formatCountdown(remaining)}</span>;
};

export const AdminReviewQueue = () => {
  const queue = useQuery(api.articles.listReviewQueue);
  const reviewArticle = useMutation(api.articles.reviewArticle);
  const [selected, setSelected] = useState<Doc<'articles'> | null>(null);
  const [busyId, setBusyId] = useState<Id<'articles'> | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const items = queue ?? [];
  const pending = items.filter((a) => a.reviewStatus === 'pending');

  const approve = async (article: Doc<'articles'>) => {
    setBusyId(article._id);
    try {
      await reviewArticle({ id: article._id, action: 'approve' });
      if (selected?._id === article._id) setSelected(null);
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (article: Doc<'articles'>, reason?: string) => {
    setBusyId(article._id);
    try {
      await reviewArticle({ id: article._id, action: 'reject', reason });
      if (selected?._id === article._id) setSelected(null);
      setRejecting(false);
      setRejectReason('');
    } finally {
      setBusyId(null);
    }
  };

  const openReview = (article: Doc<'articles'>) => {
    setSelected(article);
    setRejecting(false);
    setRejectReason('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 border border-white/5 p-6 rounded-[32px]">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Editorial Workflow</p>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Review Queue</h2>
        </div>
        <span className="flex items-center gap-2 w-fit px-4 py-2 bg-[#B8FF4D]/10 border border-[#B8FF4D]/20 rounded-full text-[#B8FF4D] text-[10px] font-black uppercase tracking-widest">
          <ShieldCheck size={14} />
          {pending.length} {pending.length === 1 ? 'Draft' : 'Drafts'} Pending
        </span>
      </div>

      <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-hidden">
        {pending.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 text-center py-24 px-6">
            <div className="w-16 h-16 rounded-3xl bg-zinc-900 flex items-center justify-center text-zinc-600">
              <Inbox size={28} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-white uppercase tracking-widest">Queue is clear</p>
              <p className="text-xs text-zinc-500 max-w-sm">
                Articles submitted for review will appear here with an auto-approval countdown.
              </p>
            </div>
          </div>
        ) : (
          pending.map((article) => (
            <div
              key={article._id}
              className="flex flex-col md:flex-row items-start md:items-center gap-5 p-6 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors"
            >
              <div className="w-full md:w-44 lg:w-56 h-28 md:h-24 rounded-2xl overflow-hidden bg-zinc-900 shrink-0">
                <ArticleImage src={article.heroImage} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <h3 className="text-sm font-black text-white truncate">{article.title}</h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  <span>{article.authorName ?? 'Staff Writer'}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  <span className="text-[#B8FF4D]">{article.category}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400">
                  <Clock size={13} className="text-[#B8FF4D]" />
                  <Countdown target={article.autoApproveAt} />
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openReview(article)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#B8FF4D] text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all"
                >
                  <Eye size={14} /> Review
                </button>
                <button
                  onClick={() => reject(article)}
                  disabled={busyId === article._id}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all disabled:opacity-50"
                >
                  {busyId === article._id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-950 border border-white/10 rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 bg-zinc-950/90 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#B8FF4D]/10 flex items-center justify-center text-[#B8FF4D]">
                    <Eye size={16} />
                  </div>
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.25em]">Quick Review</h3>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {selected.heroImage ? (
                  <div className="aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/5">
                    <ArticleImage src={selected.heroImage} alt={selected.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-700">
                    <Inbox size={32} />
                  </div>
                )}

                <div className="space-y-3">
                  <h2 className="text-2xl font-black text-white leading-tight tracking-tight">{selected.title}</h2>
                  {selected.subtitle && <p className="text-sm text-zinc-400 italic">{selected.subtitle}</p>}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <span>Source: {selected.authorName ?? 'Staff Writer'}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span>Category: <span className="text-[#B8FF4D]">{selected.category}</span></span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span>{selected.readingTime} min read</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Article Content</label>
                  <div className="relative max-h-48 overflow-hidden rounded-2xl bg-zinc-900/60 border border-white/5 p-5">
                    <p className="text-sm text-zinc-400 leading-relaxed whitespace-pre-wrap">{selected.content}</p>
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#B8FF4D]/5 border border-[#B8FF4D]/20 text-[11px] font-bold text-zinc-300">
                  <Clock size={14} className="text-[#B8FF4D]" />
                  <Countdown target={selected.autoApproveAt} />
                  {selected.autoApproveAt && (
                    <span className="text-zinc-500 ml-auto hidden sm:block">
                      Publishes {new Date(selected.autoApproveAt).toLocaleString()}
                    </span>
                  )}
                </div>

                {rejecting && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Rejection Reason (optional)</label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={2}
                      placeholder="Why is this being sent back? The editor sees this on resubmit."
                      className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setRejecting(false)} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                        Cancel
                      </button>
                      <button
                        onClick={() => reject(selected, rejectReason.trim() || undefined)}
                        disabled={busyId === selected._id}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-red-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-red-400 transition-all disabled:opacity-50"
                      >
                        {busyId === selected._id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                        Confirm Reject
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <Link
                    to={`/editor/edit/${selected._id}`}
                    onClick={() => setSelected(null)}
                    className={cn(
                      "flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all",
                    )}
                  >
                    <Pencil size={14} /> Edit Article
                  </Link>
                  <button
                    onClick={() => setRejecting(true)}
                    disabled={busyId === selected._id}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all disabled:opacity-50"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                  <button
                    onClick={() => approve(selected)}
                    disabled={busyId === selected._id}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#B8FF4D] text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(184,255,77,0.15)] disabled:opacity-50"
                  >
                    {busyId === selected._id ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
                    Approve & Publish
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
