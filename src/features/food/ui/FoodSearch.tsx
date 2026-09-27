import { Search } from 'lucide-react'

interface FoodSearchProps {
  value: string
  onChange: (value: string) => void
}

export function FoodSearch({ value, onChange }: FoodSearchProps) {
  return (
    <label className="food-search">
      <Search className="size-5 text-[#a68e7d]" aria-hidden="true" />
      <span className="sr-only">Taom qidirish</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Taom qidirish..." />
    </label>
  )
}
