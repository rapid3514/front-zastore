import { useQuery } from '@tanstack/react-query'
import { usersApi } from '../api/users.api'
import { usersKeys } from '../api/users.keys'

export function useCustomerUsersQuery(search: string) {
  const params = { page: 1, limit: 20, role: 'CUSTOMER' as const, ...(search ? { search } : {}) }
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => usersApi.getUsers(params),
  })
}
