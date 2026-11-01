import { useState } from 'react'
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCartSubtotal, useCartStore } from '@/features/cart/model/cart.store'
import { availabilityLabel } from '@/features/catalog/lib/product-availability'
import { ShopImage } from '@/features/shop/components/ShopImage'
import { ConfirmDialog } from '@/features/super-admin/components/ConfirmDialog'
import { formatCargoPrice, formatMoney } from '@/shared/lib/format'
import { telegramHaptic } from '@/shared/telegram/telegram'
import { useToastStore } from '@/shared/ui/toast-store'

export function CartPage() {
  const items = useCartStore((state) => state.items)
  const increase = useCartStore((state) => state.increaseQuantity)
  const decrease = useCartStore((state) => state.decreaseQuantity)
  const remove = useCartStore((state) => state.removeItem)
  const clearCart = useCartStore((state) => state.clearCart)
  const showToast = useToastStore((state) => state.show)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const subtotal = getCartSubtotal(items)
  const hasUnavailable = items.some((item) => item.availabilityStatus === 'OUT_OF_STOCK')

  function handleClear() {
    clearCart()
    telegramHaptic('warning')
    showToast('Savat tozalandi')
    setShowClearConfirm(false)
  }

  function handleRemove(productId: string, name: string, size?: string) {
    remove(productId, size)
    telegramHaptic('light')
    const sizeSuffix = size ? ` (${size})` : ''
    showToast(`“${name}${sizeSuffix}” savatdan olib tashlandi`)
  }

  return (
    <main className="page-container shop-page space-y-5">
      <header className="shop-page-header">
        <h1 className="shop-page-title">Savat</h1>
        {items.length ? (
          <button type="button" className="shop-clear-button" onClick={() => setShowClearConfirm(true)}>
            Tozalash
          </button>
        ) : null}
      </header>
      {!items.length ? (
        <div className="glass-card mx-auto max-w-lg px-6 py-14 text-center">
          <div className="shop-empty-icon"><ShoppingBag size={28} /></div>
          <h2 className="mt-5 text-xl font-bold">Savatingiz bo‘sh</h2>
          <p className="shop-muted mt-2 text-sm">Katalogdan yoqqan mahsulotingizni tanlang.</p>
          <Link to="/catalog" className="shop-primary-button mt-6">Katalogni ko‘rish</Link>
        </div>
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-3">
            {items.map((item) => {
              const itemKey = `${item.productId}::${item.size || ''}`
              return (
                <article key={itemKey} className={`shop-cart-item glass-card ${item.availabilityStatus !== 'OUT_OF_STOCK' ? '' : 'opacity-60'}`}>
                  <ShopImage name={item.name} imageUrl={item.imageUrl} className="shop-cart-image" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate font-bold">{item.name}</h2>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {item.category ? <p className="shop-muted text-xs">{item.category}</p> : null}
                          {item.size ? (
                            <span className="inline-block rounded-md bg-pink-100 px-1.5 py-0.5 text-[11px] font-extrabold text-pink-700 dark:bg-pink-900/50 dark:text-pink-300">
                              O‘lcham: {item.size}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-3 font-black">{formatMoney(item.price)}</p>
                        <p className={`mt-1 text-xs font-bold ${item.availabilityStatus === 'OUT_OF_STOCK' ? 'text-red-600' : 'text-amber-700 dark:text-amber-400'}`}>
                          {availabilityLabel(item.availabilityStatus)}
                        </p>
                        {item.availabilityStatus === 'ARRIVING_IN_14_DAYS' && item.cargoPrice ? (
                          <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                            Kargo: {formatCargoPrice(item.cargoPrice)}
                          </p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.productId, item.name, item.size)}
                        className="shop-remove"
                        aria-label={`${item.name}ni savatdan o‘chirish`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                    <div className="mt-auto pt-3">
                      <div className="shop-quantity">
                        <button
                          type="button"
                          onClick={() => { decrease(item.productId, item.size); telegramHaptic('light') }}
                          aria-label={`${item.name} miqdorini kamaytirish`}
                        >
                          <Minus size={15} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => { increase(item.productId, item.size); telegramHaptic('light') }}
                          aria-label={`${item.name} miqdorini oshirish`}
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
          <aside className="shop-cart-summary glass-card">
            <div><span>Jami:</span><strong>{formatMoney(subtotal)}</strong></div>
            {items.some((item) => item.availabilityStatus === 'ARRIVING_IN_14_DAYS') ? (
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">14 kunlik mahsulotlarning kargo narxi bu jamiga kirmaydi.</p>
            ) : null}
            {hasUnavailable ? <p className="text-xs font-semibold text-red-600">Mavjud bo‘lmagan mahsulotlarni olib tashlang.</p> : null}
            <Link to="/checkout" aria-disabled={hasUnavailable} className={`shop-primary-button w-full ${hasUnavailable ? 'pointer-events-none opacity-50' : ''}`}>
              Buyurtma berish <ArrowRight size={17} />
            </Link>
          </aside>
        </div>
      )}
      <ConfirmDialog
        open={showClearConfirm}
        title="Savatni tozalash"
        description="Savatingizdagi barcha mahsulotlarni o‘chirmoqchimisiz?"
        confirmLabel="Tozalash"
        danger
        onConfirm={handleClear}
        onOpenChange={setShowClearConfirm}
      />
    </main>
  )
}
