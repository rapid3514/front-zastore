import { AppProviders } from './providers'
import { useAuthBootstrap } from '@/features/auth/hooks/use-auth-bootstrap'
import { usePresenceHeartbeat } from '@/features/presence/hooks/use-presence-heartbeat'

function AppContent() {
  useAuthBootstrap()
  usePresenceHeartbeat()
  return <AppProviders />
}

export function App() {
  return <AppContent />
}
