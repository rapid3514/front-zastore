export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'registration-required'
  | 'error'

export type UserRole = 'GUEST' | 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN'

export interface CustomerUser {
  id: string
  telegramId: string
  firstName: string
  lastName?: string | null
  username?: string | null
  phone?: string | null
  avatarUrl?: string | null
  role: UserRole
  isBlocked: boolean
  createdAt?: string
  updatedAt?: string
}

export interface TelegramLoginSuccess {
  registered: true
  accessToken: string
  user: CustomerUser
}

export interface RegistrationRequiredResponse {
  registered: false
  registrationRequired: true
}

export type TelegramLoginResponse = TelegramLoginSuccess | RegistrationRequiredResponse

export interface RefreshResponse {
  accessToken: string
  user: CustomerUser
}
