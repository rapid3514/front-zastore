import { Link } from 'react-router-dom'
import { FolderPlus, PackagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useManageProducts, useProductMutations } from '@/features/catalog/hooks/use-products'
import type { Product } from '@/features/catalog/api/products.api'
import { availabilityLabel } from '@/features/catalog/lib/product-availability'
import { catalogError } from '@/features/catalog/lib/catalog-error'
import { formatMoney } from '@/shared/lib/format'
import { useToastStore } from '@/shared/ui/toast-store'
import { useState } from 'react'

export function AdminTodayPage() {
  const [page, setPage] = useState(1)
  const products = useManageProducts({ page, limit: 20 })
  const { update } = useProductMutations()
  const showToast = useToastStore((state) => state.show)

  async function toggle(product: Product) {
    try {
      const nextStatus = product.availabilityStatus === 'IN_STOCK' ? 'OUT_OF_STOCK' : 'IN_STOCK'
      await update.mutateAsync({ id: product.id, input: { availabilityStatus: nextStatus } })
      showToast(`Mahsulot: ${availabilityLabel(nextStatus)}`)
    } catch (cause) { showToast(catalogError(cause), 'error') }
  }

  return (
    <div className="sa-page-container space-y-5">
      <header><p className="sa-eyebrow">Do‘kon boshqaruvi</p><h1 className="sa-page-title">Bugun</h1><p className="sa-page-description">Mahsulotlarning sotuv holatini boshqaring.</p></header>
      <div className="flex flex-wrap gap-2"><Button asChild><Link to="/admin/products"><PackagePlus className="size-4" />Mahsulotlar</Link></Button><Button asChild variant="outline"><Link to="/admin/categories"><FolderPlus className="size-4" />Kategoriyalar</Link></Button></div>
      {products.isLoading ? <p className="sa-glass rounded-2xl p-5">Mahsulotlar yuklanmoqda...</p> : null}
      {products.isError ? <p className="sa-glass rounded-2xl p-5 text-red-600">Mahsulotlarni yuklab bo‘lmadi. <button type="button" className="font-bold underline" onClick={() => void products.refetch()}>Qayta urinish</button></p> : null}
      {products.data?.data.length === 0 ? <p className="sa-glass rounded-2xl p-5 text-slate-600">Hozircha mahsulotlar mavjud emas. Avval kategoriya va mahsulot yarating.</p> : null}
      <div className="grid gap-3 md:grid-cols-2">{products.data?.data.map((product) => (
        <article key={product.id} className="sa-glass flex min-w-0 items-center justify-between gap-3 rounded-2xl p-4">
          <div className="min-w-0"><h2 className="truncate font-extrabold text-slate-950">{product.name}</h2><p className="truncate text-sm text-slate-500">{product.category.name} · {formatMoney(product.price)}</p><p className="text-xs font-semibold text-slate-600">{availabilityLabel(product.availabilityStatus)}{product.availabilityStatus === 'ARRIVING_IN_14_DAYS' && product.cargoPrice ? ` · Kargo: ${formatMoney(product.cargoPrice)}` : ''}</p></div>
          {product.availabilityStatus === 'ARRIVING_IN_14_DAYS' ? <Button asChild variant="outline" className="shrink-0"><Link to="/admin/products">Tahrirlash</Link></Button> : <Button type="button" variant={product.availabilityStatus === 'IN_STOCK' ? 'outline' : 'default'} disabled={update.isPending} onClick={() => void toggle(product)} className="shrink-0">{product.availabilityStatus === 'IN_STOCK' ? 'Sotuvda bor' : 'Sotuvda yo‘q'}</Button>}
        </article>
      ))}</div>
      {products.data && products.data.meta.totalPages > 1 ? <div className="flex items-center justify-center gap-3"><Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Oldingi</Button><span className="text-sm font-bold">{page} / {products.data.meta.totalPages}</span><Button type="button" variant="outline" disabled={page >= products.data.meta.totalPages} onClick={() => setPage(page + 1)}>Keyingi</Button></div> : null}
    </div>
  )
}
