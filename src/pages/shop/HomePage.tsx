import { ArrowRight, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProducts } from '@/features/catalog/hooks/use-products'
import { CategoryList } from '@/features/shop/components/CategoryList'
import { ProductGrid } from '@/features/shop/components/ProductGrid'

export function HomePage() {
  const products = useProducts({ page: 1, limit: 8 })

  return (
    <main className="page-container shop-page space-y-7">
      <Link to="/catalog" className="shop-search shop-home-search" aria-label="Mahsulot qidirish"><Search size={19} /><span>Qidirish...</span></Link>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3"><h2 className="shop-section-title">Kategoriyalar</h2><Link to="/catalog" className="shop-more">Barchasi <ArrowRight size={15} /></Link></div>
        <CategoryList />
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="shop-section-title">Ommabop mahsulotlar</h2>
          <Link to="/catalog" className="shop-more">Barchasi <ArrowRight size={15} /></Link>
        </div>
        {products.isLoading ? <div className="shop-product-grid">{Array.from({ length: 4 }, (_, index) => <div key={index} className="glass-card aspect-[4/5] animate-pulse" />)}</div> : null}
        {products.isError ? <div className="glass-card p-5 text-sm">Mahsulotlar yuklanmadi. <button type="button" className="font-bold underline" onClick={() => void products.refetch()}>Qayta urinish</button></div> : null}
        {products.data?.data.length ? <ProductGrid products={products.data.data} /> : null}
        {products.data?.data.length === 0 ? <div className="glass-card p-6 text-center text-sm">Hozircha mahsulotlar yo‘q.</div> : null}
      </section>
    </main>
  )
}
