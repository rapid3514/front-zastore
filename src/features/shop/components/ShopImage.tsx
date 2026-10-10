import { Image as ImageIcon } from 'lucide-react'
import { useState } from 'react'

interface ShopImageProps {
  name: string
  imageUrl?: string | null
  srcSet?: string
  sizes?: string
  className?: string
}

export function ShopImage({ name, imageUrl, srcSet, sizes = '(max-width: 640px) 50vw, 320px', className = '' }: ShopImageProps) {
  const [failed, setFailed] = useState(false)
  return imageUrl && !failed
    ? <img src={imageUrl} srcSet={srcSet} sizes={srcSet ? sizes : undefined} alt={name} loading="lazy" decoding="async" onError={() => setFailed(true)} className={`shop-image ${className}`} />
    : <div role="img" aria-label={name} className={`shop-image shop-image-fallback ${className}`}><ImageIcon size={32} aria-hidden="true" /></div>
}
