import assert from 'node:assert/strict'
import test from 'node:test'
import {
  availabilityBadgeClass,
  availabilityLabel,
  canOrderProduct,
} from '../src/features/catalog/lib/product-availability.ts'
import {
  getNextAdminStatuses,
  getOrderStatusClass,
} from '../src/features/orders/lib/order-status.ts'

test('in-stock and arriving products can be ordered', () => {
  assert.equal(
    canOrderProduct({ availabilityStatus: 'IN_STOCK' }),
    true,
  )
  assert.equal(
    canOrderProduct({ availabilityStatus: 'ARRIVING_IN_14_DAYS' }),
    true,
  )
  assert.equal(
    canOrderProduct({ availabilityStatus: 'OUT_OF_STOCK' }),
    false,
  )
})

test('product availability labels and styles have safe fallbacks', () => {
  assert.equal(availabilityLabel('IN_STOCK'), 'Sotuvda bor')
  assert.equal(availabilityBadgeClass('ARRIVING_IN_14_DAYS'), 'bg-amber-100 text-amber-800')
  assert.equal(availabilityBadgeClass('OUT_OF_STOCK'), 'bg-slate-200 text-slate-600')
})

test('admin order transitions permit only valid next states', () => {
  assert.deepEqual(getNextAdminStatuses('PENDING_CONFIRMATION'), [])
  assert.deepEqual(getNextAdminStatuses('CONFIRMED'), ['PROCESSING', 'CANCELLED'])
  assert.deepEqual(getNextAdminStatuses('PROCESSING'), ['COMPLETED', 'CANCELLED'])
  assert.deepEqual(getNextAdminStatuses('COMPLETED'), [])
  assert.equal(getOrderStatusClass('COMPLETED'), 'order-status-success')
  assert.equal(getOrderStatusClass('EXPIRED'), 'order-status-cancelled')
})
