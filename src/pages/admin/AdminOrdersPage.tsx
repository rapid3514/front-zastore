import { useEffect, useState } from 'react'
import { ChevronRight, Search } from 'lucide-react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { GlassCard } from '@/components/glass/GlassCard'
import { Button } from '@/components/ui/button'
import { orderStatuses, type OrderStatus } from '@/features/orders/api/orders.api'
import { useManageOrders } from '@/features/orders/hooks/use-orders'
import { getOrderStatusClass, orderStatusLabels } from '@/features/orders/lib/order-status'
import { formatDateTime, formatMoney } from '@/shared/lib/format'

export function AdminOrdersPage() {
  const { pathname } = useLocation()
  const basePath = pathname.startsWith('/super-admin') ? '/super-admin' : '/admin'
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('search') ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const status = params.get('status') as OrderStatus | null
  const createdFrom = params.get('createdFrom') ?? ''
  const createdTo = params.get('createdTo') ?? ''
  const page = Number(params.get('page') ?? '1') || 1

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim())
      setParams((current) => {
        const next = new URLSearchParams(current)
        if (search.trim()) next.set('search', search.trim())
        else next.delete('search')
        next.delete('page')
        return next
      })
    }, 350)
    return () => window.clearTimeout(timer)
  }, [search, setParams])

  const orders = useManageOrders({
    page,
    limit: 20,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(status ? { status } : {}),
    ...(createdFrom ? { createdFrom: new Date(`${createdFrom}T00:00:00`).toISOString() } : {}),
    ...(createdTo ? { createdTo: new Date(`${createdTo}T23:59:59.999`).toISOString() } : {}),
  })
  const meta = orders.data?.meta

  function setStatus(value: string) {
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set('status', value)
      else next.delete('status')
      next.delete('page')
      return next
    })
  }

  function setPage(nextPage: number) {
    setParams((current) => {
      const next = new URLSearchParams(current)
      next.set('page', String(nextPage))
      return next
    })
  }

  function setDate(name: 'createdFrom' | 'createdTo', value: string) {
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set(name, value)
      else next.delete(name)
      next.delete('page')
      return next
    })
  }

  return (
    <main className="sa-page-container space-y-5">
      <header><p className="sa-eyebrow">Buyurtmalar</p><h1 className="sa-page-title">Mijozlar buyurtmalari</h1><p className="sa-page-description">Buyurtmalarni ko‘ring, tasdiqlang va tayyorlanish holatini yangilang.</p></header>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_14rem_11rem_11rem]">
        <label className="sa-search flex-1"><Search className="size-4 text-slate-400" /><span className="sr-only">Buyurtma qidirish</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buyurtma yoki mijoz qidirish..." /></label>
        <select className="sa-input sm:max-w-xs" value={status ?? ''} onChange={(event) => setStatus(event.target.value)}><option value="">Barcha holatlar</option>{orderStatuses.map((item) => <option key={item} value={item}>{orderStatusLabels[item]}</option>)}</select>
        <label className="text-xs font-bold text-slate-500">Boshlanish sana<input type="date" className="sa-input mt-1" value={createdFrom} max={createdTo || undefined} onChange={(event) => setDate('createdFrom', event.target.value)} /></label>
        <label className="text-xs font-bold text-slate-500">Tugash sana<input type="date" className="sa-input mt-1" value={createdTo} min={createdFrom || undefined} onChange={(event) => setDate('createdTo', event.target.value)} /></label>
      </div>
      {orders.isLoading ? <div className="grid gap-3" aria-label="Buyurtmalar yuklanmoqda">{[1, 2, 3].map((item) => <div key={item} className="sa-glass animate-pulse space-y-3 rounded-2xl p-5"><div className="h-5 w-1/3 rounded bg-slate-200" /><div className="h-4 w-full rounded bg-slate-100" /><div className="h-4 w-2/3 rounded bg-slate-100" /></div>)}</div> : null}
      {orders.isError ? <div className="sa-glass rounded-2xl p-6 text-center text-red-600">Buyurtmalarni yuklab bo‘lmadi. <button type="button" className="font-bold underline" onClick={() => void orders.refetch()}>Qayta urinish</button></div> : null}
      {orders.data?.data.length === 0 ? <div className="sa-glass rounded-2xl p-8 text-center text-slate-600">Buyurtmalar topilmadi.</div> : null}
      <div className="grid gap-3">
        {orders.data?.data.map((order) => (
          <Link key={order.id} to={`${basePath}/orders/${order.id}`} className="block no-underline">
            <GlassCard className="sa-glass grid gap-3 rounded-2xl p-4 hover:-translate-y-0.5 sm:grid-cols-[1.2fr_1fr_auto_auto_auto] sm:items-center">
              <div><p className="font-black text-slate-950">#{order.id}</p><p className="text-sm text-slate-500">{formatDateTime(order.createdAt)}</p></div>
              <div><p className="font-bold text-slate-900">{`${order.customer.firstName} ${order.customer.lastName ?? ''}`.trim()}</p><p className="text-sm text-slate-500">{order.phone ?? 'Telefon yo‘q'}</p></div>
              <span className={`order-status ${getOrderStatusClass(order.status)}`}>{orderStatusLabels[order.status]}</span>
              <strong className="text-slate-950">{formatMoney(order.total)}</strong><ChevronRight className="hidden size-5 text-slate-400 sm:block" />
            </GlassCard>
          </Link>
        ))}
      </div>
      {meta && meta.totalPages > 1 ? <div className="flex items-center justify-center gap-3"><Button type="button" variant="outline" disabled={meta.page <= 1} onClick={() => setPage(meta.page - 1)}>Oldingi</Button><span className="text-sm font-bold">{meta.page} / {meta.totalPages}</span><Button type="button" variant="outline" disabled={meta.page >= meta.totalPages} onClick={() => setPage(meta.page + 1)}>Keyingi</Button></div> : null}
    </main>
  )
}
