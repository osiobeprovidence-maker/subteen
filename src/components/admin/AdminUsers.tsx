import React from 'react';
import { 
  Users, 
  UserSquare2, 
  Shield, 
  MoreVertical, 
  Ban, 
  UserPlus, 
  Search, 
  Filter, 
  ChevronRight,
  TrendingUp,
  Mail,
  UserCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const AdminUsers = () => {
  const [activeTab, setActiveTab] = React.useState<'All Users' | 'Editors' | 'Permissions'>('All Users');

  const users = [
    { name: 'John Doe', email: 'john@example.com', role: 'Super Admin', joined: 'Mar 2024', status: 'Active', articles: 0 },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', joined: 'Apr 2024', status: 'Active', articles: 42 },
    { name: 'Bob Wilson', email: 'bob@example.com', role: 'User', joined: 'May 2024', status: 'Suspended', articles: 0 },
    { name: 'Sarah Connor', email: 'sarah@skynet.com', role: 'Editor', joined: 'Jun 2024', status: 'Active', articles: 12 },
    { name: 'Marcus Thorne', email: 'marcus@gaming.com', role: 'Editor', joined: 'Feb 2024', status: 'Active', articles: 84 },
  ];

  const editors = users.filter(u => u.role === 'Editor');

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-2 p-1 bg-zinc-900 border border-white/5 rounded-2xl w-fit">
        {['All Users', 'Editors', 'Permissions'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === tab ? "bg-[#B8FF4D] text-black shadow-lg" : "text-zinc-500 hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-950 border border-white/5 p-6 rounded-[32px]">
          <div className="relative w-full sm:w-96">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder={`Search ${activeTab.toLowerCase()}...`} 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#B8FF4D]" 
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-colors">
            <Filter size={14} /> Filter
          </button>
        </div>

        <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">User</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Role</th>
                {activeTab === 'Editors' && <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Articles</th>}
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Joined</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6"></th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'Editors' ? editors : users).map((user, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-600 border border-white/5 group-hover:border-[#B8FF4D]/30 transition-colors">
                        <Users size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{user.name}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-zinc-400">{user.role}</span>
                  </td>
                  {activeTab === 'Editors' && (
                    <td className="px-8 py-6">
                      <p className="text-sm font-mono text-zinc-400">{user.articles}</p>
                    </td>
                  )}
                  <td className="px-8 py-6 text-sm text-zinc-500">{user.joined}</td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                      user.status === 'Active' ? "text-[#B8FF4D]" : "text-red-500"
                    )}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <button className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest">Manage</button>
                    <button className="text-[10px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-widest">Ban</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
