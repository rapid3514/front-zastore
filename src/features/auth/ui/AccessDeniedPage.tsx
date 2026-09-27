import { Link } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { UserRole } from '../model/auth.types'

const panelByRole: Record<UserRole, string> = {
  GUEST: '/',
  CUSTOMER: '/',
  ADMIN: '/admin',
  SUPER_ADMIN: '/super-admin',
}

export function AccessDeniedPage({ role = 'CUSTOMER' }: { role?: UserRole }) {
  return (
    <main className="sa-auth-page">
      <div className="sa-glass w-full max-w-md rounded-3xl p-7 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-red-100 text-red-600"><ShieldX className="size-8" /></span>
        <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-red-600">403</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Bu sahifaga kirish huquqingiz yo‘q.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Siz uchun ajratilgan panelga qayting.</p>
        <Button asChild className="mt-6 bg-indigo-600 hover:bg-indigo-700"><Link to={panelByRole[role]}>O‘z panelimga qaytish</Link></Button>
      </div>
    </main>
  )
}
