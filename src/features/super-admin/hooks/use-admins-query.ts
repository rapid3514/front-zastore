import { useQuery } from '@tanstack/react-query'
import { superAdminApi } from '../api/super-admin.api'
import { superAdminKeys } from '../api/super-admin.keys'

export function useAdminsQuery() {
  return useQuery({ queryKey: superAdminKeys.admins(), queryFn: superAdminApi.getAdmins })
}

export function useAdminProfileQuery() {
  return useQuery({ queryKey: superAdminKeys.me(), queryFn: superAdminApi.getMyAdminProfile })
}
