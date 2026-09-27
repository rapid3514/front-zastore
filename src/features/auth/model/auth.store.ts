import { create } from 'zustand'
import type { CustomerUser, AuthStatus } from './auth.types'

interface AuthState {
  status: AuthStatus
  accessToken: string | null
  user: CustomerUser | null
  error: string | null
  setLoading: () => void
  setAuthenticated: (accessToken: string, user: CustomerUser) => void
  setRegistrationRequired: () => void
  setUnauthenticated: () => void
  setError: (error: string) => void
  setAccessToken: (accessToken: string | null) => void
  logout: () => void
  reset: () => void
}

const initialState = {
  status: 'idle' as AuthStatus,
  accessToken: null,
  user: null,
  error: null,
}

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setLoading: () => set({ status: 'loading', error: null }),
  setAuthenticated: (accessToken, user) => set({ status: 'authenticated', accessToken, user, error: null }),
  setRegistrationRequired: () => set({ status: 'registration-required', accessToken: null, user: null, error: null }),
  setUnauthenticated: () => set({ status: 'unauthenticated', accessToken: null, user: null, error: null }),
  setError: (error) => set({ status: 'error', accessToken: null, user: null, error }),
  setAccessToken: (accessToken) => set({ accessToken }),
  logout: () => set({ status: 'unauthenticated', accessToken: null, user: null, error: null }),
  reset: () => set(initialState),
}))
