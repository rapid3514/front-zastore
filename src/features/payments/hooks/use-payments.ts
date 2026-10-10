import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/app/query-client'
import { paymentKeys, paymentsApi, type PaymentsParams } from '../api/payments.api'

export function useOrderPayment(orderId: string) {
  return useQuery({
    queryKey: paymentKeys.order(orderId),
    queryFn: ({ signal }) => paymentsApi.getForOrder(orderId, signal),
    enabled: Boolean(orderId),
    retry: false,
    staleTime: QUERY_STALE_TIME.session,
  })
}

export function useCreateOrderPayment() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: paymentsApi.createForOrder,
    onSuccess: (payment) => {
      client.setQueryData(paymentKeys.order(payment.orderId), payment)
      void client.invalidateQueries({ queryKey: paymentKeys.manageLists() })
    },
  })
}

export function useManagePayments(params: PaymentsParams) {
  return useQuery({
    queryKey: paymentKeys.manage(params),
    queryFn: ({ signal }) => paymentsApi.getManage(params, signal),
    placeholderData: (previousData) => previousData,
    staleTime: QUERY_STALE_TIME.admin,
  })
}

export function useManagePayment(id: string) {
  return useQuery({
    queryKey: paymentKeys.manageDetail(id),
    queryFn: ({ signal }) => paymentsApi.getManageById(id, signal),
    enabled: Boolean(id),
    staleTime: QUERY_STALE_TIME.admin,
  })
}
