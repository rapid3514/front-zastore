import type { Product, ProductMedia } from '../api/products.api'

export function sortProductMedia(media: ProductMedia[]) {
  return [...media].sort((first, second) => first.position - second.position)
}

export function getProductImages(media: ProductMedia[]) {
  return sortProductMedia(media).filter((item) => item.type === 'IMAGE')
}

export function getProductCoverUrl(product: Pick<Product, 'media' | 'imageUrl'>) {
  return getProductImages(product.media)[0]?.url ?? product.imageUrl
}
