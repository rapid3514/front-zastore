import type { ProductAvailabilityStatus } from '../api/products.api'

export const availabilityOptions: Array<{ value: ProductAvailabilityStatus; label: string }> = [
  { value: 'IN_STOCK', label: 'Sotuvda bor' },
  { value: 'ARRIVING_IN_14_DAYS', label: '14 kunda keladi' },
  { value: 'OUT_OF_STOCK', label: 'Sotuvda yo‘q' },
]

export function availabilityLabel(status: ProductAvailabilityStatus) {
  return availabilityOptions.find((option) => option.value === status)?.label ?? status
}

export function canOrderProduct(product: { availabilityStatus: ProductAvailabilityStatus }) {
  return product.availabilityStatus !== 'OUT_OF_STOCK'
}

export function availabilityBadgeClass(status: ProductAvailabilityStatus) {
  if (status === 'IN_STOCK') return 'bg-emerald-100 text-emerald-700'
  if (status === 'ARRIVING_IN_14_DAYS') return 'bg-amber-100 text-amber-800'
  return 'bg-slate-200 text-slate-600'
}
