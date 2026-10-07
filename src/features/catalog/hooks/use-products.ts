import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productKeys, productsApi, type ProductsParams } from '../api/products.api'

export function useProducts(params: ProductsParams) {
  return useQuery({ queryKey: productKeys.list(params), queryFn: () => productsApi.getProducts(params) })
}

export function useProduct(id: string) {
  return useQuery({ queryKey: productKeys.detail(id), queryFn: () => productsApi.getProductById(id), enabled: Boolean(id) })
}

export function useManageProducts(params: ProductsParams) {
  return useQuery({ queryKey: productKeys.manage(params), queryFn: () => productsApi.getManageProducts(params) })
}

export function useManageProduct(id: string) {
  return useQuery({ queryKey: productKeys.manageDetail(id), queryFn: () => productsApi.getManageProductById(id), enabled: Boolean(id) })
}

export function useProductMutations() {
  const client = useQueryClient()
  const onSuccess = () => client.invalidateQueries({ queryKey: productKeys.all })
  return {
    create: useMutation({ mutationFn: productsApi.createProduct, onSuccess }),
    update: useMutation({ mutationFn: ({ id, input }: { id: string; input: Partial<Parameters<typeof productsApi.createProduct>[0]> }) => productsApi.updateProduct(id, input), onSuccess }),
    remove: useMutation({ mutationFn: productsApi.deleteProduct, onSuccess }),
    syncTelegram: useMutation({ mutationFn: ({ id, forceRepublish = false }: { id: string; forceRepublish?: boolean }) => productsApi.syncTelegram(id, forceRepublish), onSuccess }),
  }
}
