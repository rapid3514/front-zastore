import { getTelegramWebApp } from '@/shared/telegram/telegram'

const productStartParamPattern = /^product_([A-Za-z0-9][A-Za-z0-9_-]{0,127})$/

export function parseTelegramProductStartParam(
  startParam: unknown,
): string | null {
  if (typeof startParam !== 'string') return null
  return productStartParamPattern.exec(startParam)?.[1] ?? null
}

function getStartParamFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  return (
    params.get('tgWebAppStartParam') ??
    params.get('startapp') ??
    params.get('start_param')
  )
}

export function useTelegramStartParam(): string | null {
  return parseTelegramProductStartParam(
    getTelegramWebApp()?.initDataUnsafe?.start_param ?? getStartParamFromUrl(),
  )
}
