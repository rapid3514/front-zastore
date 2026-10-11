import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Loader2, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/glass/GlassCard'
import { useProductMedia } from '@/features/media/hooks/use-product-media'
import { MEDIA_ACCEPT, validateMediaFile } from '@/features/media/lib/media-policy'
import { normalizeApiError } from '@/shared/api/api-error'
import { useToastStore } from '@/shared/ui/toast-store'
import { appearanceApi, appearanceKey, type BotAppearance } from '../api/appearance.api'
import { useBotAppearance } from '../hooks/use-bot-appearance'

export function BotBackgroundCard() {
  const appearance = useBotAppearance()

  return <GlassCard className="p-4 sm:p-6">
    <h2 className="profile-section-title">Bot orqa foni</h2>
    <p className="shop-muted mt-2 text-sm leading-6">Tanlangan fon barcha foydalanuvchilarda ko‘rinadi. JPEG, PNG, WebP yoki AVIF rasm yuklang (5 MB gacha).</p>
    {appearance.isLoading ? <p className="mt-4 text-sm">Fon yuklanmoqda...</p> : null}
    {appearance.isError ? <p role="alert" className="mt-4 text-sm text-red-600">{normalizeApiError(appearance.error).message} <button type="button" className="font-bold underline" onClick={() => void appearance.refetch()}>Qayta urinish</button></p> : null}
    {appearance.data ? <BackgroundEditor key={appearance.data.updatedAt ?? 'default'} appearance={appearance.data} /> : null}
  </GlassCard>
}

function BackgroundEditor({ appearance }: { appearance: BotAppearance }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const releasedRef = useRef(false)
  const savingRef = useRef(false)
  const replacingRef = useRef(false)
  const [isReplacing, setIsReplacing] = useState(false)
  const [error, setError] = useState('')
  const showToast = useToastStore((state) => state.show)
  const client = useQueryClient()
  const update = useMutation({ mutationFn: appearanceApi.update })
  const onCleanupIssue = useCallback(() => showToast('Saqlanmagan rasmni tozalab bo‘lmadi.', 'error'), [showToast])
  const controller = useProductMedia([], onCleanupIssue)
  const { cleanupUnassigned } = controller
  const image = controller.media[0]
  const uploading = image?.status === 'queued' || image?.status === 'uploading'
  const busy = update.isPending || uploading || isReplacing
  const preview = image?.previewUrl ?? appearance.backgroundUrl ?? '/images/lumiera-background.jpg'

  useEffect(() => () => {
    if (!releasedRef.current) void cleanupUnassigned()
  }, [cleanupUnassigned])

  async function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file || busy || replacingRef.current) return
    const validation = validateMediaFile(file, 'IMAGE')
    if (validation) { setError(validation.message); return }
    replacingRef.current = true
    setIsReplacing(true)
    setError('')
    try {
      if (image) await controller.remove(image.localId)
      const result = controller.appendFiles([file], 'IMAGE')
      if (result.rejectedFiles.length) setError(result.rejectedFiles[0].reason.message)
    } finally {
      replacingRef.current = false
      setIsReplacing(false)
    }
  }

  async function save(reset = false) {
    if (busy || savingRef.current || (!reset && (image?.status !== 'ready' || !image.fileId || !image.url))) return
    savingRef.current = true
    setError('')
    try {
      await client.cancelQueries({ queryKey: appearanceKey })
      const current = await update.mutateAsync({ background: reset ? null : { fileId: image!.fileId!, url: image!.url! } })
      if (reset) await controller.cleanupUnassigned()
      releasedRef.current = true
      controller.release()
      client.setQueryData(appearanceKey, current)
      showToast(reset ? 'Standart fon tiklandi' : 'Bot orqa foni yangilandi')
    } catch (cause) {
      setError(normalizeApiError(cause).message)
    } finally {
      savingRef.current = false
    }
  }

  return <div className="mt-4 space-y-4">
    <img src={preview} alt="Bot orqa foni" className="aspect-video w-full rounded-2xl object-cover" />
    <input ref={inputRef} type="file" accept={MEDIA_ACCEPT.image} disabled={busy} className="sr-only" aria-label="Bot orqa foni rasmini tanlash" onChange={(event) => void selectImage(event)} />
    {uploading ? <p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin" />Rasm yuklanmoqda... {image.progress}%</p> : null}
    {image?.status === 'failed' ? <p role="alert" className="text-sm text-red-600">{image.error} <button type="button" className="font-bold underline" onClick={() => controller.retry(image.localId)}>Qayta urinish</button></p> : null}
    {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}><ImagePlus className="size-4" />Rasm tanlash</Button>
      {image ? <Button type="button" variant="outline" disabled={busy} onClick={() => void controller.remove(image.localId)} aria-label="Tanlangan fon rasmini bekor qilish"><Trash2 className="size-4" />Bekor qilish</Button> : null}
      <Button type="button" disabled={busy || image?.status !== 'ready'} onClick={() => void save()}>{update.isPending ? <Loader2 className="size-4 animate-spin" /> : null}Saqlash</Button>
      {appearance.backgroundUrl ? <Button type="button" variant="outline" disabled={busy} onClick={() => void save(true)}><RotateCcw className="size-4" />Standart fonga qaytarish</Button> : null}
    </div>
  </div>
}
