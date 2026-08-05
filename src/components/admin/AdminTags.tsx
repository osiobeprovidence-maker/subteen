import React from 'react';
import { 
  Tag as TagIcon, 
  Search, 
  Plus, 
  Trash2, 
  Combine,
  MoreVertical
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export const AdminTags = () => {
  const tags = useQuery(api.tags.list) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-950 border border-white/5 p-6 rounded-[32px]">
        <div className="relative w-full sm:w-96">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search tags..." 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#B8FF4D]" 
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors">
            <Combine size={14} /> Merge Duplicates
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#B8FF4D] text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-[#B8FF4D]/10">
            <Plus size={14} /> Add Tag
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tags.length === 0 && (
          <div className="col-span-full bg-zinc-950 border border-white/5 rounded-3xl py-16 text-center text-sm text-zinc-500">
            No tags yet. Add one to get started.
          </div>
        )}
        {tags.map((tag) => (
          <div key={tag._id} className="bg-zinc-950 border border-white/5 p-6 rounded-3xl group hover:border-[#B8FF4D]/30 transition-all flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-[#B8FF4D]">
                <TagIcon size={18} />
              </div>
              <button className="p-2 text-zinc-700 hover:text-white transition-colors">
                <MoreVertical size={14} />
              </button>
            </div>
            <div>
              <p className="text-sm font-bold text-white group-hover:text-[#B8FF4D] transition-colors">{tag.name}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">{tag.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
