import { useMemo, useState } from 'react'
import { Play } from 'lucide-react'
import type { Product } from '@/features/catalog/api/products.api'
import {
  getProductCoverImage,
  getResponsiveImageSource,
  getVideoPosterUrl,
  sortProductMedia,
} from '@/features/catalog/lib/product-media'
import { ShopImage } from './ShopImage'

interface ProductMediaGalleryProps {
  product: Product
}

export function ProductMediaGallery({ product }: ProductMediaGalleryProps) {
  const media = useMemo(() => sortProductMedia(product.media), [product.media])
  const fallback = getProductCoverImage(product)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = media[selectedIndex]
  const selectedImage = selected?.type === 'IMAGE'
    ? getResponsiveImageSource(selected.url, selected.variants, 'detail')
    : undefined

  if (!media.length) return <ShopImage name={product.name} imageUrl={fallback.src} srcSet={fallback.srcSet} sizes="(max-width: 768px) 100vw, 600px" className="aspect-square w-full" />

  return <div className="shop-media-gallery">
    <div className="shop-media-main">
      {selected?.type === 'VIDEO'
        ? <video key={selected.id ?? selected.url} src={selected.url} poster={getVideoPosterUrl(selected)} controls playsInline preload="none" className="aspect-square w-full object-cover" />
        : <img src={selectedImage?.src ?? undefined} srcSet={selectedImage?.srcSet} sizes="(max-width: 768px) 100vw, 600px" alt={product.name} loading="eager" decoding="async" className="aspect-square w-full object-cover" />}
    </div>
    <div className="shop-media-thumbnails" aria-label="Mahsulot media galereyasi">
      {media.map((item, index) => {
        const poster = item.type === 'VIDEO' ? getVideoPosterUrl(item) : undefined
        const thumbnail = item.type === 'IMAGE'
          ? getResponsiveImageSource(item.url, item.variants, 'thumbnail').src
          : undefined

        return <button key={`${item.id ?? item.url}-${item.position}`} type="button" className={`shop-media-thumbnail ${selectedIndex === index ? 'shop-media-thumbnail-active' : ''}`} onClick={() => setSelectedIndex(index)} aria-label={item.type === 'VIDEO' ? 'Videoni ko‘rish' : `${index + 1}-rasmni ko‘rish`}>
          {item.type === 'VIDEO'
            ? <>{poster ? <img src={poster} alt="" loading="lazy" decoding="async" /> : null}<span><Play className="size-4 fill-current" /></span></>
            : <img src={thumbnail ?? undefined} alt="" loading="lazy" decoding="async" />}
        </button>
      })}
    </div>
  </div>
}
