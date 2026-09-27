import type { Category } from '@/features/catalog/api/categories.api'
import { cn } from '@/shared/lib/cn'

interface FoodCategoryFilterProps {
  categories: Category[]
  value: string | null
  onChange: (value: string | null) => void
}

export function FoodCategoryFilter({ categories, value, onChange }: FoodCategoryFilterProps) {
  return (
    <div className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Taom kategoriyalari">
      <button type="button" onClick={() => onChange(null)} className={cn('category-chip shrink-0', value === null && 'category-chip-active')} aria-pressed={value === null}>Barchasi</button>
      {categories.map((category) => (
        <button type="button" key={category.id} onClick={() => onChange(category.id)} className={cn('category-chip max-w-44 shrink-0 truncate', value === category.id && 'category-chip-active')} aria-pressed={value === category.id} title={category.name}>{category.name}</button>
      ))}
    </div>
  )
}
