import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowLeft, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  adminNavFor,
  adminCanSeeItem,
  isAdminItemActive,
  isAdminGroupActive,
  type AdminNavEntry,
} from '../../lib/adminNavigation';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../common/BrandLogo';
import { usePageTitle } from '../../hooks/usePageTitle';
import { roleLabel, type Role } from '../../lib/roles';
import { AdminTopBar } from './AdminTopBar';

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

type NavRole = Role | string | null | undefined;

const SidebarNav = ({
  entries,
  pathname,
  role,
  onNavigate,
}: {
  entries: AdminNavEntry[];
  pathname: string;
  role: NavRole;
  onNavigate?: () => void;
}) => (
  <nav className="space-y-1">
    {entries.map((entry) => {
      if (entry.kind === 'link') {
        const Icon = entry.icon;
        return (
          <Link
            key={entry.name}
            to={entry.path}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-colors',
              isAdminItemActive(pathname, entry.path, entry)
                ? 'bg-[#B8FF4D]/10 text-[#B8FF4D]'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]',
            )}
          >
            {Icon && <Icon size={15} className="shrink-0" />}
            <span className="truncate">{entry.name}</span>
          </Link>
        );
      }
      const Icon = entry.icon;
      const groupActive = isAdminGroupActive(pathname, entry.items);
      const visibleItems = entry.items.filter((item) => adminCanSeeItem(item, role));
      return (
        <div key={entry.name} className="pt-5">
          <p
            className={cn(
              'flex items-center gap-2 px-3 pb-2 text-[10px] font-black uppercase tracking-widest',
              groupActive ? 'text-[#B8FF4D]/80' : 'text-zinc-600',
            )}
          >
            {Icon && <Icon size={13} />}
            {entry.name}
          </p>
          <div className="space-y-0.5">
            {visibleItems.map((item) => {
              const ItemIcon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 pl-9 pr-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors',
                    isAdminItemActive(pathname, item.path, item)
                      ? 'bg-[#B8FF4D]/10 text-[#B8FF4D]'
                      : 'text-zinc-500 hover:text-white hover:bg-white/[0.04]',
                  )}
                >
                  {ItemIcon && <ItemIcon size={14} className="shrink-0" />}
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      );
    })}
  </nav>
);

const SidebarRail = ({
  entries,
  pathname,
  role,
}: {
  entries: AdminNavEntry[];
  pathname: string;
  role: NavRole;
}) => {
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && !t.closest('[data-admin-rail]')) setOpenGroup(null);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const railLinkClass = (active: boolean) =>
    cn(
      'group relative flex w-full items-center justify-center px-3 py-2.5 rounded-xl transition-colors',
      active ? 'bg-[#B8FF4D]/10 text-[#B8FF4D]' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]',
    );

  return (
    <nav data-admin-rail className="space-y-1">
      {entries.map((entry) => {
        if (entry.kind === 'link') {
          const Icon = entry.icon;
          return (
            <Link
              key={entry.name}
              to={entry.path}
              title={entry.name}
              className={railLinkClass(isAdminItemActive(pathname, entry.path, entry))}
            >
              {Icon && <Icon size={17} className="shrink-0" />}
            </Link>
          );
        }
        const Icon = entry.icon;
        const groupActive = isAdminGroupActive(pathname, entry.items);
        const visibleItems = entry.items.filter((item) => adminCanSeeItem(item, role));
        const isOpen = openGroup === entry.name;
        return (
          <div key={entry.name} className="relative">
            <button
              onClick={() => setOpenGroup(isOpen ? null : entry.name)}
              title={entry.name}
              className={cn(railLinkClass(groupActive || isOpen), isOpen && 'bg-white/[0.04] text-white')}
            >
              {Icon && <Icon size={17} className="shrink-0" />}
            </button>
            {isOpen && (
              <div className="absolute left-full top-0 ml-2 z-50 w-52 bg-zinc-950 border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/50 overflow-hidden">
                <p className="px-3 pt-2 pb-1 text-[9px] font-black uppercase tracking-widest text-zinc-600">{entry.name}</p>
                {visibleItems.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setOpenGroup(null)}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors',
                        isAdminItemActive(pathname, item.path, item)
                          ? 'bg-[#B8FF4D]/10 text-[#B8FF4D]'
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]',
                      )}
                    >
                      {ItemIcon && <ItemIcon size={14} className="shrink-0" />}
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({ title, subtitle, actions, children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { role } = useAuth();

  usePageTitle(title);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('subteen:admin:sidebar');
      if (saved !== null) setCollapsed(saved === '1');
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      try {
        localStorage.setItem('subteen:admin:sidebar', v ? '0' : '1');
      } catch {
        // ignore storage errors
      }
      return !v;
    });
  };

  const entries = adminNavFor(role);

  return (
    <div className="pt-24 lg:pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto lg:flex lg:gap-10">
        {/* Desktop sidebar */}
        <aside className={cn('hidden lg:block shrink-0 transition-all duration-300', collapsed ? 'w-[72px]' : 'w-64')}>
          <div className="sticky top-28 flex flex-col gap-6 max-h-[calc(100vh-8rem)]">
            <div className={cn('flex items-center gap-3', collapsed ? 'justify-center' : 'px-3')}>
              <Link to="/" title="Back to site" className="shrink-0">
                <BrandLogo variant="icon" className="h-8" />
              </Link>
              {!collapsed && (
                <div className="leading-tight">
                  <p className="text-xs font-black text-white uppercase tracking-[0.3em]">Subteen</p>
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Admin Control Center</p>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto -mr-1 pr-1">
              {collapsed ? (
                <SidebarRail entries={entries} pathname={location.pathname} role={role} />
              ) : (
                <SidebarNav entries={entries} pathname={location.pathname} role={role} />
              )}
            </div>

            <div className="pt-4 border-t border-white/5 space-y-3">
              {!collapsed && (
                <div className="px-3 space-y-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#B8FF4D]/10 text-[#B8FF4D] text-[9px] font-black uppercase tracking-widest">
                    {roleLabel(role)}
                  </span>
                  <Link
                    to="/"
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
                  >
                    <ArrowLeft size={12} /> Back to site
                  </Link>
                </div>
              )}
              <button
                onClick={toggleCollapsed}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-colors"
              >
                {collapsed ? (
                  <PanelLeftOpen size={16} />
                ) : (
                  <>
                    <PanelLeftClose size={15} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Collapse</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <main className="flex-1 min-w-0 space-y-8">
          {/* Mobile top bar */}
          <div className="lg:hidden flex items-center justify-between">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-300"
            >
              <Menu size={14} /> Admin Menu
            </button>
            <BrandLogo variant="icon" className="h-7" />
          </div>

          <AdminTopBar title={title} />

          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 border-b border-white/5 pb-8">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#B8FF4D]">Subteen Admin</p>
              <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter">{title}</h1>
              {subtitle && <p className="text-zinc-500 font-medium">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
          </div>

          {children}
        </main>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-zinc-950 border-r border-white/10 p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BrandLogo variant="icon" className="h-8" />
                <p className="text-xs font-black text-white uppercase tracking-[0.3em]">Subteen</p>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.05]">
                <X size={18} />
              </button>
            </div>
            <SidebarNav entries={entries} pathname={location.pathname} role={role} onNavigate={() => setDrawerOpen(false)} />
            <div className="mt-6 pt-4 border-t border-white/5 space-y-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#B8FF4D]/10 text-[#B8FF4D] text-[9px] font-black uppercase tracking-widest">
                {roleLabel(role)}
              </span>
              <Link
                to="/"
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
              >
                <ArrowLeft size={12} /> Back to site
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
