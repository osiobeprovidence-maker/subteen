import { canAccessAdmin, type Role } from './roles';

export interface AdminNavItem {
  name: string;
  path: string;
}

export interface AdminNavGroup {
  kind: 'group';
  name: string;
  items: AdminNavItem[];
}

export interface AdminNavLink {
  kind: 'link';
  name: string;
  path: string;
  roles?: Role[];
}

export type AdminNavEntry = AdminNavLink | AdminNavGroup;

export const ADMIN_NAVIGATION: AdminNavEntry[] = [
  { kind: 'link', name: 'Dashboard', path: '/admin' },
  {
    kind: 'group',
    name: 'Content',
    items: [
      { name: 'Articles', path: '/admin/articles' },
      { name: 'Communities', path: '/admin/communities' },
      { name: 'Games', path: '/admin/games' },
      { name: 'Categories', path: '/admin/categories' },
      { name: 'Tags', path: '/admin/tags' },
    ],
  },
  { kind: 'link', name: 'Users', path: '/admin/users' },
  { kind: 'link', name: 'Ads', path: '/admin/ads' },
  { kind: 'link', name: 'Placements', path: '/admin/placements' },
  { kind: 'link', name: 'Media', path: '/admin/media' },
  { kind: 'link', name: 'Reports', path: '/admin/reports' },
  { kind: 'link', name: 'Automation', path: '/admin/automation', roles: ['editor', 'admin', 'super_admin'] },
  { kind: 'link', name: 'Settings', path: '/admin/settings' },
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
