import { queryKeys } from '@/shared/query/query-keys'
import type { GetCustomersParams } from './admin.api'

export const adminKeys = {
  all: queryKeys.admin.all,
  stats: () => queryKeys.admin.dashboard('stats'),
  customers: (params: GetCustomersParams) => queryKeys.admin.users('customers', params),
}
