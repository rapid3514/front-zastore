const publicRoot = ['public'] as const
const sessionRoot = ['session'] as const
const adminRoot = ['admin'] as const

const append = <TRoot extends readonly string[]>(
  root: TRoot,
  resource: string,
  parts: readonly unknown[],
) => [...root, resource, ...parts] as const

/**
 * Every server-state key starts with its access scope. This makes targeted
 * invalidation predictable and keeps private data out of public cache groups.
 */
export const queryKeys = {
  public: {
    all: publicRoot,
    products: (...parts: readonly unknown[]) => append(publicRoot, 'products', parts),
    categories: (...parts: readonly unknown[]) => append(publicRoot, 'categories', parts),
    workHours: (...parts: readonly unknown[]) => append(publicRoot, 'work-hours', parts),
    health: (...parts: readonly unknown[]) => append(publicRoot, 'health', parts),
  },
  session: {
    all: sessionRoot,
    profile: (...parts: readonly unknown[]) => append(sessionRoot, 'profile', parts),
    orders: (...parts: readonly unknown[]) => append(sessionRoot, 'orders', parts),
    payments: (...parts: readonly unknown[]) => append(sessionRoot, 'payments', parts),
    presence: (...parts: readonly unknown[]) => append(sessionRoot, 'presence', parts),
  },
  admin: {
    all: adminRoot,
    dashboard: (...parts: readonly unknown[]) => append(adminRoot, 'dashboard', parts),
    orders: (...parts: readonly unknown[]) => append(adminRoot, 'orders', parts),
    payments: (...parts: readonly unknown[]) => append(adminRoot, 'payments', parts),
    products: (...parts: readonly unknown[]) => append(adminRoot, 'products', parts),
    categories: (...parts: readonly unknown[]) => append(adminRoot, 'categories', parts),
    workHours: (...parts: readonly unknown[]) => append(adminRoot, 'work-hours', parts),
    users: (...parts: readonly unknown[]) => append(adminRoot, 'users', parts),
    audit: (...parts: readonly unknown[]) => append(adminRoot, 'audit', parts),
    superAdmin: (...parts: readonly unknown[]) => append(adminRoot, 'super-admin', parts),
  },
} as const
