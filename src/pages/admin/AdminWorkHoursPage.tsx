import { useEffect, useRef, useState } from 'react'
import { Clock3, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/glass/GlassCard'
import { useManageWorkHours, useUpdateWorkHours } from '@/features/work-hours/hooks/use-work-hours'
import { weekDays, type WorkHour } from '@/features/work-hours/api/work-hours.api'
import { normalizeSchedule, validateSchedule, weekDayLabels } from '@/features/work-hours/lib/work-hours'
import { normalizeApiError } from '@/shared/api/api-error'
import { useToastStore } from '@/shared/ui/toast-store'

function emptySchedule(): WorkHour[] {
  return weekDays.map((dayOfWeek) => ({ dayOfWeek, isOpen: false, openTime: null, closeTime: null }))
}

export function AdminWorkHoursPage() {
  const scheduleQuery = useManageWorkHours()
  const update = useUpdateWorkHours()
  const showToast = useToastStore((state) => state.show)
  const [draftSchedule, setDraftSchedule] = useState<WorkHour[] | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const schedule = draftSchedule ?? (scheduleQuery.data ? normalizeSchedule(scheduleQuery.data) : emptySchedule())
  const latestSchedule = useRef(schedule)
  const saveQueue = useRef<Promise<void>>(Promise.resolve())
  const isMounted = useRef(true)

  useEffect(() => {
    latestSchedule.current = schedule
  }, [schedule])

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  function updateDay(dayOfWeek: WorkHour['dayOfWeek'], patch: Partial<WorkHour>) {
    setValidationError(null)
    const nextSchedule = latestSchedule.current.map((day) => day.dayOfWeek === dayOfWeek ? { ...day, ...patch } : day)
    latestSchedule.current = nextSchedule
    setDraftSchedule(nextSchedule)
    return nextSchedule
  }

  function persistSchedule(nextSchedule: WorkHour[], notifyOnSuccess = false) {
    const validationMessage = validateSchedule(nextSchedule)
    if (validationMessage) {
      setValidationError(validationMessage)
      return Promise.resolve()
    }

    const payload = nextSchedule.map((day) => day.isOpen ? day : { ...day, openTime: null, closeTime: null })
    const request = saveQueue.current
      .catch(() => undefined)
      .then(async () => {
        try {
          const savedSchedule = normalizeSchedule(await update.mutateAsync(payload))
          if (isMounted.current && latestSchedule.current === nextSchedule) {
            latestSchedule.current = savedSchedule
            setDraftSchedule(savedSchedule)
            setValidationError(null)
          }
          if (notifyOnSuccess) showToast('Ish vaqtlari saqlandi')
        } catch (cause) {
          const error = normalizeApiError(cause)
          showToast(error.status && error.status >= 500 ? 'Ish vaqtlarini saqlashda xatolik yuz berdi' : error.message, 'error')
        }
      })

    saveQueue.current = request
    return request
  }

  function handleSave() {
    return persistSchedule(latestSchedule.current, true)
  }

  return (
    <main className="sa-page-container space-y-5">
      <header>
        <p className="sa-eyebrow">Do‘kon sozlamalari</p>
        <h1 className="sa-page-title">Ish vaqti</h1>
        <p className="sa-page-description">Buyurtmalar qabul qilinadigan vaqtlarni belgilang.</p>
      </header>
      {scheduleQuery.isLoading ? <div className="grid gap-3 md:grid-cols-2">{weekDays.map((day) => <div key={day} className="sa-glass h-40 animate-pulse rounded-3xl" />)}</div> : null}
      {scheduleQuery.isError ? <div className="sa-glass rounded-3xl p-6 text-center text-red-600">{normalizeApiError(scheduleQuery.error).message}<button type="button" className="ml-2 font-bold underline" onClick={() => void scheduleQuery.refetch()}><RefreshCw className="mr-1 inline size-4" />Qayta urinish</button></div> : null}
      {!scheduleQuery.isLoading && !scheduleQuery.isError ? <>
        <div className="grid gap-3 md:grid-cols-2">
          {schedule.map((day) => <GlassCard key={day.dayOfWeek} className="sa-glass rounded-3xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div><h2 className="text-lg font-black text-slate-950">{weekDayLabels[day.dayOfWeek]}</h2><p className={`mt-1 text-sm font-bold ${day.isOpen ? 'text-emerald-600' : 'text-slate-500'}`}>{day.isOpen ? 'Ochiq' : 'Yopiq'}</p></div>
              <button type="button" role="switch" aria-checked={day.isOpen} onClick={() => void persistSchedule(updateDay(day.dayOfWeek, { isOpen: !day.isOpen, ...(!day.isOpen ? { openTime: day.openTime ?? '09:00', closeTime: day.closeTime ?? '18:00' } : { openTime: null, closeTime: null }) }))} className={`work-hours-switch ${day.isOpen ? 'work-hours-switch-active' : ''}`}><span /></button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-bold text-slate-700">Boshlanish<input type="time" value={day.openTime ?? ''} disabled={!day.isOpen} onInput={(event) => updateDay(day.dayOfWeek, { openTime: event.currentTarget.value || null })} onBlur={() => void persistSchedule(latestSchedule.current)} className="sa-input mt-2" /></label>
              <label className="text-sm font-bold text-slate-700">Tugash<input type="time" value={day.closeTime ?? ''} disabled={!day.isOpen} onInput={(event) => updateDay(day.dayOfWeek, { closeTime: event.currentTarget.value || null })} onBlur={() => void persistSchedule(latestSchedule.current)} className="sa-input mt-2" /></label>
            </div>
          </GlassCard>)}
        </div>
        <div className="flex flex-col gap-3">
          {validationError ? <p className="text-sm font-bold text-red-600">{validationError}</p> : null}
          <Button type="button" onClick={() => void handleSave()} disabled={update.isPending || scheduleQuery.isLoading} className="w-full sm:w-auto">{update.isPending ? <><Loader2 className="size-4 animate-spin" />Saqlanmoqda...</> : <><Clock3 className="size-4" />Saqlash</>}</Button>
        </div>
      </> : null}
    </main>
  )
}
