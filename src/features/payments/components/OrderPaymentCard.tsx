import { CreditCard, Loader2, RefreshCw, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCreateOrderPayment, useOrderPayment } from '../hooks/use-payments'
import { getPaymentStatusClass, paymentStatusLabels } from '../lib/payment-status'
import { normalizeApiError } from '@/shared/api/api-error'
import { formatDateTime, formatMoney } from '@/shared/lib/format'
import { useToastStore } from '@/shared/ui/toast-store'

export function OrderPaymentCard({ orderId }: { orderId: string }) {
  const payment = useOrderPayment(orderId)
  const createPayment = useCreateOrderPayment()
  const showToast = useToastStore((state) => state.show)
  const notFound = payment.isError && normalizeApiError(payment.error).status === 404

  async function createRecord() {
    try {
      await createPayment.mutateAsync(orderId)
      showToast('To‘lov qaydi yaratildi')
    } catch (cause) {
      showToast(normalizeApiError(cause).message, 'error')
    }
  }

  return (
    <section className="glass-card space-y-4 p-5">
      <div className="flex items-start gap-3">
        <span className="shop-order-icon"><CreditCard size={19} /></span>
        <div className="min-w-0 flex-1"><h2 className="font-black">To‘lov</h2><p className="shop-muted mt-1 text-sm">To‘lov holati backend tomonidan boshqariladi.</p></div>
      </div>

      {payment.isLoading ? <div className="h-20 animate-pulse rounded-2xl bg-white/30" /> : null}
      {payment.data ? <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3"><span className="shop-muted text-sm">Holat</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${getPaymentStatusClass(payment.data.status)}`}>{paymentStatusLabels[payment.data.status]}</span></div>
        <div className="flex justify-between gap-4 text-sm"><span className="shop-muted">Summa</span><strong>{formatMoney(payment.data.amount)}</strong></div>
        <div className="flex justify-between gap-4 text-sm"><span className="shop-muted">Yaratilgan</span><strong>{formatDateTime(payment.data.createdAt)}</strong></div>
        {payment.data.paidAt ? <div className="flex justify-between gap-4 text-sm"><span className="shop-muted">To‘langan vaqt</span><strong>{formatDateTime(payment.data.paidAt)}</strong></div> : null}
        {!payment.data.providerConfigured ? <ProviderUnavailable /> : <div className="flex justify-between gap-4 text-sm"><span className="shop-muted">Provider</span><strong>{payment.data.provider}</strong></div>}
      </div> : null}

      {notFound ? <div className="space-y-3"><ProviderUnavailable /><p className="shop-muted text-sm">Bu buyurtma uchun hali payment record yaratilmagan.</p><Button type="button" variant="outline" disabled={createPayment.isPending} onClick={() => void createRecord()}>{createPayment.isPending ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}To‘lov qaydini yaratish</Button></div> : null}
      {payment.isError && !notFound ? <div className="rounded-2xl bg-red-50/70 p-4 text-sm font-semibold text-red-700">{normalizeApiError(payment.error).message}<Button type="button" variant="ghost" className="ml-2" onClick={() => void payment.refetch()}><RefreshCw className="size-4" />Qayta urinish</Button></div> : null}
    </section>
  )
}

function ProviderUnavailable() {
  return <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50/80 p-3 text-sm font-semibold text-amber-900"><ShieldAlert className="mt-0.5 size-4 shrink-0" /><span>Online to‘lov provayderi hali ulanmagan. Bu real checkout yoki pul o‘tkazmasi emas.</span></div>
}
