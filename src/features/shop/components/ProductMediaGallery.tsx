import { useMemo, useState } from 'react'
import { Image as ImageIcon, Play } from 'lucide-react'
import type { Product } from '@/features/catalog/api/products.api'
import { getProductCoverUrl, sortProductMedia } from '@/features/catalog/lib/product-media'
import { ShopImage } from './ShopImage'

interface ProductMediaGalleryProps {
  product: Product
}

export function ProductMediaGallery({ product }: ProductMediaGalleryProps) {
  const media = useMemo(() => sortProductMedia(product.media), [product.media])
  const fallback = getProductCoverUrl(product)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = media[selectedIndex]

  if (!media.length) return <ShopImage name={product.name} imageUrl={fallback} className="aspect-square w-full" />

  return <div className="shop-media-gallery">
    <div className="shop-media-main">
      {selected?.type === 'VIDEO'
        ? <video src={selected.url} controls playsInline preload="metadata" className="aspect-square w-full object-cover" />
        : <img src={selected?.url} alt={product.name} loading="eager" decoding="async" className="aspect-square w-full object-cover" />}
    </div>
    <div className="shop-media-thumbnails" aria-label="Mahsulot media galereyasi">
      {media.map((item, index) => <button key={`${item.fileId}-${item.position}`} type="button" className={`shop-media-thumbnail ${selectedIndex === index ? 'shop-media-thumbnail-active' : ''}`} onClick={() => setSelectedIndex(index)} aria-label={item.type === 'VIDEO' ? 'Videoni ko‘rish' : `${index + 1}-rasmni ko‘rish`}>
        {item.type === 'VIDEO' ? <><video src={item.url} muted playsInline preload="metadata" /><span><Play className="size-4 fill-current" /></span></> : <img src={item.url} alt="" loading="lazy" decoding="async" />}
      </button>)}
      {!media.length && fallback ? <div className="shop-media-thumbnail"><ImageIcon className="size-4" /></div> : null}
    </div>
  </div>
}
