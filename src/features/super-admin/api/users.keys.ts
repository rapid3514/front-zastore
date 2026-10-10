import { queryKeys } from '@/shared/query/query-keys'
import type { GetUsersParams } from './users.api'

export const usersKeys = {
  all: queryKeys.admin.users(),
  list: (params: GetUsersParams) => [...usersKeys.all, 'list', params] as const,
}
