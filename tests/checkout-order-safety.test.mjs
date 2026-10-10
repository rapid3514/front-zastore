import assert from 'node:assert/strict'
import test from 'node:test'
import {
  checkoutAttempt,
  completeCheckoutAttempt,
} from '../src/features/orders/lib/checkout-attempt.ts'
import {
  beginCheckoutSubmission,
  releaseCheckoutSubmission,
} from '../src/features/orders/lib/checkout-submission.ts'

class MemoryStorage {
  #values = new Map()

  getItem(key) {
    return this.#values.get(key) ?? null
  }

  setItem(key, value) {
    this.#values.set(key, String(value))
  }

  removeItem(key) {
    this.#values.delete(key)
  }
}

globalThis.sessionStorage = new MemoryStorage()

const firstOrder = {
  items: [{ productId: 'product-a', quantity: 1 }],
  phone: '+998901234567',
}

test.afterEach(() => completeCheckoutAttempt())

test('very fast double submit acquires the synchronous gate only once', () => {
  const lock = { current: false }
  let mutationCount = 0

  if (beginCheckoutSubmission(lock)) mutationCount += 1
  if (beginCheckoutSubmission(lock)) mutationCount += 1

  assert.equal(mutationCount, 1)
  releaseCheckoutSubmission(lock)
  assert.equal(beginCheckoutSubmission(lock), true)
})

test('a failed checkout retry keeps the same idempotency key', async () => {
  const firstKey = await checkoutAttempt('user-a', firstOrder)
  const retryKey = await checkoutAttempt('user-a', firstOrder)

  assert.equal(retryKey, firstKey)
})

test('a successful checkout clears the previous idempotency key', async () => {
  const firstKey = await checkoutAttempt('user-a', firstOrder)
  completeCheckoutAttempt()
  const nextKey = await checkoutAttempt('user-a', firstOrder)

  assert.notEqual(nextKey, firstKey)
})

test('changing the cart or order body creates a new idempotency key', async () => {
  const firstKey = await checkoutAttempt('user-a', firstOrder)
  const changedKey = await checkoutAttempt('user-a', {
    ...firstOrder,
    items: [{ productId: 'product-a', quantity: 2 }],
  })

  assert.notEqual(changedKey, firstKey)
})

test('changing accounts never reuses another user idempotency key', async () => {
  const userAKey = await checkoutAttempt('user-a', firstOrder)
  const userBKey = await checkoutAttempt('user-b', firstOrder)

  assert.notEqual(userBKey, userAKey)
})
