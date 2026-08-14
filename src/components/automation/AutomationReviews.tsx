import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, FileText, AlertCircle, Loader2, Send } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { StatusBadge } from './StatusBadge';
import { relativeTime } from '../../lib/articleHelpers';
import { cn } from '../../lib/utils';

const FILTERS = [
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'AI_DRAFT', label: 'AI Drafts' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'FAILED', label: 'Failed' },
];

export const AutomationReviews = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('PENDING_REVIEW');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const drafts = useQuery(api.newsAutomation.listDrafts, filter ? { status: filter as any } : undefined) ?? [];
  const summary = useQuery(api.newsAutomation.publishSummary) ?? null;
  const publishAllPending = useMutation(api.newsAutomation.publishAllPending);

  const unique = summary?.uniqueEligible ?? 0;
  const skippedTotal = (summary?.duplicatesVsPublished ?? 0) + (summary?.duplicatesWithinQueue ?? 0);

  const handlePublish = async () => {
    setBusy(true);
    setLastResult(null);
    try {
      const result = await publishAllPending();
      setLastResult(
        `Published ${result.published} · ${result.skipped} duplicate(s) skipped · ${result.failed.length} failed`,
      );
    } catch (e) {
      setLastResult(`Publish failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-950 border border-white/5 p-6 rounded-[32px]">
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-tight">Editorial Review Queue</h2>
          <p className="text-xs text-zinc-500 mt-1">AI drafts awaiting editorial sign-off before publishing.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            <AlertCircle size={14} className="text-amber-400" />
            {drafts.length} draft(s) in {filter === 'PENDING_REVIEW' ? 'pending review' : filter.toLowerCase()}
          </div>
          {lastResult && (
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{lastResult}</span>
          )}
          {filter === 'PENDING_REVIEW' && (
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={busy || unique === 0 || summary === null}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                unique > 0 && !busy
                  ? "bg-[#B8FF4D] text-black border-[#B8FF4D] hover:brightness-110"
                  : "bg-zinc-900 border-white/5 text-zinc-600 cursor-not-allowed",
              )}
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Publish {unique} Unique Drafts
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border",
              filter === f.value
                ? "bg-[#B8FF4D] text-black border-[#B8FF4D]"
                : "bg-zinc-900 border-white/5 text-zinc-500 hover:text-white hover:border-white/20",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-[32px] p-8 max-w-md w-full space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-[#B8FF4D]/10 border border-[#B8FF4D]/20 flex items-center justify-center">
              <Send size={20} className="text-[#B8FF4D]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Publish Automation Drafts</h3>
              <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
                You are about to publish{' '}
                <span className="text-white font-bold">{unique}</span> AI-generated drafts to Subteen. This action will
                make all eligible drafts public immediately.
              </p>
              {skippedTotal > 0 && (
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mt-3">
                  {skippedTotal} duplicate draft(s) will be skipped and left in the queue.
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={busy}
                className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:border-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={busy}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#B8FF4D] text-black hover:brightness-110 transition-all"
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {busy ? 'Publishing…' : `Publish ${unique} Drafts`}
              </button>
            </div>
          </div>
        </div>
      )}

      {drafts.length === 0 ? (
        <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600 mx-auto mb-4">
            <FileText size={24} />
          </div>
          <p className="text-sm font-bold text-zinc-500">No drafts in this state.</p>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-hidden">
          <div className="divide-y divide-white/5">
            {drafts.map((draft: any) => (
              <button
                key={draft._id}
                onClick={() => navigate(`/admin/automation/review/${draft._id}`)}
                className="w-full flex items-center gap-5 px-7 py-5 text-left hover:bg-white/[0.02] transition-colors group"
              >
                <div className="w-24 h-14 rounded-xl bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0">
                  {draft.featuredImage || draft.sourceImageUrl ? (
                    <img
                      src={draft.featuredImage ?? draft.sourceImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <FileText size={16} className="text-zinc-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{draft.sourceName}</span>
                    <StatusBadge status={draft.status} />
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest">{draft.category}</span>
                  </div>
                  <p className="text-sm font-bold text-white truncate">{draft.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {draft.originalTitle ? `Original: ${draft.originalTitle}` : draft.subtitle}
                  </p>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{relativeTime(draft.createdAt)}</p>
                  <ChevronRight size={16} className="text-zinc-600 group-hover:text-[#B8FF4D] transition-colors ml-auto" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
