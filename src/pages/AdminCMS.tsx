import React from 'react';
import { LayoutDashboard, FileText, Gamepad, Settings, Plus, BarChart3, Users, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const STATUS_LABEL: Record<string, string> = {
  published: 'Published',
  draft: 'Draft',
  scheduled: 'Scheduled',
};

export const AdminCMS = () => {
  const articles = useQuery(api.articles.listAll, {});
  const games = useQuery(api.articles.listGames);
  const users = useQuery(api.users.list);
  const articleList = articles ?? [];
  const gameCount = games?.length ?? 0;
  const userCount = users?.length ?? 0;
  const totalViews = articleList.reduce((sum, a) => sum + (a.views ?? 0), 0);
  return (
    <div className="min-h-screen bg-black flex pt-20">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 p-6 space-y-10 hidden md:block">
        <div className="space-y-4">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-4">MAIN</p>
          <nav className="space-y-1">
            {[
              { name: 'Dashboard', icon: LayoutDashboard, active: true },
              { name: 'Articles', icon: FileText },
              { name: 'Games', icon: Gamepad },
              { name: 'Media', icon: ImageIcon },
            ].map(item => (
              <button key={item.name} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${item.active ? 'bg-[#B8FF4D] text-black shadow-lg shadow-[#B8FF4D]/20' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}>
                <item.icon size={18} />
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-4">SYSTEM</p>
          <nav className="space-y-1">
            {[
              { name: 'Analytics', icon: BarChart3 },
              { name: 'Authors', icon: Users },
              { name: 'Settings', icon: Settings },
            ].map(item => (
              <button key={item.name} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-zinc-500 hover:bg-zinc-900 hover:text-white transition-all">
                <item.icon size={18} />
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 space-y-12">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-white">DASHBOARD</h1>
          <Link 
            to="/admin/editor"
            className="bg-[#B8FF4D] text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white transition-all shadow-lg shadow-[#B8FF4D]/10"
          >
            <Plus size={20} /> NEW ARTICLE
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Views', value: totalViews.toLocaleString(), icon: BarChart3 },
            { label: 'Articles', value: articleList.length, icon: FileText },
            { label: 'Games Tracked', value: gameCount, icon: Gamepad },
            { label: 'Members', value: userCount, icon: Users },
          ].map(stat => (
            <div key={stat.label} className="bg-zinc-950 border border-white/5 p-8 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-zinc-900 rounded-2xl text-zinc-400">
                  <stat.icon size={20} />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-4xl font-black text-white mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Articles Table */}
        <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-hidden">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-black text-white">RECENT ARTICLES</h3>
            <button className="text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-8 text-[10px] font-black text-zinc-600 uppercase tracking-widest">TITLE</th>
                  <th className="p-8 text-[10px] font-black text-zinc-600 uppercase tracking-widest">CATEGORY</th>
                  <th className="p-8 text-[10px] font-black text-zinc-600 uppercase tracking-widest">DATE</th>
                  <th className="p-8 text-[10px] font-black text-zinc-600 uppercase tracking-widest">STATUS</th>
                  <th className="p-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {articleList.map(article => (
                  <tr key={article._id} className="group hover:bg-zinc-900/50 transition-colors">
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-900 shrink-0">
                          {article.heroImage ? (
                            <img src={article.heroImage} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-700">
                              <ImageIcon size={18} />
                            </div>
                          )}
                        </div>
                        <p className="font-bold text-white leading-tight">{article.title}</p>
                      </div>
                    </td>
                    <td className="p-8">
                      <span className="text-xs font-bold text-[#B8FF4D] uppercase tracking-widest">{article.category}</span>
                    </td>
                    <td className="p-8 text-sm text-zinc-500">
                      {article.publishDate}
                    </td>
                    <td className="p-8">
                      <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        {STATUS_LABEL[article.status ?? 'draft'] ?? 'Draft'}
                      </span>
                    </td>
                    <td className="p-8 text-right">
                      <button className="text-zinc-600 hover:text-white transition-colors">
                        <Settings size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
