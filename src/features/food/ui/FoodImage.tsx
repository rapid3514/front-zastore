import { cn } from '@/shared/lib/cn'

interface FoodImageProps {
  name: string
  position?: string
  imageUrl?: string | null
  className?: string
}

export function FoodImage({ name, position, imageUrl, className }: FoodImageProps) {
  if (imageUrl) return <img src={imageUrl} alt={name} className={cn('object-cover', className)} />
  return (
    <div
      role="img"
      aria-label={`${name} rasmi`}
      className={cn('food-image', className)}
      style={{
        backgroundImage: position ? "url('/images/food-catalog.png')" : 'linear-gradient(135deg, #fff1e8, #f9d7c1)',
        backgroundPosition: position ?? 'center',
      }}
    />
  )
}
