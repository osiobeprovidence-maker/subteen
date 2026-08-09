import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, FileText, AlertCircle } from 'lucide-react';
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
  const drafts = useQuery(api.newsAutomation.listDrafts, filter ? { status: filter as any } : undefined) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-950 border border-white/5 p-6 rounded-[32px]">
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-tight">Editorial Review Queue</h2>
          <p className="text-xs text-zinc-500 mt-1">AI drafts awaiting editorial sign-off before publishing.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
          <AlertCircle size={14} className="text-amber-400" />
          {drafts.length} draft(s) in {filter === 'PENDING_REVIEW' ? 'pending review' : filter.toLowerCase()}
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
