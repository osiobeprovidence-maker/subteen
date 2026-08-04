import React from 'react';
import { 
  FileText, 
  Trash2, 
  Edit3, 
  Star, 
  Archive, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical,
  Eye,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

export const AdminArticles = () => {
  const articles = [
    { id: 1, title: 'GTA VI Release Date Leaked?', author: 'Marcus Thorne', category: 'News', views: '124k', status: 'Published', date: 'Oct 24, 2024' },
    { id: 2, title: 'Elden Ring DLC Guide', author: 'Elena Vance', category: 'Guides', views: '18k', status: 'Draft', date: 'Oct 23, 2024' },
    { id: 3, title: 'New PS5 Slim Review', author: 'Sarah Connor', category: 'Reviews', views: '82k', status: 'Published', date: 'Oct 22, 2024' },
    { id: 4, title: 'The Future of VR Gaming', author: 'Marcus Thorne', category: 'News', views: '45k', status: 'Published', date: 'Oct 21, 2024' },
    { id: 5, title: 'Top 10 Indie Games of 2024', author: 'Elena Vance', category: 'Guides', views: '12k', status: 'Scheduled', date: 'Oct 20, 2024' },
  ];

  return (
    <div className="space-y-8">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-950 border border-white/5 p-6 rounded-[32px]">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Link 
            to="/editor/new"
            className="flex items-center gap-2 px-6 py-3 bg-[#B8FF4D] text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-[#B8FF4D]/10"
          >
            <Plus size={14} /> New Article
          </Link>
          <div className="relative flex-1 sm:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search articles..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#B8FF4D] transition-colors" 
            />
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors">
            <Filter size={14} /> Filter
          </button>
          <div className="h-10 w-px bg-white/5 mx-2 hidden sm:block" />
          <button className="flex-1 sm:flex-none text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-red-500 transition-colors">Bulk Delete</button>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Article</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Author</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Views</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-10 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-800">
                      <ImageIcon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-[#B8FF4D] transition-colors cursor-pointer">{article.title}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">{article.category} • {article.date}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm text-zinc-400">{article.author}</p>
                </td>
                <td className="px-8 py-6">
                   <div className="flex items-center gap-2">
                     <Eye size={12} className="text-zinc-600" />
                     <p className="text-sm text-zinc-400 font-mono">{article.views}</p>
                   </div>
                </td>
                <td className="px-8 py-6">
                  <span className={cn(
                    "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                    article.status === 'Published' ? "bg-[#B8FF4D]/10 text-[#B8FF4D]" : 
                    article.status === 'Draft' ? "bg-zinc-800 text-zinc-500" : "bg-blue-500/10 text-blue-400"
                  )}>
                    {article.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <Link to={`/editor/edit/${article.id}`} className="p-2 text-zinc-500 hover:text-white transition-colors" title="Edit">
                      <Edit3 size={16} />
                    </Link>
                    <button className="p-2 text-zinc-500 hover:text-[#B8FF4D] transition-colors" title="Feature">
                      <Star size={16} />
                    </button>
                    <button className="p-2 text-zinc-500 hover:text-red-500 transition-colors" title="Delete">
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
