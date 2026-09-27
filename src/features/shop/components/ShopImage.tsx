import { Image as ImageIcon } from 'lucide-react'
import { useState } from 'react'

export function ShopImage({ name, imageUrl, className = '' }: { name: string; imageUrl?: string | null; className?: string }) {
  const [failed, setFailed] = useState(false)
  return imageUrl && !failed
    ? <img src={imageUrl} alt={name} loading="lazy" onError={() => setFailed(true)} className={`shop-image ${className}`} />
    : <div role="img" aria-label={name} className={`shop-image shop-image-fallback ${className}`}><ImageIcon size={32} aria-hidden="true" /></div>
}
