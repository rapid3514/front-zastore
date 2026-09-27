import { Bell, Search, ShoppingBag } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/model/auth.store'
import { getCartItemCount, useCartStore } from '@/features/cart/model/cart.store'

export function AppNavbar() {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const count = getCartItemCount(useCartStore((state) => state.items))
  const isHome = location.pathname === '/'

  return <header className="shop-header">
    <div className="shop-header-inner">
      {isHome ? <div className="shop-greeting">
        {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="shop-greeting-avatar" /> : <span className="shop-greeting-avatar shop-greeting-avatar-fallback">{user?.firstName?.charAt(0).toLocaleUpperCase('uz') ?? 'Z'}</span>}
        <div className="min-w-0"><span>Salom,</span><strong>{user?.firstName ?? 'Xush kelibsiz'} <span aria-hidden="true">♡</span></strong></div>
      </div> : <Link to="/" className="shop-brand"><span>Zastore</span><i>.</i></Link>}
      <div className="flex items-center gap-2">
        {!isHome ? <Link to="/catalog" className="shop-icon-button" aria-label="Qidirish"><Search size={19} /></Link> : <Link to="/orders" className="shop-icon-button" aria-label="Buyurtma bildirishnomalari"><Bell size={19} /></Link>}
        <Link to="/cart" className="shop-icon-button relative" aria-label={`Savat, ${count} ta mahsulot`}><ShoppingBag size={19} />{count > 0 ? <span className="shop-cart-count">{count}</span> : null}</Link>
      </div>
    </div>
  </header>
}
