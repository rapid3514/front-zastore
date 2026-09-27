import type { Product } from '@/features/catalog/api/products.api'
import { ProductCard } from './ProductCard'

export function ProductGrid({ products }: { products: Product[] }) {
  return <div className="shop-product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
}
