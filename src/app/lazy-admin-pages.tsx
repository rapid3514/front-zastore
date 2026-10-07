import { lazy } from 'react'
import {
  loadAdminCategoriesPage,
  loadAdminCustomersPage,
  loadAdminDashboardPage,
  loadAdminDetailsPage,
  loadAdminEntryPage,
  loadAdminOrderDetailPage,
  loadAdminOrdersPage,
  loadAdminProductsPage,
  loadAdminReportsPage,
  loadAdminsPage,
  loadAdminTodayPage,
  loadAdminWorkHoursPage,
  loadAdminPaymentsPage,
  loadAuditLogsPage,
  loadSystemStatusPage,
  loadSuperAdminDashboardPage,
  loadSuperAdminLayout,
  loadSuperAdminProfilePage,
  loadSuperAdminUsersPage,
} from './admin-page-loaders'

export const AdminEntryPage = lazy(() => loadAdminEntryPage().then((module) => ({ default: module.AdminEntryPage })))
export const AdminDashboardPage = lazy(() => loadAdminDashboardPage().then((module) => ({ default: module.AdminDashboardPage })))
export const AdminCustomersPage = lazy(() => loadAdminCustomersPage().then((module) => ({ default: module.AdminCustomersPage })))
export const AdminCategoriesPage = lazy(() => loadAdminCategoriesPage().then((module) => ({ default: module.AdminCategoriesPage })))
export const AdminProductsPage = lazy(() => loadAdminProductsPage().then((module) => ({ default: module.AdminProductsPage })))
export const AdminTodayPage = lazy(() => loadAdminTodayPage().then((module) => ({ default: module.AdminTodayPage })))
export const AdminReportsPage = lazy(() => loadAdminReportsPage().then((module) => ({ default: module.AdminReportsPage })))
export const AdminOrdersPage = lazy(() => loadAdminOrdersPage().then((module) => ({ default: module.AdminOrdersPage })))
export const AdminOrderDetailPage = lazy(() => loadAdminOrderDetailPage().then((module) => ({ default: module.AdminOrderDetailPage })))
export const AdminWorkHoursPage = lazy(() => loadAdminWorkHoursPage().then((module) => ({ default: module.AdminWorkHoursPage })))
export const AdminPaymentsPage = lazy(() => loadAdminPaymentsPage().then((module) => ({ default: module.AdminPaymentsPage })))
export const AdminDetailsPage = lazy(() => loadAdminDetailsPage().then((module) => ({ default: module.AdminDetailsPage })))
export const AdminsPage = lazy(() => loadAdminsPage().then((module) => ({ default: module.AdminsPage })))
export const SuperAdminDashboardPage = lazy(() => loadSuperAdminDashboardPage().then((module) => ({ default: module.SuperAdminDashboardPage })))
export const SuperAdminUsersPage = lazy(() => loadSuperAdminUsersPage().then((module) => ({ default: module.SuperAdminUsersPage })))
export const SuperAdminProfilePage = lazy(() => loadSuperAdminProfilePage().then((module) => ({ default: module.SuperAdminProfilePage })))
export const SuperAdminLayout = lazy(() => loadSuperAdminLayout().then((module) => ({ default: module.SuperAdminLayout })))
export const AuditLogsPage = lazy(() => loadAuditLogsPage().then((module) => ({ default: module.AuditLogsPage })))
export const SystemStatusPage = lazy(() => loadSystemStatusPage().then((module) => ({ default: module.SystemStatusPage })))
