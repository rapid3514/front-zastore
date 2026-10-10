export interface CheckoutSubmissionLock {
  current: boolean
}

/** Synchronously closes the gap before React can render mutation pending state. */
export function beginCheckoutSubmission(lock: CheckoutSubmissionLock): boolean {
  if (lock.current) return false
  lock.current = true
  return true
}

export function releaseCheckoutSubmission(lock: CheckoutSubmissionLock): void {
  lock.current = false
}
