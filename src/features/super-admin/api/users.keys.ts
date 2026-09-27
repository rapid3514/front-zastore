import type { GetUsersParams } from './users.api'

export const usersKeys = {
  all: ['users'] as const,
  list: (params: GetUsersParams) => [...usersKeys.all, 'list', params] as const,
}
