type PageLoader = () => Promise<unknown>

export const loadAdminEntryPage = () => import('@/pages/admin/AdminEntryPage')
export const loadAdminDashboardPage = () => import('@/pages/admin/AdminDashboardPage')
export const loadAdminCustomersPage = () => import('@/pages/admin/AdminCustomersPage')
export const loadAdminCategoriesPage = () => import('@/pages/admin/AdminCategoriesPage')
export const loadAdminProductsPage = () => import('@/pages/admin/AdminProductsPage')
export const loadAdminTodayPage = () => import('@/pages/admin/AdminTodayPage')
export const loadAdminReportsPage = () => import('@/pages/admin/AdminReportsPage')
export const loadAdminOrdersPage = () => import('@/pages/admin/AdminOrdersPage')
export const loadAdminOrderDetailPage = () => import('@/pages/admin/AdminOrderDetailPage')
export const loadAdminWorkHoursPage = () => import('@/pages/admin/AdminWorkHoursPage')
export const loadAdminPaymentsPage = () => import('@/pages/admin/AdminPaymentsPage')
export const loadAdminDetailsPage = () => import('@/pages/super-admin/AdminDetailsPage')
export const loadAdminsPage = () => import('@/pages/super-admin/AdminsPage')
export const loadSuperAdminDashboardPage = () => import('@/pages/super-admin/SuperAdminDashboardPage')
export const loadSuperAdminUsersPage = () => import('@/pages/super-admin/SuperAdminUsersPage')
export const loadSuperAdminProfilePage = () => import('@/pages/super-admin/SuperAdminProfilePage')
export const loadAuditLogsPage = () => import('@/pages/super-admin/AuditLogsPage')
export const loadSystemStatusPage = () => import('@/pages/super-admin/SystemStatusPage')
export const loadSuperAdminLayout = () => import('@/shared/layout/SuperAdminLayout')

function preload(loaders: PageLoader[]) {
  return Promise.allSettled(loaders.map((load) => load())).then(() => undefined)
}

export function preloadAdminShell() {
  return preload([loadAdminEntryPage, loadAdminDashboardPage])
}

export function preloadAdminPages() {
  return preload([
    loadAdminCustomersPage,
    loadAdminTodayPage,
    loadAdminReportsPage,
    loadAdminProductsPage,
    loadAdminCategoriesPage,
    loadAdminOrdersPage,
    loadAdminOrderDetailPage,
    loadAdminWorkHoursPage,
  ])
}

export function preloadSuperAdminShell() {
  return preload([loadSuperAdminLayout, loadSuperAdminDashboardPage])
}

export function preloadSuperAdminPages() {
  return preload([
    loadSuperAdminUsersPage,
    loadAdminsPage,
    loadAdminDetailsPage,
    loadSuperAdminProfilePage,
  ])
}
