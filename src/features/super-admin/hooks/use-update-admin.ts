import { useMutation, useQueryClient } from '@tanstack/react-query'
import { superAdminApi } from '../api/super-admin.api'
import { superAdminKeys } from '../api/super-admin.keys'
import type { UpdateAdminInput } from '../types/super-admin.types'

export function useUpdateAdminMutation(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateAdminInput) => superAdminApi.updateAdmin(userId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: superAdminKeys.admins() }),
        queryClient.invalidateQueries({ queryKey: superAdminKeys.admin(userId) }),
      ])
    },
  })
}
