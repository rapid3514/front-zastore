import { useQuery } from '@tanstack/react-query'
import { auditApi, auditKeys, type AuditLogsParams } from '../api/audit.api'

export function useAuditLogs(params: AuditLogsParams) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: () => auditApi.getLogs(params),
    placeholderData: (previousData) => previousData,
  })
}
