import React from 'react';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { AdminArticles } from '../components/admin/AdminArticles';
import { AdminCategories } from '../components/admin/AdminCategories';
import { AdminTags } from '../components/admin/AdminTags';
import { AdminGames } from '../components/admin/AdminGames';
import { AdminUsers } from '../components/admin/AdminUsers';
import { AdminAds } from '../components/admin/AdminAds';
import { AdminCommunities } from '../components/admin/AdminCommunities';
import { AdminSettings } from '../components/admin/AdminSettings';
import { useLocation } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import { 
  TrendingUp, 
  Image as ImageIcon, 
  Flag, 
  Tag as TagIcon,
  Gamepad2,
  Search, 
  LayoutDashboard,
  FileText,
  Grid,
  Users,
  Megaphone,
  Library,
  AlertCircle,
  Settings
} from 'lucide-react';

export const AdminPanel = () => {
  const location = useLocation();
  const path = location.pathname;

  const getSection = () => {
    if (path.startsWith('/admin/articles')) return 'articles';
    if (path.startsWith('/admin/categories')) return 'categories';
    if (path.startsWith('/admin/tags')) return 'tags';
    if (path.startsWith('/admin/communities')) return 'communities';
    if (path.startsWith('/admin/games')) return 'games';
    if (path.startsWith('/admin/users')) return 'users';
    if (path.startsWith('/admin/ads')) return 'ads';
    if (path.startsWith('/admin/media')) return 'media';
    if (path.startsWith('/admin/reports')) return 'reports';
    if (path.startsWith('/admin/settings')) return 'settings';
    if (path.startsWith('/admin/placements')) return 'placements';
    return 'dashboard';
  };

  const section = getSection();

  const SECTION_TITLES: Record<string, string> = {
    dashboard: 'Dashboard',
    articles: 'Articles',
    communities: 'Communities',
    categories: 'Categories',
    tags: 'Tags',
    games: 'Games',
    users: 'Users',
    ads: 'Ads',
    placements: 'Placements',
    media: 'Media Library',
    reports: 'Reports',
    settings: 'Settings',
  };

  usePageTitle(SECTION_TITLES[section] ?? 'Dashboard');

  const renderMedia = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-zinc-950 border border-white/5 p-6 rounded-[32px]">
        <div className="flex gap-4">
          <button className="px-6 py-2 bg-[#B8FF4D] text-black rounded-xl font-black text-[10px] uppercase tracking-widest">Upload File</button>
          <div className="flex items-center gap-2 p-1 bg-zinc-900 rounded-xl">
             <button className="px-4 py-1.5 bg-zinc-800 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">All</button>
             <button className="px-4 py-1.5 text-zinc-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Images</button>
             <button className="px-4 py-1.5 text-zinc-500 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest">Videos</button>
          </div>
        </div>
        <div className="relative w-64">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input type="text" placeholder="Search media..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-square bg-zinc-950 border border-white/5 rounded-3xl group relative overflow-hidden cursor-pointer hover:border-[#B8FF4D]/30 transition-all">
            <div className="absolute inset-0 flex items-center justify-center text-zinc-800 group-hover:text-zinc-600 transition-colors">
              <ImageIcon size={32} />
            </div>
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <p className="text-[10px] font-bold text-white truncate w-full">image_asset_{i}.jpg</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-x-auto">
      <table className="w-full text-left min-w-[680px]">
        <thead className="bg-white/[0.02] border-b border-white/5">
          <tr>
            <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reason</th>
            <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reported Item</th>
            <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Reporter</th>
            <th className="px-6 sm:px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
            <th className="px-6 sm:px-8 py-6"></th>
          </tr>
        </thead>
        <tbody>
          {[
            { reason: 'Spam', item: 'GTA VI Leak Article', reporter: 'alex99', status: 'Pending' },
            { reason: 'Inappropriate', item: 'User Comment #128', reporter: 'gaming_fan', status: 'Resolved' },
          ].map((report, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
              <td className="px-6 sm:px-8 py-6 text-sm font-bold text-white">{report.reason}</td>
              <td className="px-6 sm:px-8 py-6 text-sm text-zinc-400">{report.item}</td>
              <td className="px-6 sm:px-8 py-6 text-sm text-zinc-500">{report.reporter}</td>
              <td className="px-6 sm:px-8 py-6">
                <span className={`text-[10px] font-black uppercase tracking-widest ${report.status === 'Pending' ? 'text-red-500' : 'text-[#B8FF4D]'}`}>
                  {report.status}
                </span>
              </td>
              <td className="px-6 sm:px-8 py-6 text-right">
                <button className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest">Resolve</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderContent = () => {
    switch (section) {
      case 'articles': return <AdminArticles />;
      case 'categories': return <AdminCategories />;
      case 'tags': return <AdminTags />;
      case 'communities': return <AdminCommunities />;
      case 'games': return <AdminGames />;
      case 'users': return <AdminUsers />;
      case 'ads': return <AdminAds />;
      case 'placements': return <AdminAds initialView="Placements" />;
      case 'media': return renderMedia();
      case 'reports': return renderReports();
      case 'settings': return <AdminSettings />;
      default: return <AdminDashboard />;
    }
  };

  const getIcon = () => {
    switch (section) {
      case 'dashboard': return <LayoutDashboard size={24} />;
      case 'articles': return <FileText size={24} />;
      case 'categories': return <Grid size={24} />;
      case 'tags': return <TagIcon size={24} />;
      case 'communities': return <Gamepad2 size={24} />;
      case 'games': return <Gamepad2 size={24} />;
      case 'users': return <Users size={24} />;
      case 'ads': return <Megaphone size={24} />;
      case 'placements': return <Megaphone size={24} />;
      case 'media': return <Library size={24} />;
      case 'reports': return <AlertCircle size={24} />;
      case 'settings': return <Settings size={24} />;
      default: return null;
    }
  };

  return (
    <div className="pb-32 pt-32 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/5 pb-10">
          <div className="space-y-4">
             <div className="flex items-center gap-3 text-[#B8FF4D]">
               {getIcon()}
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Subteen CMS</span>
             </div>
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter">
                {SECTION_TITLES[section] ?? 'Dashboard'}
              </h1>
              <p className="text-zinc-500 font-medium text-lg">Manage your publication and track platform health.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 text-[10px] font-black uppercase tracking-widest">
            <TrendingUp size={14} /> High Traffic Mode
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};
