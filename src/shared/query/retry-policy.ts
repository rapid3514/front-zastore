import axios from 'axios'

const RETRYABLE_HTTP_STATUSES = new Set([502, 503, 504])
const RETRYABLE_NETWORK_CODES = new Set(['ERR_NETWORK', 'ECONNABORTED', 'ETIMEDOUT'])

function isAbortError(error: unknown): boolean {
  return (
    axios.isCancel(error) ||
    (error instanceof DOMException && error.name === 'AbortError')
  )
}

/** Retry one time only for transport failures and explicitly temporary HTTP responses. */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1 || isAbortError(error) || !axios.isAxiosError(error)) return false

  const status = error.response?.status
  if (status !== undefined) return RETRYABLE_HTTP_STATUSES.has(status)

  return (
    (typeof error.code === 'string' && RETRYABLE_NETWORK_CODES.has(error.code)) ||
    error.request !== undefined
  )
}

export function queryRetryDelay(attemptIndex: number): number {
  return Math.min(500 * 2 ** attemptIndex, 2_000)
}
