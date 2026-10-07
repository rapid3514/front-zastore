import { useState } from 'react'
import { CreditCard, Eye, RefreshCw, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { paymentStatuses, type Payment, type PaymentStatus } from '@/features/payments/api/payments.api'
import { useManagePayment, useManagePayments } from '@/features/payments/hooks/use-payments'
import { getPaymentStatusClass, paymentStatusLabels } from '@/features/payments/lib/payment-status'
import { ModalShell } from '@/features/super-admin/components/ModalShell'
import { normalizeApiError } from '@/shared/api/api-error'
import { formatDateTime, formatMoney } from '@/shared/lib/format'
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'

export function AdminPaymentsPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<PaymentStatus | ''>('')
  const [provider, setProvider] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const debouncedProvider = useDebouncedValue(provider.trim())
  const payments = useManagePayments({
    page, limit: 20,
    ...(status ? { status } : {}),
    ...(debouncedProvider ? { provider: debouncedProvider } : {}),
    ...(dateFrom ? { dateFrom: new Date(`${dateFrom}T00:00:00`).toISOString() } : {}),
    ...(dateTo ? { dateTo: new Date(`${dateTo}T23:59:59.999`).toISOString() } : {}),
  })
  const selected = useManagePayment(selectedId)

  function resetPage() { setPage(1) }

  return <div className="sa-page-container space-y-5">
    <header><p className="sa-eyebrow">Moliya nazorati</p><h1 className="sa-page-title">To‘lovlar</h1><p className="sa-page-description">Provider-neutral payment qaydlari. Frontend to‘lovni PAID holatiga o‘tkazmaydi.</p></header>
    <div className="sa-glass grid gap-3 rounded-2xl p-4 sm:grid-cols-2 xl:grid-cols-4">
      <label className="text-sm font-bold text-slate-700">Status<select className="sa-input mt-2" value={status} onChange={(event) => { setStatus(event.target.value as PaymentStatus | ''); resetPage() }}><option value="">Barchasi</option>{paymentStatuses.map((item) => <option key={item} value={item}>{paymentStatusLabels[item]}</option>)}</select></label>
      <label className="text-sm font-bold text-slate-700">Provider<input className="sa-input mt-2" maxLength={50} value={provider} onChange={(event) => { setProvider(event.target.value); resetPage() }} placeholder="Provider nomi" /></label>
      <label className="text-sm font-bold text-slate-700">Boshlanish<input type="date" className="sa-input mt-2" value={dateFrom} max={dateTo || undefined} onChange={(event) => { setDateFrom(event.target.value); resetPage() }} /></label>
      <label className="text-sm font-bold text-slate-700">Tugash<input type="date" className="sa-input mt-2" value={dateTo} min={dateFrom || undefined} onChange={(event) => { setDateTo(event.target.value); resetPage() }} /></label>
    </div>
    <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm font-semibold text-amber-900"><ShieldAlert className="mt-0.5 size-4 shrink-0" />External payment provider hali ulanmagan; provider bo‘sh qaydlar real tranzaksiya emas.</div>
    {payments.isLoading ? <div className="sa-glass h-72 animate-pulse rounded-2xl" /> : null}
    {payments.isError ? <div className="sa-glass rounded-2xl p-6 text-center text-red-600">{normalizeApiError(payments.error).message}<Button type="button" variant="outline" className="ml-2" onClick={() => void payments.refetch()}><RefreshCw className="size-4" />Qayta urinish</Button></div> : null}
    {payments.data?.data.length === 0 ? <div className="sa-glass rounded-2xl p-8 text-center"><CreditCard className="mx-auto size-9 text-slate-400" /><p className="mt-3 font-bold text-slate-700">To‘lov qaydi topilmadi</p></div> : null}
    {payments.data?.data.length ? <>
      <div className="grid gap-3 md:hidden">{payments.data.data.map((payment) => <PaymentCard key={payment.id} payment={payment} onOpen={setSelectedId} />)}</div>
      <div className="sa-glass hidden overflow-x-auto rounded-2xl md:block"><table className="w-full min-w-[66rem] text-left"><thead><tr className="text-xs font-extrabold uppercase tracking-wider text-slate-500"><th className="px-5 py-4">Payment</th><th className="px-5 py-4">Order / Customer</th><th className="px-5 py-4">Summa</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Provider</th><th className="px-5 py-4">Yaratilgan</th><th className="px-5 py-4">To‘langan</th><th className="px-5 py-4">Amal</th></tr></thead><tbody>{payments.data.data.map((payment) => <tr key={payment.id} className="border-t border-slate-200/70"><td className="px-5 py-4 text-sm font-bold text-slate-700">#{payment.id.slice(0, 8)}</td><td className="px-5 py-4"><p className="text-sm font-bold text-slate-800">#{payment.orderId.slice(0, 8)}</p><p className="text-xs text-slate-500">{customerName(payment)}</p></td><td className="px-5 py-4 font-bold text-slate-800">{formatMoney(payment.amount)}</td><td className="px-5 py-4"><PaymentBadge status={payment.status} /></td><td className="px-5 py-4 text-sm text-slate-600">{payment.provider ?? 'Provider ulanmagan'}</td><td className="px-5 py-4 text-sm text-slate-600">{formatDateTime(payment.createdAt)}</td><td className="px-5 py-4 text-sm text-slate-600">{formatDateTime(payment.paidAt)}</td><td className="px-5 py-4"><Button type="button" variant="ghost" onClick={() => setSelectedId(payment.id)}><Eye className="size-4" />Ko‘rish</Button></td></tr>)}</tbody></table></div>
    </> : null}
    {payments.data && payments.data.meta.totalPages > 1 ? <div className="flex items-center justify-center gap-3"><Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Oldingi</Button><span className="text-sm font-bold text-slate-700">{page} / {payments.data.meta.totalPages}</span><Button type="button" variant="outline" disabled={page >= payments.data.meta.totalPages} onClick={() => setPage(page + 1)}>Keyingi</Button></div> : null}
    <ModalShell open={Boolean(selectedId)} title="To‘lov tafsilotlari" onOpenChange={(open) => { if (!open) setSelectedId('') }}>
      {selected.isLoading ? <div className="h-48 animate-pulse rounded-2xl bg-slate-100" /> : null}
      {selected.isError ? <p className="text-sm font-semibold text-red-600">{normalizeApiError(selected.error).message}</p> : null}
      {selected.data ? <PaymentDetails payment={selected.data} /> : null}
    </ModalShell>
  </div>
}

function customerName(payment: Payment) { return [payment.order.user.firstName, payment.order.user.lastName].filter(Boolean).join(' ') }
function PaymentBadge({ status }: { status: PaymentStatus }) { return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getPaymentStatusClass(status)}`}>{paymentStatusLabels[status]}</span> }
function PaymentCard({ payment, onOpen }: { payment: Payment; onOpen: (id: string) => void }) { return <article className="sa-glass rounded-2xl p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-black text-slate-900">#{payment.id.slice(0, 8)}</p><p className="mt-1 text-sm text-slate-500">{customerName(payment)}</p></div><PaymentBadge status={payment.status} /></div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-slate-500">Summa</dt><dd className="mt-1 font-bold text-slate-800">{formatMoney(payment.amount)}</dd></div><div><dt className="text-xs text-slate-500">Provider</dt><dd className="mt-1 font-bold text-slate-800">{payment.provider ?? 'Ulanmagan'}</dd></div><div className="col-span-2"><dt className="text-xs text-slate-500">To‘langan</dt><dd className="mt-1 font-bold text-slate-800">{formatDateTime(payment.paidAt)}</dd></div></dl><Button type="button" variant="outline" className="mt-4 w-full" onClick={() => onOpen(payment.id)}><Eye className="size-4" />Batafsil</Button></article> }
function PaymentDetails({ payment }: { payment: Payment }) { return <dl className="grid gap-3 text-sm sm:grid-cols-2"><Detail label="Payment ID" value={payment.id} /><Detail label="Order ID" value={payment.orderId} /><Detail label="Customer" value={customerName(payment)} /><Detail label="Summa" value={formatMoney(payment.amount)} /><Detail label="Status" value={paymentStatusLabels[payment.status]} /><Detail label="Provider" value={payment.provider ?? 'Provider ulanmagan'} /><Detail label="External ID" value={payment.externalId ?? '—'} /><Detail label="Yaratilgan" value={formatDateTime(payment.createdAt)} /><Detail label="To‘langan" value={formatDateTime(payment.paidAt)} /></dl> }
function Detail({ label, value }: { label: string; value: string }) { return <div className="min-w-0 rounded-xl bg-slate-100/70 p-3"><dt className="text-xs font-semibold text-slate-500">{label}</dt><dd className="mt-1 break-words font-bold text-slate-800">{value}</dd></div> }
