import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Product, ProductInput } from '@/features/catalog/api/products.api'
import { useManageCategories } from '@/features/catalog/hooks/use-categories'
import { useManageProducts, useProductMutations } from '@/features/catalog/hooks/use-products'
import { catalogError } from '@/features/catalog/lib/catalog-error'
import { ConfirmDialog } from '@/features/super-admin/components/ConfirmDialog'
import { ModalShell } from '@/features/super-admin/components/ModalShell'
import { formatMoney } from '@/shared/lib/format'
import { useToastStore } from '@/shared/ui/toast-store'

function ProductForm({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const [name, setName] = useState(product?.name ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product?.price ?? '')
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '')
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '')
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true)
  const [isActive, setIsActive] = useState(product?.isActive ?? true)
  const [error, setError] = useState('')
  const categories = useManageCategories()
  const { create, update } = useProductMutations()
  const showToast = useToastStore((state) => state.show)
  const pending = create.isPending || update.isPending

  async function submit(event: FormEvent) {
    event.preventDefault()
    const amount = Number(price)
    if (name.trim().length < 2 || name.trim().length > 150) { setError('Nomi 2–150 belgidan iborat bo‘lishi kerak.'); return }
    if (!categoryId) { setError('Kategoriya tanlang.'); return }
    if (!Number.isFinite(amount) || amount < 0 || amount > 99999999.99 || Math.round(amount * 100) !== amount * 100) { setError('Narxni to‘g‘ri kiriting.'); return }
    const input: ProductInput = { name: name.trim(), description: description.trim() || null, price: amount, imageUrl: imageUrl.trim() || null, categoryId, isAvailable, isActive }
    try {
      if (product) await update.mutateAsync({ id: product.id, input })
      else await create.mutateAsync(input)
      showToast(product ? 'Mahsulot yangilandi' : 'Mahsulot yaratildi')
      onClose()
    } catch (cause) { setError(catalogError(cause)) }
  }

  return (
    <ModalShell open title={product ? 'Mahsulotni tahrirlash' : 'Mahsulot qo‘shish'} onOpenChange={(open) => { if (!open && !pending) onClose() }}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-bold text-slate-700">Nomi *<input required minLength={2} maxLength={150} className="sa-input mt-2" value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label className="block text-sm font-bold text-slate-700">Kategoriya *<select required className="sa-input mt-2" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">Kategoriya tanlang</option>{categories.data?.filter((category) => category.isActive || category.id === product?.categoryId).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        {categories.isLoading ? <p className="text-sm text-slate-500">Kategoriyalar yuklanmoqda...</p> : null}
        {categories.isError ? <p className="text-sm text-red-600">Kategoriyalarni yuklab bo‘lmadi. <button type="button" className="underline" onClick={() => void categories.refetch()}>Qayta urinish</button></p> : null}
        {categories.data?.length === 0 ? <p className="text-sm text-slate-600">Avval <Link to="/admin/categories" onClick={onClose} className="font-bold underline">kategoriya yarating</Link>.</p> : null}
        <label className="block text-sm font-bold text-slate-700">Narx *<input required type="number" min={0} max={99999999.99} step="0.01" className="sa-input mt-2" value={price} onChange={(event) => setPrice(event.target.value)} /></label>
        <label className="block text-sm font-bold text-slate-700">Tavsif<textarea maxLength={2000} className="sa-input mt-2 min-h-24" value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <label className="block text-sm font-bold text-slate-700">Rasm URL<input type="url" className="sa-input mt-2" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." /></label>
        <label className="flex items-center gap-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={isAvailable} onChange={(event) => setIsAvailable(event.target.checked)} />Bugun mavjud</label>
        <label className="flex items-center gap-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />Menyuda faol</label>
        {error ? <p role="alert" className="text-sm font-semibold text-red-600">{error}</p> : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" disabled={pending} onClick={onClose}>Bekor qilish</Button><Button type="submit" disabled={pending || !categories.data?.length}>{pending ? <Loader2 className="size-4 animate-spin" /> : null}{pending ? 'Saqlanmoqda...' : 'Saqlash'}</Button></div>
      </form>
    </ModalShell>
  )
}

export function AdminProductsPage() {
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [formProduct, setFormProduct] = useState<Product | null | undefined>(undefined)
  const [deleting, setDeleting] = useState<Product | null>(null)
  const products = useManageProducts({ page, limit: 20, ...(search ? { search } : {}) })
  const { update, remove } = useProductMutations()
  const showToast = useToastStore((state) => state.show)

  useEffect(() => { const timer = window.setTimeout(() => { setSearch(query.trim()); setPage(1) }, 350); return () => window.clearTimeout(timer) }, [query])

  async function toggle(product: Product, field: 'isAvailable' | 'isActive') {
    try { await update.mutateAsync({ id: product.id, input: { [field]: !product[field] } }); showToast('Mahsulot holati yangilandi') }
    catch (cause) { showToast(catalogError(cause), 'error') }
  }

  async function deleteProduct() {
    if (!deleting) return
    try { await remove.mutateAsync(deleting.id); showToast('Mahsulot o‘chirildi'); setDeleting(null) }
    catch (cause) { showToast(catalogError(cause), 'error'); setDeleting(null) }
  }

  return (
    <div className="sa-page-container space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="sa-eyebrow">Katalog boshqaruvi</p><h1 className="sa-page-title">Mahsulotlar</h1><p className="sa-page-description">Narx, kategoriya va bugungi mavjudlik holatini boshqaring.</p></div><Button type="button" onClick={() => setFormProduct(null)}><Plus className="size-4" />Mahsulot qo‘shish</Button></header>
      <label className="sa-search max-w-md"><Search className="size-4 text-slate-400" /><span className="sr-only">Mahsulot qidirish</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Mahsulot qidirish..." /></label>
      {products.isLoading || query.trim() !== search ? <p className="sa-glass rounded-2xl p-5">Mahsulotlar yuklanmoqda...</p> : null}
      {products.isError ? <p className="sa-glass rounded-2xl p-5 text-red-600">Mahsulotlarni yuklab bo‘lmadi. <button type="button" className="underline" onClick={() => void products.refetch()}>Qayta urinish</button></p> : null}
      {products.data?.data.length === 0 ? <p className="sa-glass rounded-2xl p-5 text-slate-600">Mahsulot topilmadi.</p> : null}
      <div className="grid gap-3 md:grid-cols-2">{products.data?.data.map((product) => (
        <article key={product.id} className="sa-glass min-w-0 rounded-2xl p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-lg font-extrabold text-slate-950">{product.name}</h2><p className="text-sm text-slate-500">{product.category.name} · {formatMoney(product.price)}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${product.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{product.isAvailable ? 'Mavjud' : 'Mavjud emas'}</span></div>
          <div className="mt-3 flex flex-wrap gap-2"><Button type="button" variant="outline" disabled={update.isPending} onClick={() => void toggle(product, 'isAvailable')}>{product.isAvailable ? 'Mavjud emas' : 'Bugun mavjud'}</Button><Button type="button" variant="outline" disabled={update.isPending} onClick={() => void toggle(product, 'isActive')}>{product.isActive ? 'Katalogdan yashirish' : 'Katalogda ko‘rsatish'}</Button><Button type="button" variant="outline" onClick={() => setFormProduct(product)}><Pencil className="size-4" />Tahrirlash</Button><Button type="button" variant="outline" className="text-red-600" onClick={() => setDeleting(product)}><Trash2 className="size-4" />O‘chirish</Button></div>
        </article>
      ))}</div>
      {products.data && products.data.meta.totalPages > 1 ? <div className="flex items-center justify-center gap-3"><Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Oldingi</Button><span className="text-sm font-bold">{page} / {products.data.meta.totalPages}</span><Button type="button" variant="outline" disabled={page >= products.data.meta.totalPages} onClick={() => setPage(page + 1)}>Keyingi</Button></div> : null}
      {formProduct !== undefined ? <ProductForm product={formProduct} onClose={() => setFormProduct(undefined)} /> : null}
      <ConfirmDialog open={deleting !== null} title="Mahsulotni o‘chirish" description={`“${deleting?.name ?? ''}” mahsulotini o‘chirmoqchimisiz?`} confirmLabel="O‘chirish" pending={remove.isPending} danger onConfirm={() => void deleteProduct()} onOpenChange={(open) => { if (!open) setDeleting(null) }} />
    </div>
  )
}
