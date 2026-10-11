import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { FileImage, ImagePlus, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCategoryMutations, useManageCategories } from '@/features/catalog/hooks/use-categories'
import type { Category, CategoryInput } from '@/features/catalog/api/categories.api'
import { catalogError } from '@/features/catalog/lib/catalog-error'
import { useProductMedia, type ProductMediaController } from '@/features/media/hooks/use-product-media'
import { MEDIA_ACCEPT, MEDIA_LIMITS, validateMediaFile } from '@/features/media/lib/media-policy'
import { ConfirmDialog } from '@/features/super-admin/components/ConfirmDialog'
import { ModalShell } from '@/features/super-admin/components/ModalShell'
import { useToastStore } from '@/shared/ui/toast-store'

function CategoryImageUploader({ controller, onError, disabled }: { controller: ProductMediaController; onError: (message: string) => void; disabled: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const image = controller.media.find((item) => item.type === 'IMAGE')
  const isUploading = image?.status === 'queued' || image?.status === 'uploading'

  async function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return
    const validation = validateMediaFile(file, 'IMAGE')
    if (validation) {
      onError(validation.message)
      return
    }
    if (image) await controller.remove(image.localId)
    const result = controller.appendFiles([file], 'IMAGE')
    if (result.rejectedFiles.length) onError(result.rejectedFiles[0].reason.message)
  }

  return <section className="media-uploader sa-glass rounded-2xl p-4" aria-label="Kategoriya rasmi">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h3 className="font-extrabold text-slate-950">Kategoriya rasmi</h3><p className="mt-1 text-xs text-slate-500">Rasm ImageKit’ga yuklanadi. JPEG, PNG, WebP yoki AVIF, ko‘pi bilan {MEDIA_LIMITS.imageMaxBytes / 1024 / 1024} MB.</p></div>
      <input ref={inputRef} type="file" accept={MEDIA_ACCEPT.image} disabled={disabled || isUploading} className="sr-only" onChange={(event) => void selectImage(event)} />
      <Button type="button" variant="outline" disabled={disabled || isUploading} onClick={() => inputRef.current?.click()}><ImagePlus className="size-4" />{image ? 'Rasmni almashtirish' : 'Rasm tanlash'}</Button>
    </div>
    {image ? <div className="mt-4 flex items-start gap-3 rounded-xl border border-white/70 bg-white/55 p-3">
      <img src={image.previewUrl} alt="Kategoriya rasmi previewi" className="size-20 shrink-0 rounded-lg object-cover" />
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-700">{image.file?.name ?? 'Kategoriya rasmi'}</p>{isUploading ? <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-amber-700"><Loader2 className="size-3 animate-spin" />Yuklanmoqda... {image.progress}%</p> : image.status === 'failed' ? <p className="mt-1 text-xs font-semibold text-red-600">{image.error ?? 'Rasm yuklanmadi.'}</p> : <p className="mt-1 text-xs font-semibold text-emerald-700">ImageKit’ga yuklandi</p>}</div>
      <Button type="button" variant="outline" className="shrink-0 text-red-600" disabled={disabled || isUploading} onClick={() => void controller.remove(image.localId)} aria-label="Kategoriya rasmini olib tashlash"><Trash2 className="size-4" /></Button>
    </div> : null}
  </section>
}

function CategoryForm({ category, onClose }: { category: Category | null; onClose: () => void }) {
  const [name, setName] = useState(category?.name ?? '')
  const [description, setDescription] = useState(category?.description ?? '')
  const [sortOrder, setSortOrder] = useState(String(category?.sortOrder ?? 0))
  const [error, setError] = useState('')
  const { create, update } = useCategoryMutations()
  const showToast = useToastStore((state) => state.show)
  const pending = create.isPending || update.isPending
  const mediaController = useProductMedia(category?.imageUrl ? [{ type: 'IMAGE', url: category.imageUrl, position: 0 }] : [], () => showToast('Yuklangan rasmni o‘chirib bo‘lmadi, keyinroq qayta urinib ko‘ring.', 'error'))
  const image = mediaController.media.find((item) => item.type === 'IMAGE')
  const isUploading = image?.status === 'queued' || image?.status === 'uploading'
  const hasFailedImage = image?.status === 'failed'

  async function closeWithCleanup() {
    await mediaController.cleanupUnassigned()
    onClose()
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const cleanName = name.trim().replace(/\s+/g, ' ')
    if (cleanName.length < 2 || cleanName.length > 100) { setError('Nomi 2–100 belgidan iborat bo‘lishi kerak.'); return }
    if (!Number.isInteger(Number(sortOrder)) || Number(sortOrder) < 0) { setError('Tartib manfiy bo‘lmagan butun son bo‘lishi kerak.'); return }
    if (isUploading) { setError('Rasm yuklanmoqda. Yuklash tugagach saqlang.'); return }
    if (hasFailedImage) { setError('Rasm yuklanmadi. Qayta tanlang yoki olib tashlang.'); return }
    const input: CategoryInput = { name: cleanName, description: description.trim() || null, imageUrl: image?.url ?? null, sortOrder: Number(sortOrder) }
    try {
      if (category) await update.mutateAsync({ id: category.id, input })
      else await create.mutateAsync(input)
      mediaController.release()
      showToast(category ? 'Kategoriya yangilandi' : 'Kategoriya muvaffaqiyatli yaratildi')
      onClose()
    } catch (cause) { setError(catalogError(cause)) }
  }

  return (
    <ModalShell open title={category ? 'Kategoriyani tahrirlash' : 'Kategoriya qo‘shish'} onOpenChange={(open) => { if (!open && !pending) void closeWithCleanup() }}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-bold text-slate-700">Nomi *<input required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="sa-input mt-2" /></label>
        <label className="block text-sm font-bold text-slate-700">Tavsif<textarea maxLength={500} value={description} onChange={(event) => setDescription(event.target.value)} className="sa-input mt-2 min-h-24" /></label>
        <CategoryImageUploader controller={mediaController} onError={setError} disabled={pending} />
        <label className="block text-sm font-bold text-slate-700">Tartib<input type="number" min={0} step={1} value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="sa-input mt-2" /></label>
        {error ? <p role="alert" className="text-sm font-semibold text-red-600">{error}</p> : null}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="outline" disabled={pending} onClick={() => void closeWithCleanup()}>Bekor qilish</Button><Button type="submit" disabled={pending || isUploading || hasFailedImage}>{pending || isUploading ? <Loader2 className="size-4 animate-spin" /> : null}{pending ? 'Saqlanmoqda...' : isUploading ? 'Rasm yuklanmoqda...' : 'Saqlash'}</Button></div>
      </form>
    </ModalShell>
  )
}

export function AdminCategoriesPage() {
  const categories = useManageCategories()
  const { setActive, remove } = useCategoryMutations()
  const [formCategory, setFormCategory] = useState<Category | null | undefined>(undefined)
  const [deleting, setDeleting] = useState<Category | null>(null)
  const [search, setSearch] = useState('')
  const showToast = useToastStore((state) => state.show)
  const visible = categories.data?.filter((category) => category.name.toLocaleLowerCase('uz').includes(search.trim().toLocaleLowerCase('uz'))) ?? []

  async function changeActive(category: Category) {
    try { await setActive.mutateAsync({ id: category.id, active: !category.isActive }); showToast(category.isActive ? 'Kategoriya nofaol qilindi' : 'Kategoriya faollashtirildi') }
    catch (cause) { showToast(catalogError(cause), 'error') }
  }

  async function deleteCategory() {
    if (!deleting) return
    try { await remove.mutateAsync(deleting.id); showToast('Kategoriya o‘chirildi'); setDeleting(null) }
    catch (cause) { showToast(catalogError(cause), 'error'); setDeleting(null) }
  }

  return (
    <div className="sa-page-container space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="sa-eyebrow">Katalog boshqaruvi</p><h1 className="sa-page-title">Kategoriyalar</h1><p className="sa-page-description">Mahsulotlar mijoz katalogida shu kategoriyalar bo‘yicha ko‘rinadi.</p></div><Button type="button" onClick={() => setFormCategory(null)}><Plus className="size-4" />Kategoriya qo‘shish</Button></header>
      <label className="sa-search max-w-md"><Search className="size-4 text-slate-400" /><span className="sr-only">Kategoriya qidirish</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Kategoriya qidirish..." /></label>
      {categories.isLoading ? <p className="sa-glass rounded-2xl p-5">Kategoriyalar yuklanmoqda...</p> : null}
      {categories.isError ? <div className="sa-glass rounded-2xl p-5 text-red-600">Kategoriyalarni yuklashda xatolik yuz berdi. <button type="button" className="font-bold underline" onClick={() => void categories.refetch()}>Qayta urinish</button></div> : null}
      {categories.data && visible.length === 0 ? <p className="sa-glass rounded-2xl p-5 text-slate-600">Hozircha kategoriyalar mavjud emas.</p> : null}
      <div className="grid gap-3 md:grid-cols-2">{visible.map((category) => (
        <article key={category.id} className="sa-glass min-w-0 rounded-2xl p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-start gap-3">{category.imageUrl ? <img src={category.imageUrl} alt="" loading="lazy" decoding="async" className="size-16 shrink-0 rounded-xl object-cover" /> : <div className="grid size-16 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-400"><FileImage className="size-6" /></div>}<div className="min-w-0"><h2 className="truncate text-lg font-extrabold text-slate-950" title={category.name}>{category.name}</h2><p className="mt-1 line-clamp-2 text-sm text-slate-500">{category.description || 'Tavsif yo‘q'}</p></div></div><span className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${category.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{category.isActive ? 'Faol' : 'Nofaol'}</span></div>
          <div className="mt-4 flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => setFormCategory(category)}><Pencil className="size-4" />Tahrirlash</Button><Button type="button" variant="outline" disabled={setActive.isPending} onClick={() => void changeActive(category)}>{category.isActive ? 'Nofaol qilish' : 'Faollashtirish'}</Button><Button type="button" variant="outline" onClick={() => setDeleting(category)} className="text-red-600"><Trash2 className="size-4" />O‘chirish</Button></div>
        </article>
      ))}</div>
      {formCategory !== undefined ? <CategoryForm category={formCategory} onClose={() => setFormCategory(undefined)} /> : null}
      <ConfirmDialog open={deleting !== null} title="Kategoriyani o‘chirish" description={`“${deleting?.name ?? ''}” kategoriyasini o‘chirmoqchimisiz?`} confirmLabel="O‘chirish" pending={remove.isPending} danger onConfirm={() => void deleteCategory()} onOpenChange={(open) => { if (!open) setDeleting(null) }} />
    </div>
  )
}
