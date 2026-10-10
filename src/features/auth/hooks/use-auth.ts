import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { completeCheckoutAttempt } from '@/features/orders/lib/checkout-attempt'
import { cancelAuthRefresh } from '@/shared/api/api'
import { authApi } from '../api/auth.api'
import { useAuthStore } from '../model/auth.store'
import { cancelAuthBootstrap } from './use-auth-bootstrap'

export function useAuth() {
  const auth = useAuthStore()
  const queryClient = useQueryClient()

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      cancelAuthBootstrap()
      cancelAuthRefresh()
      try {
        await queryClient.cancelQueries()
      } finally {
        useAuthStore.getState().logout()
        completeCheckoutAttempt()
        queryClient.clear()
      }
    }
  }, [queryClient])

  return { ...auth, logout }
}
