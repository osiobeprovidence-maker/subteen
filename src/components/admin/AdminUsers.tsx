import React from 'react';
import { 
  Search, 
  Filter, 
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { ROLE_ORDER, Role, roleLabel } from '../../lib/roles';
import { Avatar } from '../common/Avatar';

export const AdminUsers = () => {
  const [activeTab, setActiveTab] = React.useState<'All Users' | 'Editors' | 'Permissions'>('All Users');
  const { role } = useAuth();
  const users = useQuery(api.users.list);
  const setRole = useMutation(api.users.setRole);
  const [error, setError] = React.useState<string | null>(null);
  const [savingId, setSavingId] = React.useState<Id<'users'> | null>(null);

  const isSuperAdmin = role === 'super_admin';

  const handleSetRole = async (userId: Id<'users'>, next: Role) => {
    setSavingId(userId);
    setError(null);
    try {
      await setRole({ userId, role: next });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update role.');
    } finally {
      setSavingId(null);
    }
  };

  const rows = users ?? [];
  const visible = activeTab === 'Editors' ? rows.filter((u) => u.role === 'editor') : rows;

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-center gap-2 p-1 bg-zinc-900 border border-white/5 rounded-2xl w-fit">
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

        {activeTab === 'Permissions' && (
          <div className="flex items-center gap-3 p-5 bg-[#B8FF4D]/5 border border-[#B8FF4D]/15 rounded-3xl">
            <ShieldCheck size={18} className="text-[#B8FF4D] shrink-0" />
            <p className="text-xs text-zinc-400 leading-relaxed">
              {isSuperAdmin
                ? 'You can assign or change user roles. Role changes take effect immediately.'
                : 'Only the super admin can assign or change roles. You have read-only access here.'}
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400">
            {error}
          </div>
        )}

        <div className="bg-zinc-950 border border-white/5 rounded-[40px] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">User</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Role</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Joined</th>
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {users === undefined && (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center text-zinc-500 text-sm">Loading users...</td>
                </tr>
              )}
              {users !== undefined && visible.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-16 text-center text-zinc-500 text-sm">No users found.</td>
                </tr>
              )}
              {visible.map((user) => (
                <tr key={user._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <Avatar src={user.avatar} name={user.name} size={40} />
                      <div>
                        <p className="text-sm font-bold text-white">{user.name}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {activeTab === 'Permissions' && isSuperAdmin ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={user.role ?? 'member'}
                          disabled={savingId === user._id}
                          onChange={(e) => handleSetRole(user._id, e.target.value as Role)}
                          className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#B8FF4D] disabled:opacity-50"
                        >
                          {ROLE_ORDER.map((r) => (
                            <option key={r} value={r}>{roleLabel(r)}</option>
                          ))}
                        </select>
                        {savingId === user._id && <Loader2 size={14} className="text-[#B8FF4D] animate-spin" />}
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-zinc-400">{roleLabel(user.role)}</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-sm text-zinc-500">{user.joined}</td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
                      user.status === 'active' ? "text-[#B8FF4D]" : "text-red-500"
                    )}>
                      {user.status}
                    </span>
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
