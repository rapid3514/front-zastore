import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { paymentKeys, paymentsApi, type PaymentsParams } from '../api/payments.api'

export function useOrderPayment(orderId: string) {
  return useQuery({
    queryKey: paymentKeys.order(orderId),
    queryFn: () => paymentsApi.getForOrder(orderId),
    enabled: Boolean(orderId),
    retry: false,
  })
}

export function useCreateOrderPayment() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: paymentsApi.createForOrder,
    onSuccess: (payment) => {
      client.setQueryData(paymentKeys.order(payment.orderId), payment)
      void client.invalidateQueries({ queryKey: paymentKeys.all })
    },
  })
}

export function useManagePayments(params: PaymentsParams) {
  return useQuery({
    queryKey: paymentKeys.manage(params),
    queryFn: () => paymentsApi.getManage(params),
    placeholderData: (previousData) => previousData,
  })
}

export function useManagePayment(id: string) {
  return useQuery({
    queryKey: paymentKeys.manageDetail(id),
    queryFn: () => paymentsApi.getManageById(id),
    enabled: Boolean(id),
  })
}
