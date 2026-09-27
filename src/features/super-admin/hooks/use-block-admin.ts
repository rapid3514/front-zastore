import { useMutation, useQueryClient } from '@tanstack/react-query'
import { superAdminApi } from '../api/super-admin.api'
import { superAdminKeys } from '../api/super-admin.keys'

export function useBlockAdminMutation(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => superAdminApi.blockAdmin(userId),
    onSuccess: async () => Promise.all([
      queryClient.invalidateQueries({ queryKey: superAdminKeys.admins() }),
      queryClient.invalidateQueries({ queryKey: superAdminKeys.admin(userId) }),
    ]),
  })
}
