export type ManagedUserRole = 'GUEST' | 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN'

export interface UserListItem {
  id: string
  fullName: string | null
  username: string | null
  telegramId: string | null
  avatarUrl: string | null
  role: ManagedUserRole
  lastSeenAt: string | null
  isOnline: boolean
}

export interface UsersPage {
  data: UserListItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type OnlineFilter = 'ALL' | 'ONLINE' | 'OFFLINE'
export type RoleFilter = 'ALL' | Exclude<ManagedUserRole, 'GUEST'>
