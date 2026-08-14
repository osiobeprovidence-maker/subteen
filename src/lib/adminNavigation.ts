import { canAccessAdmin, type Role } from './roles';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  FileText,
  Gamepad2,
  Grid,
  Layers,
  Tag as TagIcon,
  ClipboardCheck,
  Users2,
  Flag,
  Zap,
  CalendarDays,
  Image as ImageIcon,
  Users,
  DollarSign,
  Megaphone,
  RectangleHorizontal,
  BarChart3,
  Settings,
} from 'lucide-react';

export interface AdminNavItem {
  name: string;
  path: string;
  icon?: LucideIcon;
}

export interface AdminNavGroup {
  kind: 'group';
  name: string;
  icon?: LucideIcon;
  items: AdminNavItem[];
}

export interface AdminNavLink {
  kind: 'link';
  name: string;
  path: string;
  icon?: LucideIcon;
  roles?: Role[];
}

export type AdminNavEntry = AdminNavLink | AdminNavGroup;

export const ADMIN_NAVIGATION: AdminNavEntry[] = [
  { kind: 'link', name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  {
    kind: 'group',
    name: 'Content',
    icon: FileText,
    items: [
      { name: 'Articles', path: '/admin/articles', icon: FileText },
      { name: 'Games', path: '/admin/games', icon: Gamepad2 },
      { name: 'Categories', path: '/admin/categories', icon: Grid },
      { name: 'Sections', path: '/admin/sections', icon: Layers },
      { name: 'Tags', path: '/admin/tags', icon: TagIcon },
      { name: 'Review Queue', path: '/admin/review-queue', icon: ClipboardCheck },
    ],
  },
  {
    kind: 'group',
    name: 'Community',
    icon: Users2,
    items: [
      { name: 'Communities', path: '/admin/communities', icon: Users2 },
      { name: 'Reports', path: '/admin/reports', icon: Flag },
    ],
  },
  {
    kind: 'link',
    name: 'Automation',
    path: '/admin/automation',
    icon: Zap,
    roles: ['editor', 'admin', 'super_admin'],
  },
  { kind: 'link', name: 'Events', path: '/admin/events', icon: CalendarDays },
  { kind: 'link', name: 'Media', path: '/admin/media', icon: ImageIcon },
  { kind: 'link', name: 'Users', path: '/admin/users', icon: Users },
  {
    kind: 'group',
    name: 'Monetization',
    icon: DollarSign,
    items: [
      { name: 'Ads', path: '/admin/ads', icon: Megaphone },
      { name: 'Placements', path: '/admin/placements', icon: RectangleHorizontal },
    ],
  },
  { kind: 'link', name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { kind: 'link', name: 'Settings', path: '/admin/settings', icon: Settings },
];

export const adminCanSee = (entry: AdminNavEntry, role?: Role | string | null): boolean => {
  if (entry.kind === 'link' && entry.roles && entry.roles.length > 0) {
    return entry.roles.includes(role as Role);
  }
  return canAccessAdmin(role);
};

export const adminNavFor = (role?: Role | string | null): AdminNavEntry[] =>
  ADMIN_NAVIGATION.filter((entry) => adminCanSee(entry, role));

export const isAdminItemActive = (pathname: string, path: string): boolean => {
  if (path === '/admin') return pathname === '/admin' || pathname === '/admin/';
  return pathname === path || pathname.startsWith(path + '/');
};

export const isAdminGroupActive = (pathname: string, items: AdminNavItem[]): boolean =>
  items.some((item) => isAdminItemActive(pathname, item.path));
