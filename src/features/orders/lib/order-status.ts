import type { OrderStatus } from '../api/orders.api'

export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING_CONFIRMATION: 'Tasdiqlash kutilmoqda',
  CONFIRMED: 'Tasdiqlandi',
  PROCESSING: 'Tayyorlanmoqda',
  COMPLETED: 'Yakunlandi',
  CANCELLED: 'Bekor qilindi',
  EXPIRED: 'Tasdiqlash muddati tugadi',
}

export function getOrderStatusClass(status: OrderStatus) {
  if (status === 'COMPLETED') return 'order-status-success'
  if (status === 'CONFIRMED') return 'order-status-transit'
  if (status === 'CANCELLED' || status === 'EXPIRED') return 'order-status-cancelled'
  return 'order-status-preparing'
}

export function getNextAdminStatuses(status: OrderStatus): OrderStatus[] {
  if (status === 'PENDING_CONFIRMATION') return ['CANCELLED']
  if (status === 'CONFIRMED') return ['PROCESSING', 'CANCELLED']
  if (status === 'PROCESSING') return ['COMPLETED', 'CANCELLED']
  return []
}
