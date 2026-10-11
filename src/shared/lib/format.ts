export function formatMoney(value: string | number | null | undefined): string {
  const amount = typeof value === 'number' ? value : Number(value ?? 0)
  if (!Number.isFinite(amount)) return '0 so‘m'
  return `${new Intl.NumberFormat('uz-UZ').format(amount)} so‘m`
}

export function formatCargoPrice(value: string | number | null | undefined): string {
  return `${formatMoney(value)} / 100 g`
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}
