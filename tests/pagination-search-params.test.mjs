import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getPageParam,
  updatePaginatedParam,
  updatePaginatedSearch,
} from '../src/shared/lib/paginated-search-params.ts'

test('a direct page=3 URL keeps page 3', () => {
  const params = new URLSearchParams('search=dress&page=3')

  assert.equal(getPageParam(params), 3)
  assert.equal(updatePaginatedSearch(params, 'search', 'dress').get('page'), '3')
})

test('a real search change resets pagination to page 1', () => {
  const params = new URLSearchParams('search=dress&page=3&sort=cheap')
  const next = updatePaginatedSearch(params, 'search', 'shoes')

  assert.equal(next.get('search'), 'shoes')
  assert.equal(next.has('page'), false)
  assert.equal(next.get('sort'), 'cheap')
})

test('a real filter change resets pagination while the same value does not', () => {
  const params = new URLSearchParams('status=PENDING&page=3')

  assert.equal(updatePaginatedParam(params, 'status', 'PENDING').get('page'), '3')
  assert.equal(updatePaginatedParam(params, 'status', 'CONFIRMED').has('page'), false)
})
