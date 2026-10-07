import { Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/app/layout/AppLayout'
import { RoleRedirect } from '@/features/auth/ui/RoleRedirect'
import { SuperAdminRoute } from '@/features/auth/ui/SuperAdminRoute'
import { AuthErrorPage } from '@/pages/auth/AuthErrorPage'
import { AuthLoadingPage } from '@/pages/auth/AuthLoadingPage'
import { RegistrationRequiredPage } from '@/pages/auth/RegistrationRequiredPage'
import { CartPage } from '@/pages/cart/CartPage'
import { CheckoutPage } from '@/pages/cart/CheckoutPage'
import { OrderSuccessPage } from '@/pages/cart/OrderSuccessPage'
import { OrderPage } from '@/pages/order/OrderPage'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { AppLoader } from '@/shared/ui/app-loader'
import { HomePage } from '@/pages/shop/HomePage'
import { CatalogPage } from '@/pages/shop/CatalogPage'
import { ShopProductDetailsPage } from '@/pages/shop/ShopProductDetailsPage'
import { ShopOrdersPage } from '@/pages/shop/ShopOrdersPage'
import { ShopOrderDetailPage } from '@/pages/shop/ShopOrderDetailPage'
import { AdminCategoriesPage, AdminCustomersPage, AdminDashboardPage, AdminDetailsPage, AdminEntryPage, AdminOrderDetailPage, AdminOrdersPage, AdminPaymentsPage, AdminProductsPage, AdminReportsPage, AdminTodayPage, AdminWorkHoursPage, AdminsPage, AuditLogsPage, SuperAdminDashboardPage, SuperAdminLayout, SuperAdminProfilePage, SuperAdminUsersPage, SystemStatusPage } from './lazy-admin-pages'

export const router = createBrowserRouter([{
  element: <Suspense fallback={<AppLoader />}><RoleRedirect /></Suspense>,
  children: [
    { path: '/', element: <AppLayout />, children: [
      { index: true, element: <HomePage /> },
      { path: 'catalog', element: <CatalogPage /> },
      { path: 'product/:id', element: <ShopProductDetailsPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'order-success/:id', element: <OrderSuccessPage /> },
      { path: 'order/:productId', element: <OrderPage /> },
      { path: 'orders', element: <ShopOrdersPage /> },
      { path: 'orders/:id', element: <ShopOrderDetailPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'auth/loading', element: <AuthLoadingPage /> },
      { path: 'auth/error', element: <AuthErrorPage /> },
      { path: 'registration-required', element: <RegistrationRequiredPage /> },
      { path: '*', element: <NotFoundPage /> },
    ] },
    { path: '/admin', element: <AdminEntryPage />, children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'customers', element: <AdminCustomersPage /> },
      { path: 'today', element: <AdminTodayPage /> },
      { path: 'reports', element: <AdminReportsPage /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
      { path: 'orders/:id', element: <AdminOrderDetailPage /> },
      { path: 'work-hours', element: <AdminWorkHoursPage /> },
      { path: 'payments', element: <AdminPaymentsPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ] },
    { element: <SuperAdminRoute />, children: [
      { path: '/super-admin', element: <SuperAdminLayout />, children: [
        { index: true, element: <SuperAdminDashboardPage /> },
        { path: 'users', element: <SuperAdminUsersPage /> },
        { path: 'admins', element: <AdminsPage /> },
        { path: 'admins/:userId', element: <AdminDetailsPage /> },
        { path: 'audit-logs', element: <AuditLogsPage /> },
        { path: 'system-status', element: <SystemStatusPage /> },
        { path: 'profile', element: <SuperAdminProfilePage /> },
      ] },
    ] },
  ],
}])
