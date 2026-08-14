import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { Calendar, Clock, MapPin, Ticket, User as UserIcon, Link as LinkIcon } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import { usePageTitle } from '../hooks/usePageTitle';
import { useResolvedMedia } from '../hooks/useImageUpload';
import { cn } from '../lib/utils';
import type { Article } from '../types';

const EVENT_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'live', label: 'Live Now' },
  { id: 'ended', label: 'Ended' },
] as const;

type EventStatus = 'upcoming' | 'live' | 'ended';

const formatDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const EventsPage = () => {
  usePageTitle('Events');
  const events = useQuery(api.articles.listEvents, { take: 100 });
  const [filter, setFilter] = useState<(typeof EVENT_FILTERS)[number]['id']>('all');

  const sorted = useMemo(() => {
    const list = (events ?? []) as unknown as Article[];
    const now = new Date().toISOString().slice(0, 10);
    return [...list].sort((a, b) => {
      const aDate = a.eventDate ?? a.publishDate ?? '';
      const bDate = b.eventDate ?? b.publishDate ?? '';
      if (a.eventStatus === 'live') return -1;
      if (b.eventStatus === 'live') return 1;
      if ((a.eventStatus ?? 'upcoming') === 'upcoming' && (b.eventStatus ?? 'upcoming') !== 'upcoming') return -1;
      if ((a.eventStatus ?? 'upcoming') !== 'upcoming' && (b.eventStatus ?? 'upcoming') === 'upcoming') return 1;
      return aDate.localeCompare(bDate) || bDate.localeCompare(aDate) * -1;
    }).map((ev) => {
      const isPast = !ev.eventStatus && ev.eventDate && ev.eventDate < now;
      const status: EventStatus = ev.eventStatus === 'live' || ev.eventStatus === 'ended'
        ? ev.eventStatus
        : isPast
          ? 'ended'
          : 'upcoming';
      return { ev, status };
    });
  }, [events]);

  const filtered = filter === 'all' ? sorted : sorted.filter(({ status }) => status === filter);

  return (
    <div className="pb-32">
      <header className="pt-40 pb-16 px-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
            <Link to="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <span className="text-[#B8FF4D]">Events</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase">Events</h1>
          <p className="text-sm text-zinc-500 max-w-2xl font-medium">
            Conferences, festivals, gigs and meetups across Africa and beyond.
          </p>
        </div>
      </header>

      <div className="border-b border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 py-5 overflow-x-auto no-scrollbar">
          {EVENT_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all shrink-0',
                filter === f.id
                  ? 'bg-[#B8FF4D] text-black border-[#B8FF4D]'
                  : 'bg-zinc-900 border-white/5 text-zinc-400 hover:text-white',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16">
        {!events ? (
          <div className="py-40 text-center text-zinc-600 text-sm font-bold uppercase tracking-widest">Loading events...</div>
        ) : filtered.length > 0 ? (
          <div className="space-y-6">
            {filtered.map(({ ev, status }) => (
              <EventRow key={ev.id} ev={ev} status={status} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center space-y-6 bg-zinc-950 rounded-[40px] border border-white/5">
            <h3 className="text-2xl font-black text-white">No {filter === 'all' ? '' : filter + ' '}events yet</h3>
            <p className="text-zinc-500">Check back later for fresh event listings.</p>
            <Link to="/" className="inline-block px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-[#B8FF4D] transition-all">
              Return Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const EventRow = ({ ev, status }: { ev: Article; status: EventStatus }) => {
  const cover = useResolvedMedia(ev.heroImage ?? undefined);
  const statusColor =
    status === 'live' ? 'bg-red-500' : status === 'ended' ? 'bg-zinc-700' : 'bg-[#B8FF4D]';
  const statusText =
    status === 'live' ? 'Live Now' : status === 'ended' ? 'Ended' : 'Upcoming';

  return (
    <Link
      to={`/article/${ev.slug}`}
      className="group flex flex-col md:flex-row gap-0 rounded-[32px] border border-white/5 bg-zinc-950 overflow-hidden hover:border-[#B8FF4D]/30 transition-all"
    >
      {cover && (
        <div className="md:w-[280px] h-48 md:h-auto shrink-0 overflow-hidden bg-zinc-900">
          <img
            src={cover}
            alt={ev.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      )}
      <div className="flex-1 p-8 flex flex-col justify-center gap-5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            <span className={cn('w-1.5 h-1.5 rounded-full', statusColor)} />
            <span className="text-zinc-300">{statusText}</span>
          </span>
          {ev.eventDate && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-400">
              <Calendar size={11} /> {formatDate(ev.eventDate)}
            </span>
          )}
          {ev.subcategory && (
            <span className="flex items-center px-3 py-1 rounded-full bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              {ev.subcategory}
            </span>
          )}
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight group-hover:text-[#B8FF4D] transition-colors">
          {ev.title}
        </h3>
        {ev.excerpt && <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">{ev.excerpt}</p>}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-zinc-500">
          {(ev.eventStartTime || ev.eventEndTime) && (
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-zinc-700" />
              {ev.eventStartTime}
              {ev.eventStartTime && ev.eventEndTime ? ' – ' : ''}
              {ev.eventEndTime}
            </span>
          )}
          {ev.venue && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-zinc-700" /> {ev.venue}
            </span>
          )}
          {ev.organizer && (
            <span className="flex items-center gap-1.5">
              <UserIcon size={14} className="text-zinc-700" /> {ev.organizer}
            </span>
          )}
          {ev.ticketUrl && (
            <span className="flex items-center gap-1.5 text-[#B8FF4D]">
              <Ticket size={14} /> Tickets
            </span>
          )}
          {ev.ticketInfo && (
            <span className="flex items-center gap-1.5">
              <LinkIcon size={14} className="text-zinc-700" /> {ev.ticketInfo}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};
