import { useMutation, useQueryClient } from '@tanstack/react-query'
import { superAdminApi } from '../api/super-admin.api'
import { superAdminKeys } from '../api/super-admin.keys'

export function useDemoteAdminMutation(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => superAdminApi.demoteAdmin(userId),
    onSuccess: async () => Promise.all([
      queryClient.invalidateQueries({ queryKey: superAdminKeys.admins() }),
      queryClient.invalidateQueries({ queryKey: superAdminKeys.admin(userId) }),
    ]),
  })
}
