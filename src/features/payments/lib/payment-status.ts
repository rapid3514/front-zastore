import type { PaymentStatus } from '../api/payments.api'

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: 'Kutilmoqda',
  PAID: 'To‘langan',
  FAILED: 'Muvaffaqiyatsiz',
  CANCELLED: 'Bekor qilingan',
}

export function getPaymentStatusClass(status: PaymentStatus) {
  if (status === 'PAID') return 'bg-emerald-100 text-emerald-700'
  if (status === 'FAILED' || status === 'CANCELLED') return 'bg-red-100 text-red-700'
  return 'bg-amber-100 text-amber-700'
}
