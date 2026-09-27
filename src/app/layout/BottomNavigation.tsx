import type { LucideIcon } from 'lucide-react'
import { Grid2X2, Home, Package, ShoppingBag, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import { getCartItemCount, useCartStore } from '@/features/cart/model/cart.store'

const navigation: Array<{ label: string; icon: LucideIcon; to: string }> = [
  { label: 'Asosiy', icon: Home, to: '/' },
  { label: 'Katalog', icon: Grid2X2, to: '/catalog' },
  { label: 'Savat', icon: ShoppingBag, to: '/cart' },
  { label: 'Buyurtmalar', icon: Package, to: '/orders' },
  { label: 'Profil', icon: UserRound, to: '/profile' },
]

export function BottomNavigation() {
  const count = getCartItemCount(useCartStore((state) => state.items))
  return <nav className="shop-bottom-nav" aria-label="Asosiy navigatsiya"><div className="mx-auto grid max-w-xl grid-cols-5 gap-1 px-2 py-2">{navigation.map(({ label, icon: Icon, to }) => <NavLink key={label} to={to} end={to === '/'} className={({ isActive }) => cn('shop-nav-item', isActive && 'shop-nav-item-active')}>{({ isActive }) => <><span className="relative"><Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />{to === '/cart' && count > 0 ? <span className="shop-nav-count">{count}</span> : null}</span><span>{label}</span></>}</NavLink>)}</div></nav>
}
