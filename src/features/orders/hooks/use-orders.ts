import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orderKeys, ordersApi, type CreateOrderInput, type OrderStatus, type OrdersParams } from '../api/orders.api'
import { useAuthStore } from '@/features/auth/model/auth.store'
import { checkoutAttempt, completeCheckoutAttempt } from '../lib/checkout-attempt'

export function useMyOrders(params: OrdersParams = {}) {
  return useQuery({ queryKey: orderKeys.mine(params), queryFn: ({ signal }) => ordersApi.getMine(params, signal) })
}

export function useMyOrder(id: string) {
  return useQuery({ queryKey: orderKeys.mineDetail(id), queryFn: ({ signal }) => ordersApi.getById(id, signal), enabled: Boolean(id) })
}

export function useCreateOrder() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      const userId = useAuthStore.getState().user?.id
      if (!userId) throw new Error('Buyurtma berish uchun tizimga kiring.')
      return ordersApi.create(input, await checkoutAttempt(userId, input))
    },
    onSuccess: () => {
      completeCheckoutAttempt()
      return client.invalidateQueries({ queryKey: orderKeys.mineLists() })
    },
  })
}

export function useCancelOrder() {
  const client = useQueryClient()
  return useMutation({ mutationFn: ({ id, reason }: { id: string; reason?: string }) => ordersApi.cancel(id, reason), onSuccess: (updatedOrder, variables) => {
    client.setQueryData(orderKeys.mineDetail(variables.id), updatedOrder)
    void client.invalidateQueries({ queryKey: orderKeys.mineLists() })
  } })
}

export function useManageOrders(params: OrdersParams = {}) {
  return useQuery({ queryKey: orderKeys.manage(params), queryFn: ({ signal }) => ordersApi.manage(params, signal) })
}

export function useManageOrder(id: string) {
  return useQuery({ queryKey: orderKeys.manageDetail(id), queryFn: ({ signal }) => ordersApi.manageById(id, signal), enabled: Boolean(id) })
}

export function useManageOrderSummary() {
  return useQuery({ queryKey: orderKeys.manageSummary(), queryFn: ({ signal }) => ordersApi.manageSummary(signal) })
}

export function useOrderAdminMutations() {
  const client = useQueryClient()
  const refresh = (updatedOrder: Awaited<ReturnType<typeof ordersApi.updateStatus>>, id: string) => {
    client.setQueryData(orderKeys.manageDetail(id), updatedOrder)
    void client.invalidateQueries({ queryKey: orderKeys.manageLists() })
    void client.invalidateQueries({ queryKey: orderKeys.manageSummary() })
  }
  return {
    confirm: useMutation({ mutationFn: (id: string) => ordersApi.confirm(id), onSuccess: refresh }),
    reject: useMutation({ mutationFn: ({ id, reason }: { id: string; reason?: string }) => ordersApi.reject(id, reason), onSuccess: (_data, variables) => refresh(_data, variables.id) }),
    updateStatus: useMutation({ mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => ordersApi.updateStatus(id, status), onSuccess: (_data, variables) => refresh(_data, variables.id) }),
  }
}
