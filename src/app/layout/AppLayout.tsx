import { useCallback } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTelegramBackButton } from '@/shared/telegram/telegram'
import { AppNavbar } from './AppNavbar'
import { BottomNavigation } from './BottomNavigation'

export function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'
  const isSuccessPage = location.pathname.startsWith('/order-success/')

  const handleBack = useCallback(() => {
    navigate(-1)
  }, [navigate])

  useTelegramBackButton(!isHome, handleBack)

  return (
    <div className="app-layout shop-app">
      {!isSuccessPage ? <AppNavbar /> : null}
      <div className="app-main">
        <Outlet />
      </div>
      {!isSuccessPage ? <BottomNavigation /> : null}
    </div>
  )
}
