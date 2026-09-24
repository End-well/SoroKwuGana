/**
 * Role-based access control definitions.
 *
 * Role hierarchy (ascending privileges):
 *   AUTHOR  →  ADMIN  →  SUPER_ADMIN
 *
 * Page access matrix:
 *   Dashboard  — all roles
 *   Posts      — all roles (authors see only their own)
 *   Comments   — ADMIN, SUPER_ADMIN
 *   Categories — ADMIN, SUPER_ADMIN
 *   Users      — SUPER_ADMIN only
 */

export type Role = 'AUTHOR' | 'ADMIN' | 'SUPER_ADMIN';

const HIERARCHY: Role[] = ['AUTHOR', 'ADMIN', 'SUPER_ADMIN'];

/** Returns true if `userRole` is at least `minRole` in the hierarchy. */
export function atLeast(userRole: string, minRole: Role): boolean {
  return HIERARCHY.indexOf(userRole as Role) >= HIERARCHY.indexOf(minRole);
}

/** Returns true if `userRole` is exactly `role`. */
export function is(userRole: string, role: Role): boolean {
  return userRole === role;
}

/** Page-level access rules */
export const PAGE_ACCESS: Record<string, Role> = {
  dashboard:   'AUTHOR',
  posts:       'AUTHOR',
  reviews:     'AUTHOR',
  settings:    'AUTHOR',
  comments:    'ADMIN',
  categories:  'ADMIN',
  subscribers: 'ADMIN',
  adverts:     'ADMIN',
  users:       'SUPER_ADMIN',
};

/** Which nav items each role can see */
export function getAllowedNav(role: string): string[] {
  return Object.entries(PAGE_ACCESS)
    .filter(([, minRole]) => atLeast(role, minRole))
    .map(([page]) => page);
}

export const ROLE_META: Record<Role, { label: string; color: string; bg: string; dot: string; desc: string }> = {
  AUTHOR: {
    label: 'Author',
    color: 'text-emerald-700',
    bg:    'bg-emerald-100',
    dot:   'bg-emerald-500',
    desc:  'Can write and manage their own posts.',
  },
  ADMIN: {
    label: 'Admin',
    color: 'text-violet-700',
    bg:    'bg-violet-100',
    dot:   'bg-violet-500',
    desc:  'Full content access: posts, comments, categories.',
  },
  SUPER_ADMIN: {
    label: 'Super Admin',
    color: 'text-rose-700',
    bg:    'bg-rose-100',
    dot:   'bg-rose-500',
    desc:  'Unrestricted access to all pages and settings.',
  },
};
