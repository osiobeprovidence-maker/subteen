import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, Bookmark, History, User, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { SearchOverlay } from '../common/SearchOverlay';
import { useAuth } from '../../context/AuthContext';
import { canAccessAdmin, canAccessEditor, Role } from '../../lib/roles';

const NAV_LINKS = [
  { name: 'News', path: '/category/news' },
  { name: 'Reviews', path: '/category/reviews' },
  { name: 'Guides', path: '/category/guides' },
];

const ROLE_LINKS: { roles: (Role | undefined)[]; name: string; path: string }[] = [
  { roles: ['editor', 'admin', 'super_admin'], name: 'Editor Studio', path: '/editor' },
  { roles: ['admin', 'super_admin'], name: 'Admin Panel', path: '/admin' },
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
  { name: 'Games', path: '/admin/games' },
  { name: 'Categories', path: '/admin/categories' },
  { name: 'Tags', path: '/admin/tags' },
  { name: 'Users', path: '/admin/users' },
  { name: 'Ads', path: '/admin/ads' },
  { name: 'Media', path: '/admin/media' },
  { name: 'Reports', path: '/admin/reports' },
  { name: 'Settings', path: '/admin/settings' },
];

const EDITOR_LINKS = [
  { name: 'Dashboard', path: '/editor' },
  { name: 'Articles', path: '/editor/articles' },
  { name: 'Drafts', path: '/editor/drafts' },
  { name: 'Published', path: '/editor/published' },
  { name: 'Scheduled', path: '/editor/scheduled' },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isLoggedIn, logout, role, user, dbUser } = useAuth();
  const location = useLocation();

  const isAdminPath = location.pathname.startsWith('/admin');
  const isEditorPath = location.pathname.startsWith('/editor');

  const currentLinks = isAdminPath ? ADMIN_LINKS : isEditorPath ? EDITOR_LINKS : navLinksFor(role);
  const avatarUrl = dbUser?.avatar ?? user?.photoURL;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
          isScrolled 
            ? 'bg-black/80 backdrop-blur-md border-white/10 py-3' 
            : 'bg-transparent border-transparent py-5'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/" className="text-xl sm:text-2xl font-black tracking-tighter text-white">
              SUB<span className="text-[#B8FF4D]">TEEN</span>
            </Link>

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
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {!isAdminPath && !isEditorPath && (
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:block text-zinc-400 hover:text-white transition-colors p-1"
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
              <div className="hidden md:flex items-center gap-3 sm:gap-5">
                <Link to="/bookmarks" className="hidden md:block text-zinc-400 hover:text-white transition-colors">
                  <Bookmark size={20} />
                </Link>
                <Link to="/history" className="hidden md:block text-zinc-400 hover:text-white transition-colors">
                  <History size={20} />
                </Link>
                <Link to="/profile" className="w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-[#B8FF4D] transition-colors overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={user?.name ?? 'Profile'} className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} />
                  )}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4 sm:gap-6">
                <Link 
                  to="/signin"
                  className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup"
                  className="hidden sm:block px-5 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-[#B8FF4D] transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <button
              className="lg:hidden text-white p-1"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden absolute top-full left-0 right-0 bg-zinc-950 border-b border-white/10 p-6 flex flex-col gap-5"
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
      </nav>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
