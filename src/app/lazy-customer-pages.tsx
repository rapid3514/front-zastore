import { lazy } from 'react'
import {
  loadCartPage,
  loadCheckoutPage,
  loadOrderPage,
  loadOrderSuccessPage,
  loadProfilePage,
  loadShopOrderDetailPage,
  loadShopOrdersPage,
  loadShopProductDetailsPage,
} from './customer-page-loaders'

export const CartPage = lazy(() => loadCartPage().then((module) => ({ default: module.CartPage })))
export const CheckoutPage = lazy(() => loadCheckoutPage().then((module) => ({ default: module.CheckoutPage })))
export const OrderSuccessPage = lazy(() => loadOrderSuccessPage().then((module) => ({ default: module.OrderSuccessPage })))
export const OrderPage = lazy(() => loadOrderPage().then((module) => ({ default: module.OrderPage })))
export const ProfilePage = lazy(() => loadProfilePage().then((module) => ({ default: module.ProfilePage })))
export const ShopProductDetailsPage = lazy(() => loadShopProductDetailsPage().then((module) => ({ default: module.ShopProductDetailsPage })))
export const ShopOrdersPage = lazy(() => loadShopOrdersPage().then((module) => ({ default: module.ShopOrdersPage })))
export const ShopOrderDetailPage = lazy(() => loadShopOrderDetailPage().then((module) => ({ default: module.ShopOrderDetailPage })))
