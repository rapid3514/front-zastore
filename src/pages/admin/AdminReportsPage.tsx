import { ArrowRight, Boxes, CheckCircle2, Clock3, PackageCheck, ShoppingBag, UsersRound, WalletCards } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useManageOrderSummary } from '@/features/orders/hooks/use-orders'
import { getOrderStatusClass, orderStatusLabels } from '@/features/orders/lib/order-status'
import { formatDateTime, formatMoney } from '@/shared/lib/format'

function StatCard({ label, value, detail, icon: Icon }: { label: string; value: string | number; detail: string; icon: LucideIcon }) {
  return (
    <article className="sa-glass rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-sm font-bold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{value}</p></div>
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-700"><Icon className="size-5" aria-hidden="true" /></span>
      </div>
      <p className="mt-3 text-sm text-slate-500">{detail}</p>
    </article>
  )
}

export function AdminReportsPage() {
  const summary = useManageOrderSummary()

  if (summary.isLoading) return <main className="sa-page-container"><div className="sa-glass animate-pulse rounded-3xl p-8 text-slate-500">Hisobot yuklanmoqda...</div></main>
  if (summary.isError || !summary.data) return <main className="sa-page-container"><div className="sa-glass rounded-3xl p-8 text-center text-red-600"><p>Hisobotni backenddan yuklab bo‘lmadi.</p><Button type="button" variant="outline" className="mt-4" onClick={() => void summary.refetch()}>Qayta urinish</Button></div></main>

  const { orders, catalog, customersWithOrders, recentOrders } = summary.data

  return (
    <main className="sa-page-container space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="sa-eyebrow">Jonli ma’lumotlar</p><h1 className="sa-page-title">Do‘kon hisoboti</h1><p className="sa-page-description">Savdo, buyurtma va katalog ko‘rsatkichlari backenddan real vaqtda olinadi.</p></div>
        <Button asChild><Link to="/admin/orders">Buyurtmalarni boshqarish<ArrowRight className="size-4" /></Link></Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Asosiy ko‘rsatkichlar">
        <StatCard label="Jami buyurtmalar" value={orders.total} detail="Barcha vaqtdagi buyurtmalar" icon={ShoppingBag} />
        <StatCard label="Tasdiq kutilmoqda" value={orders.pendingConfirmation} detail="Admin javobini kutayotganlar" icon={Clock3} />
        <StatCard label="Yakunlangan savdo" value={formatMoney(orders.completedRevenue)} detail={`${orders.completed} ta yakunlangan buyurtma`} icon={WalletCards} />
        <StatCard label="Buyurtma bergan mijozlar" value={customersWithOrders} detail="Takrorlanmaydigan mijozlar soni" icon={UsersRound} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="sa-glass rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-black text-slate-950">Buyurtmalar holati</h2><p className="mt-1 text-sm text-slate-500">Backenddagi barcha buyurtmalar kesimi</p></div><PackageCheck className="size-6 text-indigo-600" /></div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ['Tasdiqlangan', orders.confirmed],
              ['Tayyorlanmoqda', orders.processing],
              ['Yakunlangan', orders.completed],
              ['Bekor qilingan', orders.cancelled],
              ['Muddati o‘tgan', orders.expired],
              ['Jami', orders.total],
            ].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200/80 bg-white/55 p-4"><p className="text-2xl font-black text-slate-950">{value}</p><p className="mt-1 text-xs font-bold text-slate-500">{label}</p></div>)}
          </div>
        </article>

        <article className="sa-glass rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4"><div><h2 className="text-xl font-black text-slate-950">Katalog holati</h2><p className="mt-1 text-sm text-slate-500">Mahsulot va kategoriyalar</p></div><Boxes className="size-6 text-indigo-600" /></div>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-white/55 p-4"><span className="text-sm font-bold text-slate-600">Jami mahsulot</span><strong className="text-xl text-slate-950">{catalog.productsTotal}</strong></div>
            <div className="flex items-center justify-between rounded-2xl bg-white/55 p-4"><span className="text-sm font-bold text-slate-600">Sotuvda mavjud</span><strong className="text-xl text-emerald-700">{catalog.productsAvailable}</strong></div>
            <div className="flex items-center justify-between rounded-2xl bg-white/55 p-4"><span className="text-sm font-bold text-slate-600">Faol kategoriyalar</span><strong className="text-xl text-slate-950">{catalog.categoriesActive} / {catalog.categoriesTotal}</strong></div>
          </div>
          <Button asChild variant="outline" className="mt-4 w-full"><Link to="/admin/products">Katalogni boshqarish<ArrowRight className="size-4" /></Link></Button>
        </article>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4"><div><h2 className="text-xl font-black text-slate-950">So‘nggi buyurtmalar</h2><p className="mt-1 text-sm text-slate-500">Backenddan olingan eng yangi 5 ta buyurtma</p></div><Button asChild variant="ghost"><Link to="/admin/orders">Barchasi<ArrowRight className="size-4" /></Link></Button></div>
        {recentOrders.length === 0 ? <div className="sa-glass rounded-3xl p-8 text-center text-slate-500">Hozircha buyurtmalar yo‘q.</div> : <div className="grid gap-3">{recentOrders.map((order) => (
          <Link key={order.id} to={`/admin/orders/${order.id}`} className="sa-glass flex flex-col gap-3 rounded-2xl p-4 no-underline transition-transform hover:-translate-y-0.5 sm:flex-row sm:items-center">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><CheckCircle2 className="size-5" /></span>
            <div className="min-w-0 flex-1"><p className="truncate font-black text-slate-950">{order.customer.firstName} {order.customer.lastName ?? ''}</p><p className="mt-1 text-xs text-slate-500">{formatDateTime(order.createdAt)} · {order.items.length} ta mahsulot</p></div>
            <span className={`order-status ${getOrderStatusClass(order.status)}`}>{orderStatusLabels[order.status]}</span>
            <strong className="text-slate-950">{formatMoney(order.total)}</strong><ArrowRight className="size-4 text-slate-400" />
          </Link>
        ))}</div>}
      </section>
    </main>
  )
}
