import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orderKeys, ordersApi, type OrderStatus, type OrdersParams } from '../api/orders.api'

export function useMyOrders(params: OrdersParams = {}) {
  return useQuery({ queryKey: orderKeys.mine(params), queryFn: () => ordersApi.getMine(params) })
}

export function useMyOrder(id: string) {
  return useQuery({ queryKey: orderKeys.mineDetail(id), queryFn: () => ordersApi.getById(id), enabled: Boolean(id) })
}

export function useCreateOrder() {
  const client = useQueryClient()
  return useMutation({ mutationFn: ordersApi.create, onSuccess: () => client.invalidateQueries({ queryKey: orderKeys.all }) })
}

export function useCancelOrder() {
  const client = useQueryClient()
  return useMutation({ mutationFn: ({ id, reason }: { id: string; reason?: string }) => ordersApi.cancel(id, reason), onSuccess: (_data, variables) => {
    void client.invalidateQueries({ queryKey: orderKeys.all })
    void client.invalidateQueries({ queryKey: orderKeys.mineDetail(variables.id) })
  } })
}

export function useManageOrders(params: OrdersParams = {}) {
  return useQuery({ queryKey: orderKeys.manage(params), queryFn: () => ordersApi.manage(params) })
}

export function useManageOrder(id: string) {
  return useQuery({ queryKey: orderKeys.manageDetail(id), queryFn: () => ordersApi.manageById(id), enabled: Boolean(id) })
}

export function useManageOrderSummary() {
  return useQuery({ queryKey: orderKeys.manageSummary(), queryFn: ordersApi.manageSummary })
}

export function useOrderAdminMutations() {
  const client = useQueryClient()
  const refresh = (_data: unknown, id: string) => {
    void client.invalidateQueries({ queryKey: orderKeys.all })
    if (id) void client.invalidateQueries({ queryKey: orderKeys.manageDetail(id) })
  }
  return {
    confirm: useMutation({ mutationFn: (id: string) => ordersApi.confirm(id), onSuccess: refresh }),
    reject: useMutation({ mutationFn: ({ id, reason }: { id: string; reason?: string }) => ordersApi.reject(id, reason), onSuccess: (_data, variables) => refresh(_data, variables.id) }),
    updateStatus: useMutation({ mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => ordersApi.updateStatus(id, status), onSuccess: (_data, variables) => refresh(_data, variables.id) }),
  }
}
