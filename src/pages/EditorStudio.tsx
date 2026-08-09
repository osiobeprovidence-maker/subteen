import React from 'react';
import { 
  Plus, 
  FileText, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Megaphone,
  Eye,
  MousePointer2,
  DollarSign
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { AdminCommunities } from '../components/admin/AdminCommunities';
import { cn } from '../lib/utils';
import { relativeTime } from '../lib/articleHelpers';
import { usePageTitle } from '../hooks/usePageTitle';

const STATUS_LABEL: Record<string, string> = {
  published: 'Published',
  draft: 'Draft',
  scheduled: 'Scheduled',
};

export const EditorStudio = () => {
  const location = useLocation();
  const path = location.pathname;
  const articles = useQuery(api.articles.listAll, {});
  const counts = useQuery(api.articles.counts);
  const removeArticle = useMutation(api.articles.remove);

  usePageTitle('Editor Studio');

  const handleDelete = async (id: any) => {
    await removeArticle({ id });
  };

  const all = articles ?? [];
  const stats = {
    totalViews: all.reduce((sum, a) => sum + (a.views ?? 0), 0),
    published: counts?.published ?? 0,
    drafts: counts?.drafts ?? 0,
    scheduled: counts?.scheduled ?? 0,
  };

  const getSection = () => {
    if (path.startsWith('/editor/articles')) return 'articles';
    if (path.startsWith('/editor/drafts')) return 'drafts';
    if (path.startsWith('/editor/published')) return 'published';
    if (path.startsWith('/editor/scheduled')) return 'scheduled';
    if (path.startsWith('/editor/communities')) return 'communities';
    if (path.startsWith('/editor/analytics')) return 'analytics';
    if (path.startsWith('/editor/ads')) return 'ads';
    return 'dashboard';
  };

  const section = getSection();

  const renderPerformance = () => (
    <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 lg:p-12">
      <h2 className="text-xl font-bold text-white uppercase tracking-tight mb-8">Performance Overview</h2>
      <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600">
          <BarChart3 size={24} />
        </div>
        <p className="text-sm font-bold text-zinc-500 max-w-sm">No analytics available yet. Publish articles to start tracking performance.</p>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: BarChart3 },
          { label: 'Published', value: String(stats.published), icon: CheckCircle },
          { label: 'Drafts', value: String(stats.drafts), icon: FileText },
          { label: 'Scheduled', value: String(stats.scheduled), icon: Clock },
        ].map(stat => (
          <div key={stat.label} className="bg-zinc-950 border border-white/5 p-8 rounded-[32px] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-black text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {renderPerformance()}
    </div>
  );

  const renderArticles = (statusFilter?: string) => {
    const filtered = all.filter(a => !statusFilter || a.status === statusFilter);
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-950 border border-white/5 p-6 rounded-[32px]">
          <div className="relative w-full sm:w-96">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="text" placeholder="Search your articles..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#B8FF4D] transition-colors" />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors">
              <Filter size={14} /> Filter
            </button>
          </div>
        </div>

        <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Title</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Views</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Avg. Time</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Updated</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center text-zinc-500 text-sm">
                    No {statusFilter ? `${STATUS_LABEL[statusFilter]?.toLowerCase() ?? statusFilter} articles` : 'articles'} yet. Create one to get started.
                  </td>
                </tr>
              )}
              {filtered.map((article) => (
                <tr key={article._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-6">
                    <Link to={`/editor/edit/${article._id}`} className="text-sm font-bold text-white group-hover:text-[#B8FF4D] transition-colors cursor-pointer">
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                      article.status === 'published' ? "bg-[#B8FF4D]/10 text-[#B8FF4D]" : article.status === 'scheduled' ? "bg-blue-400/10 text-blue-400" : "bg-zinc-800 text-zinc-500"
                    )}>
                      {STATUS_LABEL[article.status ?? 'draft'] ?? article.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm text-zinc-400 font-mono">{article.views ?? 0}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm text-zinc-400 font-mono">—</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm text-zinc-500">{relativeTime(article._creationTime)}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/editor/edit/${article._id}`} className="p-2 text-zinc-600 hover:text-white transition-colors" title="Edit">
                        <MoreVertical size={16} />
                      </Link>
                      <button onClick={() => handleDelete(article._id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAds = () => (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Ad Revenue', value: '$0', icon: DollarSign },
          { label: 'Ad Impressions', value: '0', icon: Eye },
          { label: 'Ad Clicks', value: '0', icon: MousePointer2 },
        ].map(stat => (
          <div key={stat.label} className="bg-zinc-950 border border-white/5 p-8 rounded-[32px] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-black text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 lg:p-12 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Active Campaigns in Your Articles</h2>
          <span className="text-xs font-bold text-zinc-500">0 ACTIVE CAMPAIGNS</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-600">
            <Megaphone size={24} />
          </div>
          <p className="text-sm font-bold text-zinc-500 max-w-sm">No active campaigns yet. Placements will appear here once campaigns go live.</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (section) {
      case 'articles': return renderArticles();
      case 'drafts': return renderArticles('draft');
      case 'published': return renderArticles('published');
      case 'scheduled': return renderArticles('scheduled');
      case 'analytics': return renderPerformance();
      case 'ads': return renderAds();
      case 'communities': return <AdminCommunities />;
      default: return renderDashboard();
    }
  };

  return (
    <div className="pb-32 pt-32 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/5 pb-10">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter">
              Editor <span className="text-[#B8FF4D]">{section === 'dashboard' ? 'Studio' : section}</span>
            </h1>
            <p className="text-zinc-500 font-medium text-lg">Manage your content and track performance.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/editor/new"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#B8FF4D] text-black text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(184,255,77,0.2)]"
            >
              <Plus size={16} /> New Article
            </Link>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};
