import type { Product, ProductImageVariants, ProductMedia } from '../api/products.api'

const RESPONSIVE_IMAGE_WIDTHS = [320, 640, 960, 1200] as const

export interface ResponsiveImageSource {
  src?: string | null
  srcSet?: string
}

function imageKitUrl(url: string, transformation: string, suffix = '') {
  try {
    const parsed = new URL(url)
    const isImageKitDelivery = parsed.hostname === 'ik.imagekit.io' || parsed.hostname.endsWith('.imagekit.io')
    const isSigned = parsed.searchParams.has('ik-s') || parsed.searchParams.has('ik-t')
    if (!isImageKitDelivery || isSigned || parsed.searchParams.has('tr')) return undefined
    if (suffix) parsed.pathname = `${parsed.pathname.replace(/\/$/, '')}/${suffix}`
    parsed.searchParams.set('tr', transformation)
    return parsed.toString()
  } catch {
    return undefined
  }
}

export function getResponsiveImageSource(
  originalUrl: string | null | undefined,
  variants: ProductImageVariants | null | undefined,
  preferred: 'thumbnail' | 'card' | 'detail',
): ResponsiveImageSource {
  if (!originalUrl) return { src: originalUrl }

  const generated = RESPONSIVE_IMAGE_WIDTHS.map((width) => ({
    width,
    url: imageKitUrl(originalUrl, `w-${width},f-auto,q-auto`),
  }))
  const generatedSrcSet = generated.every((candidate) => candidate.url)
    ? generated.map((candidate) => `${candidate.url} ${candidate.width}w`).join(', ')
    : undefined
  const preferredWidth = preferred === 'thumbnail' ? 320 : preferred === 'card' ? 640 : 1200
  const generatedPreferred = generated.find((candidate) => candidate.width === preferredWidth)?.url

  return {
    src: variants?.[preferred] ?? generatedPreferred ?? originalUrl,
    srcSet: variants?.srcSet ?? generatedSrcSet,
  }
}

export function getVideoPosterUrl(media: Pick<ProductMedia, 'posterUrl' | 'url'>) {
  return media.posterUrl ?? imageKitUrl(media.url, 'w-640,f-auto,q-auto', 'ik-thumbnail.jpg')
}

export function sortProductMedia(media: ProductMedia[]) {
  return [...media].sort((first, second) => first.position - second.position)
}

export function getProductImages(media: ProductMedia[]) {
  return sortProductMedia(media).filter((item) => item.type === 'IMAGE')
}

export function getProductCoverImage(product: Pick<Product, 'media' | 'imageUrl' | 'imageVariants'>): ResponsiveImageSource {
  const firstImage = getProductImages(product.media)[0]
  return getResponsiveImageSource(
    firstImage?.url ?? product.imageUrl,
    product.imageVariants ?? firstImage?.variants,
    'card',
  )
}

export function getProductCoverUrl(product: Pick<Product, 'media' | 'imageUrl' | 'imageVariants'>) {
  return getProductCoverImage(product).src
}
