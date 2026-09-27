import { MessageCircleWarning } from 'lucide-react'
import { GlassCard } from '@/components/glass/GlassCard'

export function TelegramRequiredPage() {
  return (
    <main className="page-shell">
      <GlassCard className="w-full max-w-sm p-6 text-center">
        <MessageCircleWarning className="mx-auto mb-4 size-9 text-[#e0662d]" aria-hidden="true" />
        <h1 className="text-xl font-black text-[#352922]">Telegram orqali kiring</h1>
        <p className="mt-3 text-sm leading-6 text-[#806f65]">Bu bo‘lim Telegram Mini App orqali kirganda ishlaydi.</p>
      </GlassCard>
    </main>
  )
}
