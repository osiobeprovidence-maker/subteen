import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { CalendarDays, Search, Edit3, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { relativeTime } from '../../lib/articleHelpers';

const STATUS_LABEL: Record<string, string> = {
  published: 'Published',
  draft: 'Draft',
  scheduled: 'Scheduled',
};

type StatusFilter = 'all' | 'published' | 'draft' | 'scheduled';

export const AdminEvents = () => {
  const articles = useQuery(api.articles.listAll, {}) ?? [];
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');

  const events = useMemo(
    () =>
      articles.filter((a) => a.category === 'Events' || a.contentType === 'event'),
    [articles],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((a) => {
      if (filter !== 'all' && (a.status ?? 'draft') !== filter) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        (a.venue ?? '').toLowerCase().includes(q) ||
        (a.organizer ?? '').toLowerCase().includes(q)
      );
    });
  }, [events, query, filter]);

  const counts = useMemo(() => {
    const out: Record<StatusFilter, number> = { all: events.length, published: 0, draft: 0, scheduled: 0 };
    for (const a of events) out[(a.status ?? 'draft') as StatusFilter] += 1;
    return out;
  }, [events]);

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Drafts' },
    { key: 'scheduled', label: 'Scheduled' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-950 border border-white/5 p-6 rounded-[32px]">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B8FF4D] transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors',
                filter === tab.key ? 'bg-[#B8FF4D] text-black' : 'bg-zinc-900 text-zinc-500 hover:text-white',
              )}
            >
              {tab.label}
              <span className={cn('px-1.5 py-0.5 rounded-full text-[9px] font-black', filter === tab.key ? 'bg-black/10 text-black' : 'bg-zinc-800 text-zinc-400')}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {!articles ? (
        <div className="py-24 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-zinc-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-950 border border-white/5 rounded-[40px] py-24 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600">
            <CalendarDays size={24} />
          </div>
          <p className="text-sm font-bold text-zinc-500 max-w-sm">
            {query || filter !== 'all'
              ? 'No events match your filters.'
              : 'No events yet. Create one from the Events section in the article editor.'}
          </p>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-x-auto">
          <table className="w-full text-left min-w-[720px]">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Title</th>
                <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Event Date</th>
                <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Venue</th>
                <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Updated</th>
                <th className="px-6 sm:px-8 py-6"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((article) => (
                <tr key={article._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 sm:px-8 py-6">
                    <Link
                      to={`/editor/edit/${article._id}`}
                      className="text-sm font-bold text-white hover:text-[#B8FF4D] transition-colors"
                    >
                      {article.title}
                    </Link>
                    {article.organizer && <p className="text-xs text-zinc-500 mt-0.5">by {article.organizer}</p>}
                  </td>
                  <td className="px-6 sm:px-8 py-6">
                    <p className="text-sm text-zinc-400 font-mono">
                      {article.eventDate ?? article.publishDate}
                    </p>
                    {article.eventStartTime && (
                      <p className="text-[10px] text-zinc-600">
                        {article.eventStartTime}
                        {article.eventEndTime ? ` – ${article.eventEndTime}` : ''}
                      </p>
                    )}
                  </td>
                  <td className="px-6 sm:px-8 py-6 text-sm text-zinc-500">{article.venue ?? '—'}</td>
                  <td className="px-6 sm:px-8 py-6">
                    <span
                      className={cn(
                        'text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest',
                        article.status === 'published'
                          ? 'bg-[#B8FF4D]/10 text-[#B8FF4D]'
                          : article.status === 'scheduled'
                            ? 'bg-blue-400/10 text-blue-400'
                            : 'bg-zinc-800 text-zinc-400',
                      )}
                    >
                      {STATUS_LABEL[article.status ?? 'draft'] ?? article.status}
                    </span>
                  </td>
                  <td className="px-6 sm:px-8 py-6 text-sm text-zinc-500">{relativeTime(article._creationTime)}</td>
                  <td className="px-6 sm:px-8 py-6 text-right">
                    <Link
                      to={`/editor/edit/${article._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-400 hover:text-[#B8FF4D] text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                      <Edit3 size={12} /> Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
