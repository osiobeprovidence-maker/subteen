export type Role = 'member' | 'editor' | 'admin' | 'super_admin';

export const ROLE_LABELS: Record<Role, string> = {
  member: 'Member',
  editor: 'Editor',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

export const ROLE_ORDER: Role[] = ['member', 'editor', 'admin', 'super_admin'];

export const isEditor = (role?: string | null): boolean =>
  role === 'editor' || role === 'admin' || role === 'super_admin';

export const isAdmin = (role?: string | null): boolean =>
  role === 'admin' || role === 'super_admin';

export const canAccessEditor = (role?: string | null): boolean => isEditor(role);
export const canAccessAdmin = (role?: string | null): boolean => isAdmin(role);

export const roleLabel = (role?: string | null): string =>
  ROLE_LABELS[(role as Role) ?? 'member'] ?? 'Member';
