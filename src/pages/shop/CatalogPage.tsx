import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useCategories } from '@/features/catalog/hooks/use-categories'
import { useProducts } from '@/features/catalog/hooks/use-products'
import { ProductGrid } from '@/features/shop/components/ProductGrid'

export function CatalogPage() {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('search') ?? '')
  const [debouncedSearch, setDebouncedSearch] = useState(search.trim())
  const categoryId = params.get('category') ?? ''
  const sort = params.get('sort') ?? 'new'
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1)
  const categories = useCategories()

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
    }, 400)
    return () => window.clearTimeout(timer)
  }, [search, setParams])

  const products = useProducts({
    page,
    limit: 20,
    ...(categoryId ? { categoryId } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  })

  const visibleProducts = useMemo(() => {
    const result = [...(products.data?.data ?? [])]
    if (sort === 'cheap') result.sort((first, second) => Number(first.price) - Number(second.price))
    if (sort === 'expensive') result.sort((first, second) => Number(second.price) - Number(first.price))
    return result
  }, [products.data?.data, sort])

  function updateParam(key: string, value: string) {
    setParams((current) => {
      const next = new URLSearchParams(current)
      if (value) next.set(key, value)
      else next.delete(key)
      if (key !== 'page') next.delete('page')
      return next
    })
  }

  return (
    <main className="page-container shop-page space-y-5">
      <header><h1 className="shop-page-title">Katalog</h1></header>
      <label className="shop-search glass-card"><Search size={20} aria-hidden="true" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Mahsulot qidirish..." aria-label="Mahsulot qidirish" /></label>

      {categories.isLoading ? <div className="flex gap-2">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-10 w-24 animate-pulse rounded-full bg-white/50" />)}</div> : null}
      {categories.isError ? <div className="glass-card p-4 text-sm">Kategoriyalar yuklanmadi. <button type="button" className="font-bold underline" onClick={() => void categories.refetch()}>Qayta urinish</button></div> : null}
      <div className="shop-chips hide-scrollbar" aria-label="Kategoriyalar">
        <button type="button" className={`shop-chip ${!categoryId ? 'shop-chip-active' : ''}`} onClick={() => updateParam('category', '')}>Barchasi</button>
        {categories.data?.map((category) => <button key={category.id} type="button" className={`shop-chip ${categoryId === category.id ? 'shop-chip-active' : ''}`} onClick={() => updateParam('category', category.id)}>{category.name}</button>)}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="shop-muted text-xs font-semibold">{products.data?.meta.total ?? 0} ta mahsulot</p>
        <label className="shop-sort glass-card"><SlidersHorizontal size={16} /><span className="sr-only">Saralash</span><select value={sort} onChange={(event) => updateParam('sort', event.target.value)}><option value="new">Yangi</option><option value="cheap">Arzon</option><option value="expensive">Qimmat</option></select></label>
      </div>

      {products.isLoading || search.trim() !== debouncedSearch ? <div className="shop-product-grid">{Array.from({ length: 4 }, (_, index) => <div key={index} className="glass-card aspect-[4/5] animate-pulse" />)}</div> : null}
      {products.isError ? <div className="glass-card p-6 text-center text-sm">Mahsulotlarni yuklab bo‘lmadi. <button type="button" className="font-bold underline" onClick={() => void products.refetch()}>Qayta urinish</button></div> : null}
      {!products.isLoading && visibleProducts.length ? <ProductGrid products={visibleProducts} /> : null}
      {!products.isLoading && products.data?.data.length === 0 ? <div className="glass-card p-10 text-center"><h2 className="text-lg font-bold">Mahsulot topilmadi</h2><p className="shop-muted mt-2 text-sm">Boshqa qidiruv yoki kategoriyani sinab ko‘ring.</p></div> : null}

      {products.data && products.data.meta.totalPages > 1 ? <div className="flex items-center justify-center gap-3"><Button type="button" variant="outline" disabled={page <= 1} onClick={() => updateParam('page', String(page - 1))}>Oldingi</Button><span className="text-sm font-bold">{page} / {products.data.meta.totalPages}</span><Button type="button" variant="outline" disabled={page >= products.data.meta.totalPages} onClick={() => updateParam('page', String(page + 1))}>Keyingi</Button></div> : null}
    </main>
  )
}
