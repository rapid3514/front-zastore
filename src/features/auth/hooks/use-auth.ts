import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../model/auth.store'

export function useAuth() {
  const auth = useAuthStore()
  const queryClient = useQueryClient()

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      queryClient.removeQueries({ queryKey: ['admin'] })
      queryClient.removeQueries({ queryKey: ['super-admin'] })
      queryClient.removeQueries({ queryKey: ['profile'] })
      useAuthStore.getState().logout()
    }
  }, [queryClient])

  return { ...auth, logout }
}
