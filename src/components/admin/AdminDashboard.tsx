import React from 'react';
import { 
  FileText, 
  Users, 
  DollarSign, 
  Megaphone, 
  Clock, 
  TrendingUp,
  Search,
  Eye,
  MoreVertical,
  Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export const AdminDashboard = () => {
  const articles = useQuery(api.articles.listAll, {}) ?? [];
  const counts = useQuery(api.articles.counts);

  const stats = [
    { label: 'Published Today', value: String(counts?.published ?? 0), change: '+2', icon: FileText },
    { label: 'Drafts Waiting', value: String(counts?.drafts ?? 0), change: '-1', icon: Clock },
    { label: 'Scheduled', value: String(counts?.scheduled ?? 0), change: '+3', icon: Activity },
    { label: 'Daily Revenue', value: '$842', change: '+12%', icon: DollarSign },
  ];

  const recentArticles = articles.slice(0, 5);

  return (
    <div className="space-y-12">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-zinc-950 border border-white/5 p-8 rounded-[32px] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <span className={cn(
                  "text-[10px] font-bold mb-1",
                  stat.change.startsWith('+') ? "text-[#B8FF4D]" : stat.change.startsWith('-') ? "text-red-500" : "text-zinc-500"
                )}>
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Articles */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Recent Content</h2>
            <button className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest">View All</button>
          </div>
          <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02] border-b border-white/5">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Title</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Author</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Views</th>
                  <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentArticles.map((article) => (
                  <tr key={article._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-white truncate max-w-[200px]">{article.title}</p>
                    </td>
                    <td className="px-8 py-6 text-sm text-zinc-400">{article.authorName ?? 'Staff Writer'}</td>
                    <td className="px-8 py-6 text-sm font-mono text-zinc-500">{article.views ?? 0}</td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        article.status === 'published' ? "text-[#B8FF4D]" : "text-zinc-600"
                      )}>{article.status ?? 'draft'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System & Side Stats */}
        <div className="space-y-8">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">System Status</h2>
          <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 space-y-6">
            {[
              { label: 'Active Editors', value: '12', status: 'Online' },
              { label: 'Server Load', value: '24%', status: 'Stable' },
              { label: 'Pending Reports', value: '2', status: 'Attention' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-4 bg-zinc-900 rounded-2xl border border-white/5">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{item.label}</p>
                  <p className="text-xl font-black text-white">{item.value}</p>
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  item.status === 'Online' || item.status === 'Stable' ? "text-[#B8FF4D]" : "text-red-500"
                )}>{item.status}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#B8FF4D] rounded-[40px] p-8 text-black space-y-4 shadow-xl shadow-[#B8FF4D]/10">
            <h3 className="text-sm font-black uppercase tracking-widest">Platform Note</h3>
            <p className="text-xs font-bold leading-relaxed">GTA VI coverage is driving 40% of current traffic. Recommend increasing Guide content for high retention.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
