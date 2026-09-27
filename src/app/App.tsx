import { AppProviders } from './providers'
import { useAuthBootstrap } from '@/features/auth/hooks/use-auth-bootstrap'

function AppContent() {
  useAuthBootstrap()
  return <AppProviders />
}

export function App() {
  return <AppContent />
}
