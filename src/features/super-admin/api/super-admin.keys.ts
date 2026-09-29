import type { GetSuperAdminUsersParams } from './super-admin.api'

export const superAdminKeys = {
  all: ['super-admin'] as const,
  stats: () => [...superAdminKeys.all, 'dashboard-stats'] as const,
  users: (params: GetSuperAdminUsersParams) => [...superAdminKeys.all, 'users', params] as const,
  admins: () => [...superAdminKeys.all, 'admins'] as const,
  admin: (id: string) => [...superAdminKeys.all, 'admin', id] as const,
  me: () => [...superAdminKeys.all, 'me'] as const,
}
