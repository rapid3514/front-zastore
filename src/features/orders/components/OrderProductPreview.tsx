import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import type { Order } from '../api/orders.api'

export function OrderProductPreview({ items }: { items: Order['items'] }) {
  const item = items[0]
  return <ProductThumbnail key={item?.imageUrl ?? 'no-image'} item={item} extraCount={Math.max(0, items.length - 1)} />
}

function ProductThumbnail({ item, extraCount }: { item?: Order['items'][number]; extraCount: number }) {
  const [failed, setFailed] = useState(false)

  return <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-[var(--app-border)] bg-rose-50">
    {item?.imageUrl && !failed
      ? <img src={item.imageUrl} alt={item.productName} loading="lazy" decoding="async" className="size-full object-cover" onError={() => setFailed(true)} />
      : <div className="grid size-full place-items-center text-rose-400" role="img" aria-label={`${item?.productName ?? 'Mahsulot'}: rasm yo‘q`}><ImageOff className="size-6" aria-hidden="true" /></div>}
    {extraCount > 0 ? <span className="absolute bottom-0 right-0 rounded-tl-lg bg-black/65 px-1.5 py-0.5 text-xs font-bold text-white" title={`Yana ${extraCount} xil mahsulot`} aria-label={`Yana ${extraCount} xil mahsulot`}>+{extraCount}</span> : null}
  </div>
}
