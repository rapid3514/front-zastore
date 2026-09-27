import { useMutation, useQueryClient } from '@tanstack/react-query'
import { superAdminApi } from '../api/super-admin.api'
import { superAdminKeys } from '../api/super-admin.keys'
import { usersKeys } from '../api/users.keys'

export function usePromoteAdminMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: superAdminApi.promoteAdmin,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: superAdminKeys.admins() }),
        queryClient.invalidateQueries({ queryKey: usersKeys.all }),
      ])
    },
  })
}
