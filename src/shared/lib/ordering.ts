const ORDERING_START_MINUTES = 8 * 60
const ORDERING_CLOSE_MINUTES = 12 * 60 + 30

export const ORDERING_WINDOW = '08:00–12:30'

function formatIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getOrderingState(now = new Date()) {
  const minutes = now.getHours() * 60 + now.getMinutes()
  const isOpen = minutes >= ORDERING_START_MINUTES && minutes < ORDERING_CLOSE_MINUTES
  const nextRound = new Date(now)

  if (minutes >= ORDERING_CLOSE_MINUTES) {
    nextRound.setDate(nextRound.getDate() + 1)
  }

  return {
    isOpen,
    nextOrderingDate: formatIsoDate(nextRound),
    orderingWindow: ORDERING_WINDOW,
    orderCloseTime: '12:30',
    deliveryWindow: '12:30–14:00',
  }
}
