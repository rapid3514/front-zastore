import { useQuery } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/app/query-client'
import { auditApi, auditKeys, type AuditLogsParams } from '../api/audit.api'

export function useAuditLogs(params: AuditLogsParams) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: ({ signal }) => auditApi.getLogs(params, signal),
    placeholderData: (previousData) => previousData,
    staleTime: QUERY_STALE_TIME.admin,
  })
}
