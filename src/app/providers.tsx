import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { queryClient } from './query-client'
import { router } from './router'
import { AppToastViewport } from '@/shared/ui/toast'

interface AppProvidersProps {
  children?: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <RouterProvider router={router} />
      <AppToastViewport />
    </QueryClientProvider>
  )
}
