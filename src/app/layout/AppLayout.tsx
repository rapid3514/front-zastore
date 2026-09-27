import { Outlet } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { AppNavbar } from './AppNavbar'
import { BottomNavigation } from './BottomNavigation'

export function AppLayout() {
  const location = useLocation()
  const isSuccessPage = location.pathname.startsWith('/order-success/')

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
