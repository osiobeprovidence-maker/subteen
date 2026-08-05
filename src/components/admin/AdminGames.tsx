import React from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Gamepad2, 
  Eye, 
  ChevronRight,
  Monitor,
  Layout,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export const AdminGames = () => {
  const [isAdding, setIsAdding] = React.useState(false);
  const games = useQuery(api.articles.listGames);
  const gameList = games ?? [];

  if (isAdding) {
    return (
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center justify-between border-b border-white/5 pb-8">
           <div className="space-y-1">
             <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Add New Game</h2>
             <p className="text-xs text-zinc-500 uppercase tracking-widest font-black">Register a new hub for the platform</p>
           </div>
           <button onClick={() => setIsAdding(false)} className="text-xs font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">Cancel</button>
        </div>

        <form className="space-y-12 pb-20" onSubmit={(e) => { e.preventDefault(); setIsAdding(false); }}>
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Game Name</label>
              <input type="text" placeholder="e.g. Grand Theft Auto VI" className="w-full bg-zinc-900 border border-white/5 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B8FF4D] transition-colors" />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Slug</label>
              <input type="text" placeholder="grand-theft-auto-6" className="w-full bg-zinc-900 border border-white/5 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B8FF4D] transition-colors" />
            </div>
          </div>

          {/* Media */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Cover Image (2:3)</label>
              <div className="aspect-[2/3] bg-zinc-900 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-[#B8FF4D]/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-zinc-600 group-hover:text-[#B8FF4D] transition-colors">
                  <ImageIcon size={24} />
                </div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Upload Cover</p>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Hero Banner (16:9)</label>
              <div className="aspect-video bg-zinc-900 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-[#B8FF4D]/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-zinc-600 group-hover:text-[#B8FF4D] transition-colors">
                  <Layout size={24} />
                </div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Upload Banner</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Developer</label>
              <input type="text" className="w-full bg-zinc-900 border border-white/5 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B8FF4D]" />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Publisher</label>
              <input type="text" className="w-full bg-zinc-900 border border-white/5 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B8FF4D]" />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Release Date</label>
              <input type="text" placeholder="2025-Q3" className="w-full bg-zinc-900 border border-white/5 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B8FF4D]" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Description</label>
            <textarea rows={4} className="w-full bg-zinc-900 border border-white/5 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B8FF4D] resize-none" />
          </div>

          <div className="pt-8">
            <button type="submit" className="w-full py-4 bg-[#B8FF4D] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-[#B8FF4D]/20">
              Create Game Hub
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-950 border border-white/5 p-6 rounded-[32px]">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#B8FF4D] text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-[#B8FF4D]/10"
          >
            <Plus size={14} /> Add Game
          </button>
          <div className="relative flex-1 sm:w-80">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search games..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#B8FF4D]" 
            />
          </div>
        </div>
      </div>

      {/* Games List */}
      <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/[0.02] border-b border-white/5">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Game</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Platforms</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Performance</th>
              <th className="px-8 py-6"></th>
            </tr>
          </thead>
          <tbody>
            {gameList.map((game) => (
              <tr key={game._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-16 rounded-lg overflow-hidden bg-zinc-900 border border-white/5">
                      <img src={game.coverImage} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-[#B8FF4D] transition-colors cursor-pointer">{game.title}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">{game.developer}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-wrap gap-1">
                    {game.platforms.map(p => (
                      <span key={p} className="text-[8px] font-black px-1.5 py-0.5 bg-zinc-900 border border-white/5 rounded-md text-zinc-400 uppercase tracking-tighter">
                        {p}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-[10px] font-black text-[#B8FF4D] uppercase tracking-widest">Live Hub</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <Eye size={12} className="text-zinc-600" />
                    <p className="text-sm font-mono text-zinc-400">—</p>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-zinc-500 hover:text-white transition-colors" title="Edit">
                      <Edit3 size={16} />
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
