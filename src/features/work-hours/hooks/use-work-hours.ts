import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/app/query-client'
import { workHoursApi, workHoursKeys, type WorkHourInput } from '../api/work-hours.api'

export function useWorkHoursStatus() {
  return useQuery({
    queryKey: workHoursKeys.status(),
    queryFn: ({ signal }) => workHoursApi.getStatus(signal),
    staleTime: QUERY_STALE_TIME.public,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })
}

export function useManageWorkHours() {
  return useQuery({
    queryKey: workHoursKeys.manage(),
    queryFn: ({ signal }) => workHoursApi.getManage(signal),
    staleTime: QUERY_STALE_TIME.admin,
  })
}

export function useUpdateWorkHours() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: WorkHourInput[]) => workHoursApi.update(input),
    onSuccess: (schedule) => {
      client.setQueryData(workHoursKeys.manage(), schedule)
      void client.invalidateQueries({ queryKey: workHoursKeys.status() })
    },
  })
}
