import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Bookmark, History, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Avatar } from '../common/Avatar';
import { BrandLogo } from '../common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { canAccessEditor, Role } from '../../lib/roles';
import {
  adminNavFor,
  isAdminItemActive,
  isAdminGroupActive,
} from '../../lib/adminNavigation';

const SearchOverlay = lazy(() => import('../common/SearchOverlay').then((m) => ({ default: m.SearchOverlay })));

const NAV_LINKS = [
  { name: 'News', path: '/category/news' },
  { name: 'Reviews', path: '/category/reviews' },
  { name: 'Guides', path: '/category/guides' },
  { name: 'Communities', path: '/communities' },
];

const ROLE_LINKS: { roles: (Role | undefined)[]; name: string; path: string }[] = [
  { roles: ['editor', 'admin', 'super_admin'], name: 'Editor Studio', path: '/editor' },
  { roles: ['admin', 'super_admin'], name: 'Admin Panel', path: '/admin' },
  { roles: ['editor', 'admin', 'super_admin'], name: 'News Automation', path: '/admin/automation' },
];

const navLinksFor = (role: Role | undefined) => {
  const links = [...NAV_LINKS];
  for (const entry of ROLE_LINKS) {
    if (entry.roles.includes(role)) {
      links.push({ name: entry.name, path: entry.path });
    }
  }
  return links;
};

const ADMIN_LINKS = [
  { name: 'Dashboard', path: '/admin' },
  { name: 'Articles', path: '/admin/articles' },
  { name: 'Communities', path: '/admin/communities' },
  { name: 'Review Queue', path: '/admin/review-queue' },
  { name: 'Games', path: '/admin/games' },
  { name: 'Categories', path: '/admin/categories' },
  { name: 'Tags', path: '/admin/tags' },
  { name: 'Users', path: '/admin/users' },
  { name: 'Ads', path: '/admin/ads' },
  { name: 'Media', path: '/admin/media' },
  { name: 'Reports', path: '/admin/reports' },
  { name: 'Settings', path: '/admin/settings' },
  { name: 'Automation', path: '/admin/automation' },
];

const EDITOR_LINKS = [
  { name: 'Dashboard', path: '/editor' },
  { name: 'Articles', path: '/editor/articles' },
  { name: 'Communities', path: '/editor/communities' },
  { name: 'Review Queue', path: '/editor/review' },
  { name: 'Drafts', path: '/editor/drafts' },
  { name: 'Published', path: '/editor/published' },
  { name: 'Scheduled', path: '/editor/scheduled' },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const { isLoggedIn, logout, role, user, dbUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminPath = location.pathname.startsWith('/admin');
  const isEditorPath = location.pathname.startsWith('/editor');

  const currentLinks = isAdminPath ? ADMIN_LINKS : isEditorPath ? EDITOR_LINKS : navLinksFor(role);
  const adminNav = isAdminPath ? adminNavFor(role) : [];

  useEffect(() => {
    setOpenMenu(null);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!openMenu && !profileOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (!t.closest('[data-admin-nav]')) setOpenMenu(null);
      if (!t.closest('[data-admin-profile]')) setProfileOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [openMenu, profileOpen]);

  useEffect(() => {
    if (!openMenu && !profileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
        setProfileOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [openMenu, profileOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const adminLinkClass = (active: boolean) =>
    cn(
      'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-colors',
      active ? 'bg-[#B8FF4D] text-black' : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
    );

  const handleLogout = async () => {
    setIsOpen(false);
    setProfileOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b pwa-nav',
          isScrolled
            ? 'bg-black/80 backdrop-blur-md border-white/10 py-3'
            : 'bg-transparent border-transparent py-5'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-12 min-w-0">
            <Link to="/" className="shrink-0">
              <BrandLogo variant="dark" className="hidden md:inline-block text-xl sm:text-2xl h-7 sm:h-8" />
              <BrandLogo variant="icon" className="md:hidden h-7 sm:h-8" />
            </Link>

            {isAdminPath ? (
              <div data-admin-nav className="hidden lg:flex items-center gap-1 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {adminNav.map((entry) =>
                  entry.kind === 'link' ? (
                    <Link
                      key={entry.name}
                      to={entry.path}
                      className={adminLinkClass(isAdminItemActive(location.pathname, entry.path))}
                    >
                      {entry.name}
                    </Link>
                  ) : (
                    <div key={entry.name} className="relative shrink-0">
                      <button
                        onClick={() => setOpenMenu(openMenu === entry.name ? null : entry.name)}
                        className={adminLinkClass(isAdminGroupActive(location.pathname, entry.items))}
                      >
                        {entry.name}
                        <ChevronDown size={12} className={cn('transition-transform', openMenu === entry.name && 'rotate-180')} />
                      </button>
                      <AnimatePresence>
                        {openMenu === entry.name && (
                          <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 pt-3 z-50"
                          >
                            <div className="bg-zinc-950 border border-white/10 rounded-2xl p-2 min-w-[210px] shadow-2xl shadow-black/50 overflow-hidden">
                              {entry.items.map((item) => (
                                <Link
                                  key={item.name}
                                  to={item.path}
                                  onClick={() => setOpenMenu(null)}
                                  className={cn(
                                    'flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors',
                                    isAdminItemActive(location.pathname, item.path)
                                      ? 'text-[#B8FF4D] bg-white/[0.04]'
                                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                                  )}
                                >
                                  {item.name}
                                  {isAdminItemActive(location.pathname, item.path) && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8FF4D] shrink-0" />
                                  )}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-8">
                {currentLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={cn(
                      'text-sm font-medium tracking-wide transition-colors hover:text-[#B8FF4D]',
                      location.pathname === link.path ? 'text-[#B8FF4D]' : 'text-zinc-400'
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {!isEditorPath && (
              <button
                onClick={() => setIsSearchOpen(true)}
                className={cn('text-zinc-400 hover:text-white transition-colors p-1', !isAdminPath && 'hidden md:block')}
                aria-label="Search"
              >
                <Search size={20} />
              </button>
            )}

            {isEditorPath && canAccessEditor(role) && (
              <Link
                to="/editor/new"
                className="hidden md:flex items-center gap-2 px-5 py-2 rounded-full bg-[#B8FF4D] text-black text-sm font-bold hover:bg-white transition-colors"
              >
                + New Article
              </Link>
            )}

            {isLoggedIn ? (
              <div className={cn('items-center gap-3 sm:gap-5', isAdminPath ? 'flex' : 'hidden md:flex')}>
                {!isAdminPath && (
                  <>
                    <Link to="/bookmarks" className="hidden md:block text-zinc-400 hover:text-white transition-colors">
                      <Bookmark size={20} />
                    </Link>
                    <Link to="/history" className="hidden md:block text-zinc-400 hover:text-white transition-colors">
                      <History size={20} />
                    </Link>
                  </>
                )}
                {isAdminPath ? (
                  <div className="relative" data-admin-profile>
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-white/[0.05] transition-colors"
                      aria-label="Account menu"
                      aria-expanded={profileOpen}
                    >
                      <Avatar src={dbUser?.avatar ?? user?.photoURL} name={user?.name} size={34} />
                      <ChevronDown size={12} className={cn('text-zinc-400 transition-transform hidden sm:block', profileOpen && 'rotate-180')} />
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
                          <div className="bg-zinc-950 border border-white/10 rounded-2xl p-2 min-w-[200px] shadow-2xl shadow-black/50 overflow-hidden">
                            <div className="px-4 pt-3 pb-2 border-b border-white/[0.06] mb-1">
                              <p className="text-sm font-bold text-white truncate">{user?.name ?? 'Account'}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{role}</p>
                            </div>
                            <Link
                              to="/profile"
                              onClick={() => setProfileOpen(false)}
                              className="block px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                            >
                              Profile
                            </Link>
                            <button
                              onClick={handleLogout}
                              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors"
                            >
                              Logout
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link to="/profile" className="block">
                    <Avatar src={dbUser?.avatar ?? user?.photoURL} name={user?.name} size={34} />
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4 sm:gap-6">
                <Link to="/signin" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link to="/signup" className="hidden sm:block px-5 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-[#B8FF4D] transition-colors">
                  Sign Up
                </Link>
              </div>
            )}

            <button
              className="lg:hidden text-white p-1"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu (public + editor) */}
        <AnimatePresence>
          {isOpen && !isAdminPath && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-full left-0 right-0 bg-zinc-950 border-b border-white/10 p-6 flex flex-col gap-5 max-h-[calc(100vh-80px)] overflow-y-auto"
            >
              {currentLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-[#B8FF4D]"
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-white/5" />
              {!isLoggedIn ? (
                <div className="flex flex-col gap-4">
                  <Link to="/signin" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-widest text-zinc-400">Sign In</Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)} className="bg-white text-black py-4 rounded-2xl font-black text-center text-sm uppercase tracking-widest">Sign Up</Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-widest text-zinc-400">Profile</Link>
                  <Link to="/bookmarks" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-widest text-zinc-400">Bookmarks</Link>
                  <Link to="/history" onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-widest text-zinc-400">Reading History</Link>
                  {navLinksFor(role)
                    .filter((link) => link.path === '/editor' || link.path === '/admin')
                    .map((link) => (
                      <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} className="text-sm font-bold uppercase tracking-widest text-zinc-400">{link.name}</Link>
                    ))}
                  <button onClick={() => { logout(); setIsOpen(false); }} className="text-left text-sm font-bold uppercase tracking-widest text-red-500">Sign Out</button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Admin Drawer */}
        <AnimatePresence>
          {isOpen && isAdminPath && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/70"
              onClick={() => setIsOpen(false)}
            >
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute top-0 right-0 h-full w-[320px] max-w-[85vw] bg-zinc-950 border-l border-white/10 flex flex-col overflow-hidden"
              >
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                  <Link to="/" onClick={() => setIsOpen(false)} className="block">
                    <BrandLogo variant="icon" className="h-7" />
                  </Link>
                  <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors" aria-label="Close menu">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                  {adminNav.map((entry) =>
                    entry.kind === 'link' ? (
                      <Link
                        key={entry.name}
                        to={entry.path}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          'block px-4 py-2.5 rounded-xl text-sm font-bold transition-colors',
                          isAdminItemActive(location.pathname, entry.path)
                            ? 'bg-[#B8FF4D] text-black'
                            : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                        )}
                      >
                        {entry.name}
                      </Link>
                    ) : (
                      <div key={entry.name}>
                        <p className="px-4 mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">{entry.name}</p>
                        <div className="space-y-1">
                          {entry.items.map((item) => (
                            <Link
                              key={item.name}
                              to={item.path}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                'block pl-8 pr-4 py-2.5 rounded-xl text-sm font-bold transition-colors',
                                isAdminItemActive(location.pathname, item.path)
                                  ? 'text-[#B8FF4D] bg-white/[0.05]'
                                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                              )}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="border-t border-white/10 px-6 py-5 space-y-4">
                  {isLoggedIn ? (
                    <>
                      <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
                        <Avatar src={dbUser?.avatar ?? user?.photoURL} name={user?.name} size={36} />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{user?.name ?? 'Account'}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{role}</p>
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link to="/signin" onClick={() => setIsOpen(false)} className="w-full text-center py-3 rounded-xl border border-white/10 text-sm font-bold text-white hover:bg-white/5 transition-colors">
                        Sign In
                      </Link>
                      <Link to="/signup" onClick={() => setIsOpen(false)} className="w-full text-center py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-[#B8FF4D] transition-colors">
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
