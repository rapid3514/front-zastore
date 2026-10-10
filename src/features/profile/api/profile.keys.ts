import { queryKeys } from '@/shared/query/query-keys'

export const profileKeys = {
  all: queryKeys.session.profile(),
  me: () => [...profileKeys.all, 'me'] as const,
}
