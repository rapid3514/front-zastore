import type { GetCustomersParams } from './admin.api'

export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'dashboard-stats'] as const,
  customers: (params: GetCustomersParams) => [...adminKeys.all, 'customers', params] as const,
}
