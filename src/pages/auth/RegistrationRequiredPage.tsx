import { useState } from 'react'
import { CheckCircle2, Loader2, Phone, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { authApi } from '@/features/auth/api/auth.api'
import { useAuthStore } from '@/features/auth/model/auth.store'
import { normalizeApiError } from '@/shared/api/api-error'
import {
  getTelegramInitData,
  getTelegramWebApp,
  requestTelegramContact,
} from '@/shared/telegram/telegram'

const wait = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))

export function RegistrationRequiredPage() {
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')

  async function checkRegistration(attempts = 1) {
    const initData = getTelegramInitData()
    if (!initData) {
      setMessage('Mini Appni Telegram bot ichidan qayta oching.')
      return false
    }

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      if (attempt > 0) await wait(1_000)
      const response = await authApi.telegramLogin(initData)
      if (response.registered) {
        useAuthStore.getState().setAuthenticated(response.accessToken, response.user)
        return true
      }
    }

    return false
  }

  async function requestPhone() {
    setPending(true)
    setMessage('')
    try {
      const granted = await requestTelegramContact()
      if (granted === null) {
        setMessage('Telegram versiyangiz telefon so‘rashni qo‘llamaydi. Botga qaytib “Telefon raqamni yuborish” tugmasini bosing.')
        return
      }
      if (!granted) {
        setMessage('Ro‘yxatdan o‘tish uchun telefon raqamini yuborishga ruxsat bering.')
        return
      }

      setMessage('Profil yaratilmoqda...')
      if (!(await checkRegistration(6))) {
        setMessage('Profil hali topilmadi. Bir necha soniyadan keyin “Qayta tekshirish”ni bosing.')
      }
    } catch (error) {
      setMessage(normalizeApiError(error).message)
    } finally {
      setPending(false)
    }
  }

  async function retry() {
    setPending(true)
    setMessage('')
    try {
      if (!(await checkRegistration())) {
        setMessage('Telefon raqami hali botga yuborilmagan. Avval telefon raqamingizni yuboring.')
      }
    } catch (error) {
      setMessage(normalizeApiError(error).message)
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="page-shell">
      <Card className="glass-card w-full max-w-sm">
        <CardHeader>
          <Send className="mb-4 size-8 text-[var(--tg-button)]" aria-hidden="true" />
          <h1 className="text-xl font-bold text-[var(--tg-text)]">Ro‘yxatdan o‘tish</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-[var(--app-muted)]">
            Buyurtma berish uchun Telegram telefon raqamingizni botga yuboring. Profil avtomatik yaratiladi.
          </p>
          <Button className="w-full" disabled={pending} onClick={() => void requestPhone()}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Phone className="size-4" />}
            {pending ? 'Tekshirilmoqda...' : 'Telefon raqamni yuborish'}
          </Button>
          <Button className="w-full" variant="outline" disabled={pending} onClick={() => void retry()}>
            <CheckCircle2 className="size-4" /> Qayta tekshirish
          </Button>
          {message ? <p role="status" className="rounded-xl border border-[var(--app-border)] bg-white/30 p-3 text-sm leading-5 text-[var(--tg-text)]">{message}</p> : null}
          <button type="button" className="w-full text-sm font-semibold text-[var(--app-muted)] underline" onClick={() => getTelegramWebApp()?.close()}>
            Botga qaytish
          </button>
        </CardContent>
      </Card>
    </main>
  )
}
