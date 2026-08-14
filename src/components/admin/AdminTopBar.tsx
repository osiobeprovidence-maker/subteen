import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Avatar } from '../common/Avatar';
import { SearchOverlay } from '../common/SearchOverlay';
import { useAuth } from '../../context/AuthContext';
import { canAccessAdmin, canAccessEditor, roleLabel } from '../../lib/roles';

interface AdminTopBarProps {
  title: string;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({ title }) => {
  const { role, logout, user, dbUser } = useAuth();
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const counts = useQuery(api.articles.counts);
  const reports = useQuery(api.reports.list, {}) ?? [];
  const automation = useQuery(api.newsAutomation.overview);

  const isAdminRole = canAccessAdmin(role);
  const pendingReports = reports.filter((r) => r.status === 'pending').length;
  const pendingReview = counts?.pendingReview ?? 0;
  const draftsWaiting = counts?.drafts ?? 0;
  const awaitingReview = automation?.awaitingReview ?? 0;
  const failedImports = automation?.failedImports ?? 0;

  const baseNotifications = [
    { label: 'Articles pending review', value: pendingReview, href: isAdminRole ? '/admin/review-queue' : '/editor/review' },
    { label: 'AI drafts awaiting review', value: awaitingReview, href: '/admin/automation/reviews' },
    { label: 'Failed automation imports', value: failedImports, href: '/admin/automation' },
    ...(isAdminRole
      ? [
          { label: 'Draft articles', value: draftsWaiting, href: '/admin/articles' },
          { label: 'Pending member reports', value: pendingReports, href: '/admin/reports' },
        ]
      : []),
  ];

  const notifications = baseNotifications.filter((n) => n.value > 0);
  const attentionTotal = notifications.reduce((sum, n) => sum + n.value, 0);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (rootRef.current && !rootRef.current.contains(t)) {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <>
      <div
        ref={rootRef}
        className="sticky top-24 z-30 flex items-center justify-between gap-4 bg-zinc-950/80 backdrop-blur-md border border-white/5 rounded-2xl px-4 sm:px-6 py-3"
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Admin</span>
          <ChevronRight size={12} className="text-zinc-700 shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white truncate">{title}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setSearchOpen(true)}
            title="Search"
            className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            <Search size={17} />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              title="Notifications"
              className="relative p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              <Bell size={17} />
              {attentionTotal > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-black text-[9px] font-black flex items-center justify-center">
                  {attentionTotal > 99 ? '99+' : attentionTotal}
                </span>
              )}
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 pt-3 z-50"
                >
                  <div className="bg-zinc-950 border border-white/10 rounded-2xl p-2 w-[300px] shadow-2xl shadow-black/50 overflow-hidden">
                    <p className="px-3 pt-2 pb-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                      Needs attention
                    </p>
                    {notifications.length === 0 ? (
                      <p className="px-3 py-6 text-center text-xs text-zinc-600">All clear.</p>
                    ) : (
                      notifications.map((n) => (
                        <Link
                          key={n.label}
                          to={n.href}
                          onClick={() => setNotifOpen(false)}
                          className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.04] transition-colors"
                        >
                          <span className="text-xs font-bold text-zinc-300">{n.label}</span>
                          <span className="text-xs font-black text-red-400">{n.value}</span>
                        </Link>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-white/[0.05] transition-colors"
              aria-label="Account menu"
            >
              <Avatar src={dbUser?.avatar ?? user?.photoURL} name={user?.name} size={32} />
              <ChevronDown
                size={12}
                className={cn('text-zinc-400 transition-transform hidden sm:block', profileOpen && 'rotate-180')}
              />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 pt-3 z-50"
                >
                  <div className="bg-zinc-950 border border-white/10 rounded-2xl p-2 min-w-[210px] shadow-2xl shadow-black/50 overflow-hidden">
                    <div className="px-4 pt-3 pb-2 border-b border-white/[0.06] mb-1">
                      <p className="text-sm font-bold text-white truncate">{user?.name ?? 'Account'}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{roleLabel(role)}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                    >
                      Profile
                    </Link>
                    {canAccessEditor(role) && (
                      <Link
                        to="/editor"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                      >
                        Editor Studio
                      </Link>
                    )}
                    {isAdminRole && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <div className="h-px bg-white/[0.06] my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
