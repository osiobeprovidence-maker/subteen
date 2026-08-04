import { v } from 'convex/values';

export const roleSchema = v.union(
  v.literal('member'),
  v.literal('editor'),
  v.literal('admin'),
  v.literal('super_admin'),
);

export type Role = 'member' | 'editor' | 'admin' | 'super_admin';

export const ROLE_HIERARCHY: Record<Role, number> = {
  member: 0,
  editor: 1,
  admin: 2,
  super_admin: 3,
};

export const SUPER_ADMIN_EMAIL = 'riderezzy@gmail.com';

export const roleRank = (role?: string | null): number => {
  const r = (role ?? 'member') as Role;
  return ROLE_HIERARCHY[r] ?? 0;
};

export const canAccessEditor = (role?: string | null): boolean =>
  roleRank(role) >= ROLE_HIERARCHY.editor;

export const canAccessAdmin = (role?: string | null): boolean =>
  roleRank(role) >= ROLE_HIERARCHY.admin;

export const isSuperAdminEmail = (email?: string | null): boolean =>
  (email ?? '').toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
