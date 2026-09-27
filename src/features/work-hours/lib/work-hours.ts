import type { WeekDay, WorkHour } from '../api/work-hours.api'

export const weekDayLabels: Record<WeekDay, string> = {
  MONDAY: 'Dushanba',
  TUESDAY: 'Seshanba',
  WEDNESDAY: 'Chorshanba',
  THURSDAY: 'Payshanba',
  FRIDAY: 'Juma',
  SATURDAY: 'Shanba',
  SUNDAY: 'Yakshanba',
}

export function normalizeSchedule(schedule: WorkHour[]): WorkHour[] {
  return [...schedule].sort((left, right) => weekDaysOrder(left.dayOfWeek) - weekDaysOrder(right.dayOfWeek))
}

function weekDaysOrder(day: WeekDay) {
  return ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].indexOf(day)
}

export function validateSchedule(schedule: WorkHour[]): string | null {
  for (const day of schedule) {
    if (!day.isOpen) continue
    if (!day.openTime || !day.closeTime) return `${weekDayLabels[day.dayOfWeek]} uchun ochilish va yopilish vaqtini kiriting.`
    if (day.openTime >= day.closeTime) return 'Yopilish vaqti ochilish vaqtidan keyin bo‘lishi kerak'
  }
  return null
}
