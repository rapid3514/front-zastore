import { Link } from 'react-router-dom'
import { FolderPlus, PackagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useManageProducts, useProductMutations } from '@/features/catalog/hooks/use-products'
import { catalogError } from '@/features/catalog/lib/catalog-error'
import { formatPrice } from '@/shared/mock/food-products'
import { useToastStore } from '@/shared/ui/toast-store'
import { useState } from 'react'

export function AdminTodayPage() {
  const [page, setPage] = useState(1)
  const products = useManageProducts({ page, limit: 20, isActive: true })
  const { update } = useProductMutations()
  const showToast = useToastStore((state) => state.show)

  async function toggle(id: string, isAvailable: boolean) {
    try {
      await update.mutateAsync({ id, input: { isAvailable: !isAvailable } })
      showToast(isAvailable ? 'Mahsulot bugun mavjud emas' : 'Mahsulot bugun mavjud')
    } catch (cause) { showToast(catalogError(cause), 'error') }
  }

  return (
    <div className="sa-page-container space-y-5">
      <header><p className="sa-eyebrow">Do‘kon boshqaruvi</p><h1 className="sa-page-title">Bugun</h1><p className="sa-page-description">Customer ko‘radigan mahsulotlarning bugungi mavjudligini belgilang.</p></header>
      <div className="flex flex-wrap gap-2"><Button asChild><Link to="/admin/products"><PackagePlus className="size-4" />Mahsulotlar</Link></Button><Button asChild variant="outline"><Link to="/admin/categories"><FolderPlus className="size-4" />Kategoriyalar</Link></Button></div>
      {products.isLoading ? <p className="sa-glass rounded-2xl p-5">Mahsulotlar yuklanmoqda...</p> : null}
      {products.isError ? <p className="sa-glass rounded-2xl p-5 text-red-600">Mahsulotlarni yuklab bo‘lmadi. <button type="button" className="font-bold underline" onClick={() => void products.refetch()}>Qayta urinish</button></p> : null}
      {products.data?.data.length === 0 ? <p className="sa-glass rounded-2xl p-5 text-slate-600">Hozircha mahsulotlar mavjud emas. Avval kategoriya va mahsulot yarating.</p> : null}
      <div className="grid gap-3 md:grid-cols-2">{products.data?.data.map((product) => (
        <article key={product.id} className="sa-glass flex min-w-0 items-center justify-between gap-3 rounded-2xl p-4">
          <div className="min-w-0"><h2 className="truncate font-extrabold text-slate-950">{product.name}</h2><p className="truncate text-sm text-slate-500">{product.category.name} · {formatPrice(Number(product.price))}</p></div>
          <Button type="button" variant={product.isAvailable ? 'outline' : 'default'} disabled={update.isPending} onClick={() => void toggle(product.id, product.isAvailable)} className="shrink-0">{product.isAvailable ? 'Mavjud' : 'Mavjud emas'}</Button>
        </article>
      ))}</div>
      {products.data && products.data.meta.totalPages > 1 ? <div className="flex items-center justify-center gap-3"><Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Oldingi</Button><span className="text-sm font-bold">{page} / {products.data.meta.totalPages}</span><Button type="button" variant="outline" disabled={page >= products.data.meta.totalPages} onClick={() => setPage(page + 1)}>Keyingi</Button></div> : null}
    </div>
  )
}
