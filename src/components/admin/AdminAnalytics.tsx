import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { FileText, Clock, Users, CheckCircle, ClipboardCheck, Flag, DollarSign, Eye, MousePointerClick, Loader2, TrendingUp } from 'lucide-react';

export const AdminAnalytics = () => {
  const stats = useQuery(api.admin.stats);
  const counts = useQuery(api.articles.counts);
  const articles = useQuery(api.articles.listAll, {}) ?? [];
  const adStats = useQuery(api.ads.stats);
  const reports = useQuery(api.reports.list, {}) ?? [];

  const pendingReports = useMemo(() => reports.filter((r) => r.status === 'pending').length, [reports]);
  const topByViews = useMemo(
    () => articles.filter((a) => a.status === 'published').slice().sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 8),
    [articles],
  );

  const totalViews = useMemo(() => articles.reduce((sum, a) => sum + (a.views ?? 0), 0), [articles]);

  const primary = [
    { label: 'Total Articles', value: String(counts?.total ?? 0), icon: FileText },
    { label: 'Published', value: String(counts?.published ?? 0), icon: CheckCircle },
    { label: 'Published Today', value: String(stats?.publishedToday ?? 0), icon: TrendingUp },
    { label: 'Drafts Waiting', value: String(stats?.draftsWaiting ?? 0), icon: Clock },
  ];

  const secondary = [
    { label: 'Scheduled', value: String(counts?.scheduled ?? 0), icon: Clock },
    { label: 'Pending Review', value: String(counts?.pendingReview ?? 0), icon: ClipboardCheck },
    { label: 'Total Users', value: String(stats?.totalUsers ?? 0), icon: Users },
    { label: 'Editors', value: String(stats?.totalEditors ?? 0), icon: Users },
    { label: 'Pending Reports', value: String(pendingReports), icon: Flag },
    { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye },
  ];

  const monetization = [
    { label: 'Ad Revenue', value: `$${Number(adStats?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign },
    { label: 'Ad Views', value: Number(adStats?.totalViews ?? 0).toLocaleString(), icon: Eye },
    { label: 'Avg CTR', value: adStats?.avgCtr ?? '0%', icon: MousePointerClick },
    { label: 'Active Campaigns', value: String(adStats?.activeAds ?? 0), icon: DollarSign },
  ];

  return (
    <div className="space-y-12">
      {!counts ? (
        <div className="py-24 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-zinc-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {primary.map((stat) => (
              <div key={stat.label} className="bg-zinc-950 border border-white/5 p-6 rounded-[32px] space-y-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
                  <stat.icon size={18} />
                </div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {secondary.map((stat) => (
              <div key={stat.label} className="bg-zinc-950 border border-white/5 p-5 rounded-[24px] space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  <stat.icon size={13} /> {stat.label}
                </div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Monetization */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Monetization</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {monetization.map((stat) => (
                <div key={stat.label} className="bg-zinc-950 border border-white/5 p-6 rounded-[32px] space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
                    <stat.icon size={18} />
                  </div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top articles by views */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Top Articles by Views</h2>
            <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-x-auto">
              <table className="w-full text-left min-w-[560px]">
                <thead className="bg-white/[0.02] border-b border-white/5">
                  <tr>
                    <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Title</th>
                    <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Category</th>
                    <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {topByViews.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 sm:px-8 py-14 text-center text-zinc-500 text-sm">
                        No published articles with views yet.
                      </td>
                    </tr>
                  )}
                  {topByViews.map((article) => (
                    <tr key={article._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 sm:px-8 py-5 text-sm font-bold text-white max-w-[360px] truncate">{article.title}</td>
                      <td className="px-6 sm:px-8 py-5 text-sm text-zinc-400">{article.category}</td>
                      <td className="px-6 sm:px-8 py-5 text-sm font-mono text-zinc-400">{article.views ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
