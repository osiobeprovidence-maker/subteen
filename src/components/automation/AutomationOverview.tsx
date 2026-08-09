import React from 'react';
import { useQuery } from 'convex/react';
import {
  Radio,
  Sparkles,
  Inbox,
  FileCheck2,
  Send,
  AlertTriangle,
  Clock,
  Activity,
} from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { ActivityStatusDot } from './StatusBadge';
import { relativeTime } from '../../lib/articleHelpers';
import { cn } from '../../lib/utils';

export const AutomationOverview = () => {
  const overview = useQuery(api.newsAutomation.overview);

  const stats = [
    {
      label: 'Active RSS Sources',
      value: overview?.activeSources ?? 0,
      sub: `${overview?.totalSources ?? 0} total configured`,
      icon: Radio,
    },
    {
      label: 'Stories Discovered Today',
      value: overview?.discoveredToday ?? 0,
      sub: 'across all sources',
      icon: Activity,
    },
    {
      label: 'Awaiting AI Processing',
      value: overview?.awaitingProcessing ?? 0,
      sub: 'in the import queue',
      icon: Sparkles,
    },
    {
      label: 'Awaiting Editorial Review',
      value: overview?.awaitingReview ?? 0,
      sub: 'AI drafts ready',
      icon: Inbox,
    },
    {
      label: 'Published From Automation',
      value: overview?.publishedFromAutomation ?? 0,
      sub: 'stories live on Subteen',
      icon: Send,
    },
    {
      label: 'Failed Imports',
      value: overview?.failedImports ?? 0,
      sub: `${overview?.sourcesWithIssues ?? 0} source(s) with sync issues`,
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-zinc-950 border border-white/5 p-7 rounded-[28px] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
              <div className="flex items-end gap-2 mt-1">
                <p className="text-3xl font-black text-white">{stat.value}</p>
              </div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Activity Feed</h2>
            <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              <Clock size={14} />
              {overview?.lastSuccessfulSync ? `Last sync ${relativeTime(overview.lastSuccessfulSync)}` : 'No sync yet'}
            </div>
          </div>
          <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-hidden">
            {(overview?.activityFeed?.length ?? 0) === 0 ? (
              <div className="px-8 py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600 mx-auto mb-4">
                  <Activity size={24} />
                </div>
                <p className="text-sm font-bold text-zinc-500">
                  No automation activity yet. Configure RSS sources and sync to begin.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {overview!.activityFeed.map((entry: any) => (
                  <div key={entry._id} className="flex items-start gap-4 px-8 py-5 hover:bg-white/[0.01] transition-colors">
                    <div className="mt-1.5">
                      <ActivityStatusDot status={entry.status} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white leading-snug">{entry.message}</p>
                      <p className={cn(
                        "text-[10px] font-black uppercase tracking-widest mt-1",
                        entry.status === 'error' ? 'text-red-500' : 'text-zinc-600',
                      )}>
                        {entry.action.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <span className="text-[10px] text-zinc-600 font-mono shrink-0">{relativeTime(entry.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Pipeline Status</h2>
          <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 space-y-6">
            {[
              { label: 'Import', value: overview?.awaitingProcessing ?? 0, icon: FileCheck2, done: (overview?.discoveredToday ?? 0) > 0 },
              { label: 'AI Processing', value: '—', icon: Sparkles, done: true },
              { label: 'Editorial Review', value: overview?.awaitingReview ?? 0, icon: Inbox, done: true },
              { label: 'Published', value: overview?.publishedFromAutomation ?? 0, icon: Send, done: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-4 bg-zinc-900 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <item.icon size={16} className="text-[#B8FF4D]" />
                  <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{item.label}</p>
                    <p className="text-lg font-black text-white">{item.value}</p>
                  </div>
                </div>
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  item.done ? "bg-[#B8FF4D] shadow-[0_0_10px_#B8FF4D]" : "bg-zinc-700",
                )} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
