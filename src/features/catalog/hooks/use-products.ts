import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_STALE_TIME } from '@/app/query-client'
import { productKeys, productsApi, type ProductsParams } from '../api/products.api'

export function useProducts(params: ProductsParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: ({ signal }) => productsApi.getProducts(params, signal),
    staleTime: QUERY_STALE_TIME.public,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: ({ signal }) => productsApi.getProductById(id, signal),
    enabled: Boolean(id),
    staleTime: QUERY_STALE_TIME.public,
  })
}

export function useManageProducts(params: ProductsParams) {
  return useQuery({
    queryKey: productKeys.manage(params),
    queryFn: ({ signal }) => productsApi.getManageProducts(params, signal),
    staleTime: QUERY_STALE_TIME.admin,
  })
}

export function useManageProduct(id: string) {
  return useQuery({
    queryKey: productKeys.manageDetail(id),
    queryFn: ({ signal }) => productsApi.getManageProductById(id, signal),
    enabled: Boolean(id),
    staleTime: QUERY_STALE_TIME.admin,
  })
}

export function useProductMutations() {
  const client = useQueryClient()
  const onSuccess = () => Promise.all([
    client.invalidateQueries({ queryKey: productKeys.publicAll }),
    client.invalidateQueries({ queryKey: productKeys.adminAll }),
  ])
  return {
    create: useMutation({ mutationFn: productsApi.createProduct, onSuccess }),
    update: useMutation({ mutationFn: ({ id, input }: { id: string; input: Partial<Parameters<typeof productsApi.createProduct>[0]> }) => productsApi.updateProduct(id, input), onSuccess }),
    remove: useMutation({ mutationFn: productsApi.deleteProduct, onSuccess }),
    syncTelegram: useMutation({ mutationFn: ({ id, forceRepublish = false }: { id: string; forceRepublish?: boolean }) => productsApi.syncTelegram(id, forceRepublish), onSuccess }),
  }
}
