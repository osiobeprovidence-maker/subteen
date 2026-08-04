import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  FileText, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Megaphone,
  TrendingUp,
  Eye,
  MousePointer2,
  DollarSign
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { StoredArticle, deleteArticle, loadArticles } from '../lib/articleStore';

const relativeTime = (ts: number) => {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const EditorStudio = () => {
  const location = useLocation();
  const path = location.pathname;
  const [articles, setArticles] = useState<StoredArticle[]>([]);

  useEffect(() => {
    setArticles(loadArticles());
  }, [path]);

  const handleDelete = (id: string) => {
    deleteArticle(id);
    setArticles(loadArticles());
  };

  const counts = {
    published: articles.filter((a) => a.status === 'Published').length,
    drafts: articles.filter((a) => a.status === 'Draft').length,
    scheduled: articles.filter((a) => a.status === 'Scheduled').length,
  };

  const getSection = () => {
    if (path.startsWith('/editor/articles')) return 'articles';
    if (path.startsWith('/editor/drafts')) return 'drafts';
    if (path.startsWith('/editor/published')) return 'published';
    if (path.startsWith('/editor/scheduled')) return 'scheduled';
    if (path.startsWith('/editor/analytics')) return 'analytics';
    if (path.startsWith('/editor/ads')) return 'ads';
    return 'dashboard';
  };

  const section = getSection();

  const renderDashboard = () => (
    <div className="space-y-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Views', value: '1.2M', icon: BarChart3, change: '+12%' },
          { label: 'Published', value: String(counts.published), icon: CheckCircle, change: '' },
          { label: 'Drafts', value: String(counts.drafts), icon: FileText, change: '' },
          { label: 'Scheduled', value: String(counts.scheduled), icon: Clock, change: '' },
        ].map(stat => (
          <div key={stat.label} className="bg-zinc-950 border border-white/5 p-8 rounded-[32px] space-y-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <span className="text-[10px] font-bold text-[#B8FF4D] mb-1">{stat.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 lg:p-12">
        <h2 className="text-xl font-bold text-white uppercase tracking-tight mb-8">Performance Overview</h2>
        <div className="h-64 flex items-end justify-between gap-2">
          {[40, 70, 45, 90, 65, 80, 55, 75, 40, 85, 95, 60].map((h, i) => (
            <div key={i} className="flex-1 bg-zinc-900 rounded-t-lg relative group">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-[#B8FF4D] rounded-t-lg transition-all duration-500 group-hover:bg-white" 
                style={{ height: `${h}%` }} 
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-6 px-2">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
            <span key={m} className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{m}</span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderArticles = (statusFilter?: string) => (
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
            {articles.filter(a => !statusFilter || a.status === statusFilter).length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-16 text-center text-zinc-500 text-sm">
                  No {statusFilter ? `${statusFilter.toLowerCase()} articles` : 'articles'} yet. Create one to get started.
                </td>
              </tr>
            )}
            {articles.filter(a => !statusFilter || a.status === statusFilter).map((article) => (
              <tr key={article.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                <td className="px-8 py-6">
                  <Link to={`/editor/edit/${article.id}`} className="text-sm font-bold text-white group-hover:text-[#B8FF4D] transition-colors cursor-pointer">
                    {article.title}
                  </Link>
                </td>
                <td className="px-8 py-6">
                  <span className={cn(
                    "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                    article.status === 'Published' ? "bg-[#B8FF4D]/10 text-[#B8FF4D]" : article.status === 'Scheduled' ? "bg-blue-400/10 text-blue-400" : "bg-zinc-800 text-zinc-500"
                  )}>
                    {article.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm text-zinc-400 font-mono">—</p>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm text-zinc-400 font-mono">—</p>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm text-zinc-500">{relativeTime(article.updatedAt)}</p>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link to={`/editor/edit/${article.id}`} className="p-2 text-zinc-600 hover:text-white transition-colors" title="Edit">
                      <MoreVertical size={16} />
                    </Link>
                    <button onClick={() => handleDelete(article.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors" title="Delete">
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

  const renderAds = () => (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Ad Revenue', value: '$2,450', icon: DollarSign, change: '+5.2%' },
          { label: 'Ad Impressions', value: '142k', icon: Eye, change: '+2.1%' },
          { label: 'Ad Clicks', value: '4.2k', icon: MousePointer2, change: '+1.4%' },
        ].map(stat => (
          <div key={stat.label} className="bg-zinc-950 border border-white/5 p-8 rounded-[32px] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-black text-white">{stat.value}</p>
                <span className="text-xs font-bold text-[#B8FF4D]">{stat.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-950 border border-white/5 rounded-[40px] p-8 lg:p-12 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Active Campaigns in Your Articles</h2>
          <span className="text-xs font-bold text-zinc-500">2 ACTIVE CAMPAIGNS</span>
        </div>
        <div className="space-y-4">
          {[
            { advertiser: 'Razer', campaign: 'Kraken V4 Launch', placement: 'Article Inline', revenue: '$142.50' },
            { advertiser: 'Logitech', campaign: 'G Pro Series', placement: 'Sidebar', revenue: '$84.20' },
          ].map((ad, i) => (
            <div key={i} className="flex items-center justify-between p-6 bg-zinc-900 rounded-[24px] border border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500">
                  <Megaphone size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{ad.advertiser} - {ad.campaign}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{ad.placement}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-[#B8FF4D]">{ad.revenue}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Earned this month</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (section) {
      case 'articles': return renderArticles();
      case 'drafts': return renderArticles('Draft');
      case 'published': return renderArticles('Published');
      case 'ads': return renderAds();
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
            <div className="flex items-center gap-2 px-4 py-2 bg-[#B8FF4D]/10 border border-[#B8FF4D]/20 rounded-full text-[#B8FF4D] text-[10px] font-black uppercase tracking-widest">
              <TrendingUp size={14} /> Peak Writing Hours
            </div>
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
