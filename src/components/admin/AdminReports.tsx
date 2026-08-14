import React, { useMemo, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Flag, Check, X, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { relativeTime } from '../../lib/articleHelpers';

type StatusFilter = 'all' | 'pending' | 'resolved' | 'dismissed';

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-red-500/10 text-red-500' },
  resolved: { label: 'Resolved', className: 'bg-[#B8FF4D]/10 text-[#B8FF4D]' },
  dismissed: { label: 'Dismissed', className: 'bg-zinc-800 text-zinc-400' },
};

export const AdminReports = () => {
  const reports = useQuery(api.reports.list, {}) ?? [];
  const users = useQuery(api.users.list) ?? [];
  const updateStatus = useMutation(api.reports.updateStatus);

  const [filter, setFilter] = useState<StatusFilter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const reporterNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of users) {
      if (u.firebaseUid) map.set(u.firebaseUid, u.name);
    }
    return map;
  }, [users]);

  const filtered = useMemo(() => {
    if (filter === 'all') return reports;
    return reports.filter((r) => r.status === filter);
  }, [reports, filter]);

  const counts = useMemo(() => {
    const out: Record<StatusFilter, number> = { all: reports.length, pending: 0, resolved: 0, dismissed: 0 };
    for (const r of reports) out[r.status] += 1;
    return out;
  }, [reports]);

  const handleStatus = async (id: string, status: 'resolved' | 'dismissed') => {
    setBusyId(id);
    try {
      await updateStatus({ id: id as never, status });
    } finally {
      setBusyId(null);
    }
  };

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'dismissed', label: 'Dismissed' },
  ];

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'flex items-center gap-2 px-5 py-3 rounded-t-xl border-b-2 transition-all whitespace-nowrap',
              filter === tab.key
                ? 'border-[#B8FF4D] text-[#B8FF4D]'
                : 'border-transparent text-zinc-500 hover:text-white',
            )}
          >
            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            <span
              className={cn(
                'px-1.5 py-0.5 rounded-full text-[9px] font-black',
                filter === tab.key ? 'bg-[#B8FF4D] text-black' : 'bg-zinc-800 text-zinc-400',
              )}
            >
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {!reports ? (
        <div className="py-24 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-zinc-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-zinc-950 border border-white/5 rounded-[40px] py-24 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600">
            <Flag size={24} />
          </div>
          <p className="text-sm font-bold text-zinc-500 max-w-sm">
            {filter === 'all' ? 'No reports yet. Member-submitted reports will appear here.' : 'Nothing in this state.'}
          </p>
        </div>
      ) : (
        <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-x-auto">
          <table className="w-full text-left min-w-[760px]">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reason</th>
                <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Target</th>
                <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reporter</th>
                <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reported</th>
                <th className="px-6 sm:px-8 py-6"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((report) => {
                const badge = STATUS_BADGE[report.status] ?? STATUS_BADGE.pending;
                const reporter = report.reporterUserId ? (reporterNames.get(report.reporterUserId) ?? 'Anonymous') : 'Anonymous';
                return (
                  <tr key={report._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 sm:px-8 py-6">
                      <p className="text-sm font-bold text-white">{report.reason}</p>
                      {report.description && (
                        <p className="text-xs text-zinc-500 mt-1 max-w-[260px]">{report.description}</p>
                      )}
                    </td>
                    <td className="px-6 sm:px-8 py-6">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{report.targetType}</p>
                      <p className="text-sm text-zinc-400 mt-0.5 max-w-[200px] truncate">
                        {report.targetTitle ?? report.targetId}
                      </p>
                    </td>
                    <td className="px-6 sm:px-8 py-6 text-sm text-zinc-400">{reporter}</td>
                    <td className="px-6 sm:px-8 py-6">
                      <span className={cn('text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest', badge.className)}>
                        {badge.label}
                      </span>
                      {report.resolutionNote && (
                        <p className="text-[10px] text-zinc-600 mt-1 max-w-[180px] truncate">"{report.resolutionNote}"</p>
                      )}
                    </td>
                    <td className="px-6 sm:px-8 py-6">
                      <p className="text-sm text-zinc-500">{relativeTime(report.createdAt)}</p>
                      {report.resolvedBy && <p className="text-[10px] text-zinc-600 mt-0.5">by {report.resolvedBy}</p>}
                    </td>
                    <td className="px-6 sm:px-8 py-6">
                      {report.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStatus(report._id, 'resolved')}
                            disabled={busyId === report._id}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B8FF4D] text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-60"
                          >
                            {busyId === report._id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            Resolve
                          </button>
                          <button
                            onClick={() => handleStatus(report._id, 'dismissed')}
                            disabled={busyId === report._id}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors disabled:opacity-60"
                          >
                            <X size={12} /> Dismiss
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Closed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
