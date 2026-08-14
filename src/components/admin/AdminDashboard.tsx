import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Users2,
  TrendingUp,
  ClipboardCheck,
  Flag,
  Sparkles,
  AlertTriangle,
  CalendarDays,
  Loader2,
  Plus,
  Radio,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export const AdminDashboard = () => {
  const stats = useQuery(api.admin.stats);
  const counts = useQuery(api.articles.counts);
  const reports = useQuery(api.reports.list, {}) ?? [];
  const automation = useQuery(api.newsAutomation.overview);

  const pendingReports = useMemo(() => reports.filter((r) => r.status === 'pending').length, [reports]);

  const pendingReview = counts?.pendingReview ?? 0;
  const awaitingReview = automation?.awaitingReview ?? 0;
  const failedImports = automation?.failedImports ?? 0;
  const draftEvents = stats?.draftEvents ?? 0;
  const upcomingEvents = stats?.upcomingEvents ?? 0;

  const platformStats = [
    { label: 'Published Today', value: String(stats?.publishedToday ?? 0), icon: TrendingUp, href: '/admin/articles' },
    { label: 'Total Articles', value: String(stats?.totalArticles ?? 0), icon: FileText, href: '/admin/articles' },
    { label: 'Total Users', value: String(stats?.totalUsers ?? 0), icon: Users2, href: '/admin/users' },
    { label: 'Active Editors', value: String(stats?.totalEditors ?? 0), icon: ClipboardCheck, href: '/admin/users' },
  ];

  const attention = [
    {
      label: 'Review Queue',
      description: 'Articles waiting for sign-off',
      value: pendingReview,
      icon: ClipboardCheck,
      href: '/admin/review-queue',
    },
    {
      label: 'AI Drafts Awaiting Review',
      description: 'Automation drafts in editorial review',
      value: awaitingReview,
      icon: Sparkles,
      href: '/admin/automation/reviews',
    },
    {
      label: 'Failed Imports',
      description: 'Stories that failed during sync',
      value: failedImports,
      icon: AlertTriangle,
      href: '/admin/automation',
    },
    {
      label: 'Draft Events',
      description: 'Event coverage not yet live',
      value: draftEvents,
      icon: CalendarDays,
      href: '/admin/events',
    },
    {
      label: 'Pending Reports',
      description: 'Member reports to review',
      value: pendingReports,
      icon: Flag,
      href: '/admin/reports',
    },
    {
      label: 'Upcoming Events',
      description: 'Live events happening soon',
      value: upcomingEvents,
      icon: CalendarDays,
      href: '/admin/events',
      positive: true,
    },
  ];

  const quickActions = [
    { label: 'New Article', path: '/editor/new', icon: Plus },
    { label: 'Review Queue', path: '/admin/review-queue', icon: ClipboardCheck },
    { label: 'Add RSS Source', path: '/admin/automation/sources', icon: Radio },
    { label: 'Create Event', path: '/admin/events', icon: CalendarDays },
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
            {platformStats.map((stat) => (
              <Link
                key={stat.label}
                to={stat.href}
                className="bg-zinc-950 border border-white/5 p-8 rounded-[32px] space-y-4 hover:border-[#B8FF4D]/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
                  <stat.icon size={20} />
                </div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black text-white group-hover:text-[#B8FF4D] transition-colors">{stat.value}</p>
              </Link>
            ))}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Needs Your Attention</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {attention.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="bg-zinc-950 border border-white/5 p-7 rounded-[28px] space-y-5 hover:border-[#B8FF4D]/30 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D] group-hover:bg-[#B8FF4D]/10 transition-colors">
                      <item.icon size={20} />
                    </div>
                    <span
                      className={cn(
                        'text-3xl font-black',
                        item.value > 0 ? (item.positive ? 'text-[#B8FF4D]' : 'text-red-400') : 'text-zinc-700',
                      )}
                    >
                      {item.value}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-white transition-colors">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-1">{item.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

            <div className="space-y-8">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Quick Actions</h2>
              <div className="bg-[#B8FF4D] rounded-[40px] p-8 text-black space-y-4 shadow-xl shadow-[#B8FF4D]/10">
                <div className="grid grid-cols-1 gap-2.5">
                  {quickActions.map((action) => (
                    <Link
                      key={action.label}
                      to={action.path}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-black/10 hover:bg-black/20 text-xs font-black uppercase tracking-widest transition-colors"
                    >
                      <action.icon size={15} /> {action.label}
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
