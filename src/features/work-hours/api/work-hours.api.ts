import { z } from 'zod'
import { api } from '@/shared/api/api'

export const weekDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const
export type WeekDay = typeof weekDays[number]

export interface WorkHourInput {
  dayOfWeek: WeekDay
  isOpen: boolean
  openTime: string | null
  closeTime: string | null
}

const workHourSchema = z.object({
  dayOfWeek: z.enum(weekDays),
  isOpen: z.boolean(),
  openTime: z.string().nullable(),
  closeTime: z.string().nullable(),
})

const workHourListSchema = z.array(workHourSchema)
const workHourWrapperSchema = z.object({ data: workHourListSchema })

export type WorkHour = z.infer<typeof workHourSchema>

const workHoursStatusSchema = z.object({
  isOpen: z.boolean(),
  timeZone: z.string().optional(),
  today: workHourSchema.nullable().optional(),
  todayWorkHour: workHourSchema.nullable().optional(),
  nextOpenAt: z.string().nullable().optional(),
  nextOpening: z.string().nullable().optional(),
  openTime: z.string().nullable().optional(),
  closeTime: z.string().nullable().optional(),
})
export type WorkHoursStatus = z.infer<typeof workHoursStatusSchema>

function parseSchedule(data: unknown): WorkHour[] {
  const wrapped = workHourWrapperSchema.safeParse(data)
  if (wrapped.success) return wrapped.data.data
  return workHourListSchema.parse(data)
}

export const workHoursKeys = {
  all: ['work-hours'] as const,
  status: () => [...workHoursKeys.all, 'status'] as const,
  manage: () => [...workHoursKeys.all, 'manage'] as const,
}

export const workHoursApi = {
  async getStatus(): Promise<WorkHoursStatus> {
    const { data } = await api.get<unknown>('/work-hours/status')
    return workHoursStatusSchema.parse(data)
  },
  async getManage(): Promise<WorkHour[]> {
    const { data } = await api.get<unknown>('/work-hours/manage')
    return parseSchedule(data)
  },
  async update(input: WorkHourInput[]): Promise<WorkHour[]> {
    const { data } = await api.put<unknown>('/work-hours/manage', input)
    return parseSchedule(data)
  },
}
