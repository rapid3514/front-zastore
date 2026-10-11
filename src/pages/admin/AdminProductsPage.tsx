import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Camera, Loader2, Pencil, Plus, RefreshCw, Search, Send, Trash2, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Product, ProductAvailabilityStatus, ProductInput, ProductMediaInput, TelegramSyncStatus } from '@/features/catalog/api/products.api'
import { availabilityBadgeClass, availabilityLabel, availabilityOptions } from '@/features/catalog/lib/product-availability'
import { getProductCoverUrl } from '@/features/catalog/lib/product-media'
import { useManageCategories } from '@/features/catalog/hooks/use-categories'
import { useManageProduct, useManageProducts, useProductMutations } from '@/features/catalog/hooks/use-products'
import { catalogError } from '@/features/catalog/lib/catalog-error'
import { ProductMediaUploader } from '@/features/media/components/ProductMediaUploader'
import { useProductMedia } from '@/features/media/hooks/use-product-media'
import { ConfirmDialog } from '@/features/super-admin/components/ConfirmDialog'
import { ModalShell } from '@/features/super-admin/components/ModalShell'
import { formatCargoPrice, formatMoney } from '@/shared/lib/format'
import { useToastStore } from '@/shared/ui/toast-store'

interface ProductFormProps {
  product: Product | null
  onClose: () => void
  categoriesPath: string
}

function ProductForm({ product, onClose, categoriesPath }: ProductFormProps) {
  const detail = useManageProduct(product?.id ?? '')
  if (product && detail.isLoading) return <ModalShell open title="Mahsulot yuklanmoqda" onOpenChange={(open) => { if (!open) onClose() }}><p className="flex items-center gap-2 text-sm text-slate-600"><Loader2 className="size-4 animate-spin" />Media yuklanmoqda...</p></ModalShell>
  if (product && detail.isError) return <ModalShell open title="Mahsulotni yuklab bo‘lmadi" onOpenChange={(open) => { if (!open) onClose() }}><p role="alert" className="text-sm text-red-600">Mahsulot ma’lumotlari va media yuklanmadi.</p><div className="mt-4 flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Yopish</Button><Button type="button" onClick={() => void detail.refetch()}>Qayta urinish</Button></div></ModalShell>
  return <ProductFormContent key={product?.id ?? 'new'} product={detail.data ?? product} onClose={onClose} categoriesPath={categoriesPath} />
}

function ProductFormContent({ product, onClose, categoriesPath }: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product?.price ?? '')
  const [cargoPrice, setCargoPrice] = useState(product?.cargoPrice ?? '')
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '')
  const [availabilityStatus, setAvailabilityStatus] = useState<ProductAvailabilityStatus>(product?.availabilityStatus ?? 'IN_STOCK')
  const [error, setError] = useState('')
  const categories = useManageCategories()
  const { create, update } = useProductMutations()
  const showToast = useToastStore((state) => state.show)
  const initialMedia = product?.media.length
    ? product.media
    : product?.imageFileId && product.imageUrl
      ? [{ type: 'IMAGE' as const, fileId: product.imageFileId, url: product.imageUrl, position: 0 }]
      : []
  const mediaController = useProductMedia(initialMedia, () => showToast('Yuklangan media o‘chirilmadi, keyinroq qayta urinib ko‘ring.', 'error'))
  const pending = create.isPending || update.isPending
  const isUploading = mediaController.media.some((item) => item.status === 'queued' || item.status === 'uploading')
  const hasFailedMedia = mediaController.media.some((item) => item.status === 'failed')
  const media = useMemo<ProductMediaInput[]>(() => mediaController.media.flatMap((item) => item.status === 'ready' && item.fileId && item.url ? [{ type: item.type, fileId: item.fileId, url: item.url, position: item.position }] : []), [mediaController.media])

  async function closeWithCleanup() {
    await mediaController.cleanupUnassigned()
    onClose()
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const amount = Number(price)
    if (name.trim().length < 2 || name.trim().length > 150) { setError('Nomi 2–150 belgidan iborat bo‘lishi kerak.'); return }
    if (!categoryId) { setError('Kategoriya tanlang.'); return }
    if (!Number.isFinite(amount) || amount < 0.01 || amount > 99999999.99 || Math.round(amount * 100) !== amount * 100) { setError('Narx 0.01 dan 99 999 999.99 gacha bo‘lishi kerak.'); return }
    if (availabilityStatus === 'ARRIVING_IN_14_DAYS' && (!/^\d+(\.\d{1,2})?$/.test(cargoPrice.trim()) || Number(cargoPrice) < 0.01 || Number(cargoPrice) > 99999999.99)) { setError('14 kunda keladigan mahsulot uchun 100 g kargo narxini kiriting (0.01–99 999 999.99).'); return }
    if (isUploading) { setError('Media yuklanmoqda. Yuklash tugagach saqlang.'); return }
    if (hasFailedMedia) { setError('Yuklanmagan media mavjud. Qayta urinib ko‘ring yoki olib tashlang.'); return }
    const input: ProductInput = { name: name.trim(), description: description.trim() || null, price: amount, categoryId, media, availabilityStatus, ...(availabilityStatus === 'ARRIVING_IN_14_DAYS' ? { cargoPrice: Number(cargoPrice) } : {}) }
    try {
      if (product) await update.mutateAsync({ id: product.id, input })
      else await create.mutateAsync(input)
      mediaController.release()
      showToast(product ? 'Mahsulot yangilandi' : 'Mahsulot yaratildi')
      onClose()
    } catch (cause) {
      const message = catalogError(cause)
      setError(message.toLowerCase().includes('media') ? 'Yuklangan media tasdiqlanmadi.' : message)
    }
  }

  return <ModalShell open title={product ? 'Mahsulotni tahrirlash' : 'Mahsulot qo‘shish'} onOpenChange={(open) => { if (!open && !pending) void closeWithCleanup() }}>
    <form onSubmit={(event) => void submit(event)} className="space-y-4">
      <label className="block text-sm font-bold text-slate-700">Nomi *<input required minLength={2} maxLength={150} className="sa-input mt-2" value={name} onChange={(event) => setName(event.target.value)} /></label>
      <label className="block text-sm font-bold text-slate-700">Kategoriya *<select required className="sa-input mt-2" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Kategoriya tanlang</option>{categories.data?.filter((category) => category.isActive || category.id === product?.categoryId).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      {categories.isLoading ? <p className="text-sm text-slate-500">Kategoriyalar yuklanmoqda...</p> : null}
      {categories.isError ? <p className="text-sm text-red-600">Kategoriyalarni yuklab bo‘lmadi. <button type="button" className="underline" onClick={() => void categories.refetch()}>Qayta urinish</button></p> : null}
      {categories.data?.length === 0 ? <p className="text-sm text-slate-600">Avval <Link to={categoriesPath} onClick={() => void closeWithCleanup()} className="font-bold underline">kategoriya yarating</Link>.</p> : null}
      <label className="block text-sm font-bold text-slate-700">Narx *<input required type="number" min={0.01} max={99999999.99} step="0.01" className="sa-input mt-2" value={price} onChange={(event) => setPrice(event.target.value)} /></label>
      <label className="block text-sm font-bold text-slate-700">Sotuv holati *<select required className="sa-input mt-2" value={availabilityStatus} onChange={(event) => { const status = event.target.value as ProductAvailabilityStatus; setAvailabilityStatus(status); if (status !== 'ARRIVING_IN_14_DAYS') setCargoPrice('') }}>{availabilityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      {availabilityStatus === 'ARRIVING_IN_14_DAYS' ? <label className="block text-sm font-bold text-slate-700">Kargo narxi (100 g uchun) *<input required type="number" min={0.01} max={99999999.99} step="0.01" className="sa-input mt-2" value={cargoPrice} onChange={(event) => setCargoPrice(event.target.value)} placeholder="100 g narxini so‘mda kiriting" /><span className="mt-1 block text-xs font-medium text-slate-500">Faqat 14 kunda keladigan mahsulot uchun. Narx 100 g hisobida kiritiladi.</span></label> : null}
      <label className="block text-sm font-bold text-slate-700">Tavsif<textarea maxLength={2000} className="sa-input mt-2 min-h-24" value={description} onChange={(event) => setDescription(event.target.value)} /></label>
      <ProductMediaUploader controller={mediaController} onError={setError} disabled={pending} />
      {error ? <p role="alert" className="text-sm font-semibold text-red-600">{error}</p> : null}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" disabled={pending} onClick={() => void closeWithCleanup()}>Bekor qilish</Button><Button type="submit" disabled={pending || isUploading || hasFailedMedia || !categories.data?.length}>{pending || isUploading ? <Loader2 className="size-4 animate-spin" /> : null}{isUploading ? 'Media yuklanmoqda...' : pending ? 'Saqlanmoqda...' : 'Saqlash'}</Button></div>
    </form>
  </ModalShell>
}

function syncLabel(status: TelegramSyncStatus | undefined) {
  if (status === 'SYNCED') return '✓ Sinxronlangan'
  if (status === 'FAILED') return '⚠ Sinxronlash xatosi'
  return '⌛ Sinxronlash kutilmoqda'
}

export function AdminProductsPage() {
  const { pathname } = useLocation()
  const categoriesPath = pathname.startsWith('/super-admin') ? '/super-admin/categories' : '/admin/categories'
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [formProduct, setFormProduct] = useState<Product | null | undefined>(undefined)
  const [deleting, setDeleting] = useState<Product | null>(null)
  const [republishing, setRepublishing] = useState<Product | null>(null)
  const products = useManageProducts({ page, limit: 20, ...(search ? { search } : {}) })
  const { update, remove, syncTelegram } = useProductMutations()
  const showToast = useToastStore((state) => state.show)
  useEffect(() => { const timer = window.setTimeout(() => { setSearch(query.trim()); setPage(1) }, 350); return () => window.clearTimeout(timer) }, [query])
  async function toggleStock(product: Product) { try { await update.mutateAsync({ id: product.id, input: { availabilityStatus: product.availabilityStatus === 'IN_STOCK' ? 'OUT_OF_STOCK' : 'IN_STOCK' } }); showToast('Mahsulot holati yangilandi') } catch (cause) { showToast(catalogError(cause), 'error') } }
  async function deleteProduct() { if (!deleting) return; try { await remove.mutateAsync(deleting.id); showToast('Mahsulot o‘chirildi yoki arxivlandi'); setDeleting(null) } catch (cause) { showToast(catalogError(cause), 'error'); setDeleting(null) } }
  async function retrySync(product: Product) { try { await syncTelegram.mutateAsync({ id: product.id }); showToast('Telegramga qayta yuborildi') } catch (cause) { showToast(catalogError(cause), 'error') } }
  async function forceRepublish() { if (!republishing) return; try { await syncTelegram.mutateAsync({ id: republishing.id, forceRepublish: true }); showToast('Telegramga qaytadan joylandi'); setRepublishing(null) } catch (cause) { showToast(catalogError(cause), 'error') } }

  return <div className="sa-page-container space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="sa-eyebrow">Katalog boshqaruvi</p><h1 className="sa-page-title">Mahsulotlar</h1><p className="sa-page-description">Narx, media va Telegram sinxronizatsiyasini boshqaring.</p></div><Button type="button" onClick={() => setFormProduct(null)}><Plus className="size-4" />Mahsulot qo‘shish</Button></header>
    <label className="sa-search max-w-md"><Search className="size-4 text-slate-400" /><span className="sr-only">Mahsulot qidirish</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Mahsulot qidirish..." /></label>
    {products.isLoading || query.trim() !== search ? <p className="sa-glass rounded-2xl p-5">Mahsulotlar yuklanmoqda...</p> : null}
    {products.isError ? <p className="sa-glass rounded-2xl p-5 text-red-600">Mahsulotlarni yuklab bo‘lmadi. <button type="button" className="underline" onClick={() => void products.refetch()}>Qayta urinish</button></p> : null}
    {products.data?.data.length === 0 ? <p className="sa-glass rounded-2xl p-5 text-slate-600">Mahsulot topilmadi.</p> : null}
    <div className="grid gap-3 md:grid-cols-2">{products.data?.data.map((product) => {
      const imageCount = product.media.filter((item) => item.type === 'IMAGE').length
      const videoCount = product.media.filter((item) => item.type === 'VIDEO').length
      const cover = getProductCoverUrl(product)
      return <article key={product.id} className="sa-glass min-w-0 rounded-2xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {cover ? <img src={cover} alt="" loading="lazy" decoding="async" className="size-16 rounded-xl object-cover" /> : <div className="grid size-16 place-items-center rounded-xl bg-white/50 text-slate-400"><Camera className="size-5" /></div>}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><h2 className="truncate text-lg font-extrabold text-slate-950">{product.name}</h2><p className="text-sm text-slate-500">{product.category.name} · {formatMoney(product.price)}</p>{product.availabilityStatus === 'ARRIVING_IN_14_DAYS' && product.cargoPrice ? <p className="text-sm text-amber-700">Kargo: {formatCargoPrice(product.cargoPrice)}</p> : null}</div>
              <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${availabilityBadgeClass(product.availabilityStatus)}`}>{availabilityLabel(product.availabilityStatus)}</span>
            </div>
            <p className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-slate-500"><span className="inline-flex items-center gap-1"><Camera className="size-3" />{imageCount}</span><span className="inline-flex items-center gap-1"><Video className="size-3" />{videoCount}</span><span>{syncLabel(product.telegramSyncStatus)}</span></p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.availabilityStatus !== 'ARRIVING_IN_14_DAYS' ? <Button type="button" variant="outline" disabled={update.isPending} onClick={() => void toggleStock(product)}>{product.availabilityStatus === 'IN_STOCK' ? 'Sotuvda yo‘q' : 'Sotuvda bor'}</Button> : null}
          {product.telegramSyncStatus === 'FAILED' ? <Button type="button" variant="outline" disabled={syncTelegram.isPending} onClick={() => void retrySync(product)}><Send className="size-4" />Qayta yuborish</Button> : null}
          <Button type="button" variant="outline" disabled={syncTelegram.isPending} onClick={() => setRepublishing(product)}><RefreshCw className="size-4" />Telegramga qaytadan joylash</Button>
          <Button type="button" variant="outline" onClick={() => setFormProduct(product)}><Pencil className="size-4" />Tahrirlash</Button>
          <Button type="button" variant="outline" className="text-red-600" onClick={() => setDeleting(product)}><Trash2 className="size-4" />O‘chirish</Button>
        </div>
      </article>
    })}</div>
    {products.data && products.data.meta.totalPages > 1 ? <div className="flex items-center justify-center gap-3"><Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Oldingi</Button><span className="text-sm font-bold">{page} / {products.data.meta.totalPages}</span><Button type="button" variant="outline" disabled={page >= products.data.meta.totalPages} onClick={() => setPage(page + 1)}>Keyingi</Button></div> : null}
    {formProduct !== undefined ? <ProductForm product={formProduct} categoriesPath={categoriesPath} onClose={() => setFormProduct(undefined)} /> : null}
    <ConfirmDialog open={deleting !== null} title="Mahsulotni o‘chirish" description={`“${deleting?.name ?? ''}” mahsulotini o‘chirmoqchimisiz?`} confirmLabel="O‘chirish" pending={remove.isPending} danger onConfirm={() => void deleteProduct()} onOpenChange={(open) => { if (!open) setDeleting(null) }} />
    <ConfirmDialog open={republishing !== null} title="Telegramga qaytadan joylash" description={`“${republishing?.name ?? ''}” mahsulotini Telegramga qaytadan joylaysizmi?`} confirmLabel="Qaytadan joylash" pending={syncTelegram.isPending} onConfirm={() => void forceRepublish()} onOpenChange={(open) => { if (!open) setRepublishing(null) }} />
  </div>
}
