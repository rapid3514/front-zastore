import { Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/app/layout/AppLayout'
import { RoleRedirect } from '@/features/auth/ui/RoleRedirect'
import { SuperAdminRoute } from '@/features/auth/ui/SuperAdminRoute'
import { AuthErrorPage } from '@/pages/auth/AuthErrorPage'
import { AuthLoadingPage } from '@/pages/auth/AuthLoadingPage'
import { RegistrationRequiredPage } from '@/pages/auth/RegistrationRequiredPage'
import { CartPage } from '@/pages/cart/CartPage'
import { CheckoutPage } from '@/pages/cart/CheckoutPage'
import { OrderSuccessPage } from '@/pages/cart/OrderSuccessPage'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { AppLoader } from '@/shared/ui/app-loader'
import { HomePage } from '@/pages/shop/HomePage'
import { CatalogPage } from '@/pages/shop/CatalogPage'
import { ShopProductDetailsPage } from '@/pages/shop/ShopProductDetailsPage'
import { ShopOrdersPage } from '@/pages/shop/ShopOrdersPage'
import { AdminCategoriesPage, AdminDetailsPage, AdminEntryPage, AdminOrderDetailPage, AdminOrdersPage, AdminProductsPage, AdminTodayPage, AdminWorkHoursPage, AdminsPage, MenuPage, ProductDetailPage, SuperAdminDashboardPage, SuperAdminLayout, SuperAdminProfilePage } from './lazy-admin-pages'

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
      { path: 'orders', element: <ShopOrdersPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'menu', element: <Navigate to="/catalog" replace /> },
      { path: 'orders/:id', element: <Navigate to="/orders" replace /> },
      { path: 'auth/loading', element: <AuthLoadingPage /> },
      { path: 'auth/error', element: <AuthErrorPage /> },
      { path: 'registration-required', element: <RegistrationRequiredPage /> },
      { path: '*', element: <NotFoundPage /> },
    ] },
    { path: '/admin', element: <AdminEntryPage />, children: [
      { index: true, element: <AdminTodayPage /> },
      { path: 'menu', element: <MenuPage /> },
      { path: 'product/:id', element: <ProductDetailPage /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
      { path: 'orders/:id', element: <AdminOrderDetailPage /> },
      { path: 'work-hours', element: <AdminWorkHoursPage /> },
      { path: 'profile', element: <ProfilePage /> },
    ] },
    { element: <SuperAdminRoute />, children: [
      { path: '/super-admin', element: <SuperAdminLayout />, children: [
        { index: true, element: <SuperAdminDashboardPage /> },
        { path: 'admins', element: <AdminsPage /> },
        { path: 'admins/:userId', element: <AdminDetailsPage /> },
        { path: 'orders', element: <AdminOrdersPage /> },
        { path: 'orders/:id', element: <AdminOrderDetailPage /> },
        { path: 'profile', element: <SuperAdminProfilePage /> },
      ] },
    ] },
  ],
}])
