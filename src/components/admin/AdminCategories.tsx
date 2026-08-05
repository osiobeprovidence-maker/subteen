import React from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  ChevronRight,
  Search,
  Grid,
  FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export const AdminCategories = () => {
  const [isCreating, setIsCreating] = React.useState(false);
  const categories = useQuery(api.categories.list) ?? [];

  if (isCreating) {
    return (
      <div className="max-w-2xl mx-auto space-y-12">
        <div className="flex items-center justify-between border-b border-white/5 pb-8">
           <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Create Category</h2>
           <button onClick={() => setIsCreating(false)} className="text-xs font-black text-zinc-500 hover:text-white uppercase tracking-widest">Cancel</button>
        </div>
        
        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); setIsCreating(false); }}>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Category Name</label>
              <input type="text" placeholder="e.g. Mobile Gaming" className="w-full bg-zinc-900 border border-white/5 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B8FF4D]" />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Slug</label>
              <input type="text" placeholder="mobile-gaming" className="w-full bg-zinc-900 border border-white/5 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B8FF4D]" />
            </div>
          </div>
          
          <div className="space-y-4">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Description</label>
            <textarea rows={3} className="w-full bg-zinc-900 border border-white/5 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B8FF4D] resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Icon (Emoji)</label>
              <input type="text" placeholder="📱" className="w-full bg-zinc-900 border border-white/5 rounded-xl px-5 py-3 text-white text-sm focus:outline-none focus:border-[#B8FF4D]" />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Status</label>
              <select className="w-full bg-zinc-900 border border-white/5 rounded-xl px-5 py-3 text-white text-sm appearance-none focus:outline-none">
                <option>Active</option>
                <option>Disabled</option>
              </select>
            </div>
          </div>

          <div className="pt-8">
            <button type="submit" className="w-full py-4 bg-[#B8FF4D] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-[#B8FF4D]/20">
              Save Category
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-950 border border-white/5 p-6 rounded-[32px]">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search categories..." 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#B8FF4D]" 
          />
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#B8FF4D] text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-[#B8FF4D]/10"
        >
          <Plus size={14} /> Create Category
        </button>
      </div>

      <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Icon</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Category</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Slug</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Articles</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-16 text-center text-zinc-500 text-sm">
                  No categories yet. Create one to get started.
                </td>
              </tr>
            )}
            {categories.map((cat) => (
              <tr key={cat._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                <td className="px-8 py-6 text-2xl">{cat.icon}</td>
                <td className="px-8 py-6">
                  <p className="text-sm font-bold text-white">{cat.name}</p>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm text-zinc-500 font-mono">{cat.slug}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <FileText size={14} className="text-zinc-700" />
                    <span className="text-sm font-mono">—</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    cat.status === 'Active' ? "text-[#B8FF4D]" : "text-zinc-700"
                  )}>
                    {cat.status}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-zinc-500 hover:text-white transition-colors"><Edit3 size={16} /></button>
                    <button className="p-2 text-zinc-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
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
