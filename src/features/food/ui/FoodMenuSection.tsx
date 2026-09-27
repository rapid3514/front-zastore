import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCategories } from '@/features/catalog/hooks/use-categories'
import { useProducts } from '@/features/catalog/hooks/use-products'
import { FoodCategoryFilter } from './FoodCategoryFilter'
import { FoodProductCard } from './FoodProductCard'
import { FoodSearch } from './FoodSearch'

interface FoodMenuSectionProps {
  title: string
  availableOnly?: boolean
}

export function FoodMenuSection({ title, availableOnly = false }: FoodMenuSectionProps) {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const categories = useCategories()
  const products = useProducts({ page, limit: 20, ...(categoryId ? { categoryId } : {}), ...(search ? { search } : {}), ...(availableOnly ? { isAvailable: true } : {}) })

  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(query.trim()); setPage(1) }, 350)
    return () => window.clearTimeout(timer)
  }, [query])

  return (
    <section className="space-y-4" aria-labelledby="food-section-title">
      <FoodSearch value={query} onChange={setQuery} />
      {categories.isLoading ? <div className="glass-card p-4 text-sm text-[#806f65]">Kategoriyalar yuklanmoqda...</div> : null}
      {categories.isError ? <div className="glass-card p-4 text-sm text-red-600">Kategoriyalarni yuklashda xatolik yuz berdi. <button type="button" className="font-bold underline" onClick={() => void categories.refetch()}>Qayta urinish</button></div> : null}
      {categories.data ? <FoodCategoryFilter categories={categories.data} value={categoryId} onChange={(value) => { setCategoryId(value); setPage(1) }} /> : null}
      <div className="flex items-end justify-between gap-3">
        <div><p className="mb-1 text-xs font-bold tracking-[0.12em] text-[#dc6a35] uppercase">Yangi tayyorlanadi</p><h2 id="food-section-title" className="text-2xl font-black tracking-[-0.04em] text-[#352922]">{title}</h2></div>
        <span className="text-sm font-semibold text-[#8b7569]">{products.data?.meta.total ?? 0} ta</span>
      </div>
      {products.isLoading || query.trim() !== search ? <div className="glass-card p-6 text-center text-sm text-[#806f65]">Taomlar yuklanmoqda...</div> : null}
      {products.isError ? <div className="glass-card p-6 text-center text-sm text-red-600">Taomlarni yuklashda xatolik yuz berdi. <button type="button" className="font-bold underline" onClick={() => void products.refetch()}>Qayta urinish</button></div> : null}
      {!products.isError && query.trim() === search && products.data ? (
        products.data.data.length > 0 ? <div className="food-grid">{products.data.data.map((product) => <FoodProductCard key={product.id} product={product} />)}</div> : <div className="glass-card p-6 text-center text-sm text-[#806f65]">Mos taom topilmadi.</div>
      ) : null}
      {products.data && products.data.meta.totalPages > 1 ? <div className="flex items-center justify-center gap-3"><Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Oldingi</Button><span className="text-sm font-bold">{page} / {products.data.meta.totalPages}</span><Button type="button" variant="outline" disabled={page >= products.data.meta.totalPages} onClick={() => setPage(page + 1)}>Keyingi</Button></div> : null}
    </section>
  )
}
