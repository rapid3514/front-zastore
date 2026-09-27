import { Footprints, Shirt, Sparkles, Watch } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCategories } from '@/features/catalog/hooks/use-categories'

const icons = [Shirt, Footprints, Sparkles, Watch]

export function CategoryList() {
  const query = useCategories()

  if (query.isLoading) {
    return <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="glass-card h-28 animate-pulse" />)}</div>
  }

  if (query.isError) {
    return <div className="glass-card p-5 text-sm">Kategoriyalar yuklanmadi. <button type="button" onClick={() => void query.refetch()} className="font-bold underline">Qayta urinish</button></div>
  }

  const categories = query.data?.filter((category) => category.isActive) ?? []
  if (!categories.length) return <div className="glass-card p-5 text-sm">Hozircha kategoriyalar yo‘q.</div>

  return (
    <div className="shop-category-grid">
      {categories.map((category, index) => {
        const Icon = icons[index % icons.length]
        return (
          <Link key={category.id} to={`/catalog?category=${category.id}`} className="shop-category-card">
            <span className="shop-category-icon"><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></span>
            <span className="truncate font-bold" title={category.name}>{category.name}</span>
          </Link>
        )
      })}
    </div>
  )
}
