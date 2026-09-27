import { CalendarDays, Clock3, Truck } from 'lucide-react'
import { GlassCard } from '@/components/glass/GlassCard'

interface OrderingStatusCardProps {
  isOpen: boolean
  nextOrderingDate: string
  orderCloseTime: string
  deliveryWindow: string
}

export function OrderingStatusCard({ isOpen, nextOrderingDate, orderCloseTime, deliveryWindow }: OrderingStatusCardProps) {
  return (
    <GlassCard className="overflow-hidden p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className={`status-icon ${isOpen ? 'status-icon-open' : 'status-icon-closed'}`}>
          {isOpen ? <Clock3 className="size-5" aria-hidden="true" /> : <CalendarDays className="size-5" aria-hidden="true" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-lg font-bold text-[#352922]">{isOpen ? 'Bugungi menyu ochiq' : 'Bugungi buyurtma yopiq'}</p>
            <span className={`status-badge ${isOpen ? 'status-badge-open' : 'status-badge-closed'}`}>{isOpen ? 'Ochiq' : 'Yopiq'}</span>
          </div>
          {!isOpen && <p className="mt-1 text-sm text-[#806f65]">Keyingi ochilish: {nextOrderingDate}</p>}
          <div className="mt-3 grid gap-2 text-sm text-[#65564e] sm:grid-cols-2">
            <p className="flex items-center gap-2"><Clock3 className="size-4 text-[#e0662d]" aria-hidden="true" /> Buyurtma {orderCloseTime} gacha</p>
            <p className="flex items-center gap-2"><Truck className="size-4 text-[#e0662d]" aria-hidden="true" /> Yetkazish {deliveryWindow}</p>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
