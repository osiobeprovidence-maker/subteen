import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { ExternalLink, Inbox, Radio } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { StatusBadge } from './StatusBadge';
import { relativeTime } from '../../lib/articleHelpers';
import { cn } from '../../lib/utils';

const FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'IMPORTED', label: 'Imported' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REJECTED', label: 'Duplicates' },
];

export const AutomationImported = () => {
  const [filter, setFilter] = useState('ALL');
  const items = useQuery(api.newsAutomation.listImported, filter === 'ALL' ? {} : { status: filter as any }) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-950 border border-white/5 p-6 rounded-[32px]">
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-tight">Imported Stories</h2>
          <p className="text-xs text-zinc-500 mt-1">Raw feed items pulled in by the ingester, with dedupe + AI status.</p>
        </div>
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{items.length} item(s)</span>
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

      {items.length === 0 ? (
        <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600 mx-auto mb-4">
            <Inbox size={24} />
          </div>
          <p className="text-sm font-bold text-zinc-500">No imported stories here yet. Sync a source to begin.</p>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-hidden">
          <div className="divide-y divide-white/5">
            {items.map((item: any) => (
              <div key={item._id} className="flex items-center gap-5 px-7 py-5 hover:bg-white/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center overflow-hidden shrink-0">
                  {item.sourceLogoUrl ? (
                    <img src={item.sourceLogoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Radio size={16} className="text-zinc-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{item.sourceName}</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-sm font-bold text-white truncate">{item.originalTitle}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Imported {relativeTime(item.createdAt)}
                    {item.duplicateReason ? ` · ${item.duplicateReason}` : ''}
                  </p>
                </div>
                {item.originalUrl && (
                  <a
                    href={item.originalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-zinc-500 hover:text-[#B8FF4D] transition-colors shrink-0"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
