import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Clock, ClipboardCheck, TrendingUp, Flag, Plus, Settings, Zap, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export const AdminDashboard = () => {
  const stats = useQuery(api.admin.stats);
  const counts = useQuery(api.articles.counts);
  const reports = useQuery(api.reports.list, {}) ?? [];

  const pendingReports = useMemo(() => reports.filter((r) => r.status === 'pending').length, [reports]);

  const statCards = [
    { label: 'Published Today', value: String(stats?.publishedToday ?? 0), icon: TrendingUp },
    { label: 'Drafts Waiting', value: String(stats?.draftsWaiting ?? 0), icon: FileText },
    { label: 'Scheduled', value: String(counts?.scheduled ?? 0), icon: Clock },
    { label: 'Pending Review', value: String(counts?.pendingReview ?? 0), icon: ClipboardCheck },
  ];

  const systemRows = [
    { label: 'Total Articles', value: String(stats?.totalArticles ?? 0) },
    { label: 'Total Users', value: String(stats?.totalUsers ?? 0) },
    { label: 'Active Editors', value: String(stats?.totalEditors ?? 0) },
    { label: 'Pending Reports', value: String(pendingReports), attention: pendingReports > 0 },
  ];

  const quickActions = [
    { label: 'New Article', path: '/editor/new', icon: Plus },
    { label: 'Review Queue', path: '/admin/review-queue', icon: ClipboardCheck },
    { label: 'Automation', path: '/admin/automation', icon: Zap },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const recentArticles = stats?.recentArticles ?? [];

  return (
    <div className="space-y-12">
      {!stats ? (
        <div className="py-24 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-zinc-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <div key={stat.label} className="bg-zinc-950 border border-white/5 p-8 rounded-[32px] space-y-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
                  <stat.icon size={20} />
                </div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent articles */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Recent Content</h2>
                <Link
                  to="/admin/articles"
                  className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
                >
                  View All
                </Link>
              </div>
              <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-x-auto">
                <table className="w-full text-left min-w-[640px]">
                  <thead className="bg-white/[0.02] border-b border-white/5">
                    <tr>
                      <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Title</th>
                      <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Category</th>
                      <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Views</th>
                      <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentArticles.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 sm:px-8 py-16 text-center text-zinc-500 text-sm">
                          No articles yet. Create one to get started.
                        </td>
                      </tr>
                    )}
                    {recentArticles.map((article) => (
                      <tr key={article._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                        <td className="px-6 sm:px-8 py-6">
                          <Link to={`/editor/edit/${article._id}`} className="text-sm font-bold text-white hover:text-[#B8FF4D] transition-colors">
                            {article.title}
                          </Link>
                        </td>
                        <td className="px-6 sm:px-8 py-6 text-sm text-zinc-400">{article.category}</td>
                        <td className="px-6 sm:px-8 py-6 text-sm font-mono text-zinc-500">{article.views ?? 0}</td>
                        <td className="px-6 sm:px-8 py-6">
                          <span
                            className={cn(
                              'text-[10px] font-black uppercase tracking-widest',
                              article.status === 'published' ? 'text-[#B8FF4D]' : 'text-zinc-600',
                            )}
                          >
                            {article.status ?? 'draft'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* System + quick actions */}
            <div className="space-y-8">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">System Status</h2>
              <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 space-y-6">
                {systemRows.map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 bg-zinc-900 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{item.label}</p>
                    <span
                      className={cn(
                        'text-xl font-black',
                        item.attention ? 'text-red-500' : 'text-white',
                      )}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-[#B8FF4D] rounded-[40px] p-8 text-black space-y-4 shadow-xl shadow-[#B8FF4D]/10">
                <h3 className="text-sm font-black uppercase tracking-widest">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {quickActions.map((action) => (
                    <Link
                      key={action.label}
                      to={action.path}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-black/10 hover:bg-black/20 text-[10px] font-black uppercase tracking-widest transition-colors"
                    >
                      <action.icon size={13} /> {action.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
