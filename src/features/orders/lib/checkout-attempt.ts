import type { CreateOrderInput } from '../api/orders.api'

const storageKey = 'zastore-checkout-attempt'
let pending: { userId: string; hash: string; key: string } | undefined

/** Retain only a payload hash and random key, never addresses or credentials. */
export async function checkoutAttempt(userId: string, input: CreateOrderInput) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(input)))
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  if (!pending) {
    try {
      const saved: unknown = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null')
      if (saved && typeof saved === 'object' && 'userId' in saved && typeof saved.userId === 'string' &&
          'hash' in saved && typeof saved.hash === 'string' && 'key' in saved && typeof saved.key === 'string') {
        pending = { userId: saved.userId, hash: saved.hash, key: saved.key }
      }
    } catch { /* Storage can be unavailable; the in-memory attempt still survives retries. */ }
  }
  if (pending?.userId !== userId || pending.hash !== hash) {
    pending = { userId, hash, key: crypto.randomUUID() }
    try { sessionStorage.setItem(storageKey, JSON.stringify(pending)) } catch { /* In-memory retention remains available. */ }
  }
  return pending.key
}

export function completeCheckoutAttempt() {
  pending = undefined
  try { sessionStorage.removeItem(storageKey) } catch { /* No persistent state exists when storage is unavailable. */ }
}
