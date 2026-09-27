export const superAdminKeys = {
  all: ['super-admin'] as const,
  admins: () => [...superAdminKeys.all, 'admins'] as const,
  admin: (id: string) => [...superAdminKeys.all, 'admin', id] as const,
  me: () => [...superAdminKeys.all, 'me'] as const,
}
