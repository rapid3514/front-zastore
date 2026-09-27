import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { workHoursApi, workHoursKeys, type WorkHourInput } from '../api/work-hours.api'

export function useWorkHoursStatus() {
  return useQuery({
    queryKey: workHoursKeys.status(),
    queryFn: workHoursApi.getStatus,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })
}

export function useManageWorkHours() {
  return useQuery({
    queryKey: workHoursKeys.manage(),
    queryFn: workHoursApi.getManage,
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
