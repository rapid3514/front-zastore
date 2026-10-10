export function getPageParam(params: URLSearchParams) {
  const page = Number(params.get('page') ?? '1')
  return Number.isSafeInteger(page) && page > 0 ? page : 1
}

export function updatePaginatedParam(
  current: URLSearchParams,
  key: string,
  value: string,
) {
  const currentValue = current.get(key) ?? ''
  if (currentValue === value) return new URLSearchParams(current)

  const next = new URLSearchParams(current)
  if (value) next.set(key, value)
  else next.delete(key)
  next.delete('page')
  return next
}

export function updatePaginatedSearch(
  current: URLSearchParams,
  key: string,
  value: string,
) {
  const normalizedValue = value.trim()
  const currentValue = (current.get(key) ?? '').trim()
  if (currentValue === normalizedValue) return new URLSearchParams(current)

  return updatePaginatedParam(current, key, normalizedValue)
}
