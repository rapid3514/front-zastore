import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Loader2, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/glass/GlassCard'
import { useProductMedia } from '@/features/media/hooks/use-product-media'
import { MEDIA_ACCEPT, validateMediaFile } from '@/features/media/lib/media-policy'
import { normalizeApiError } from '@/shared/api/api-error'
import { useToastStore } from '@/shared/ui/toast-store'
import { appearanceApi, appearanceKey, appearanceLimitKey, type AppearanceScope, type BotAppearance } from '../api/appearance.api'
import { formatDateTime } from '@/shared/lib/format'
import { useBotAppearance } from '../hooks/use-bot-appearance'

export function BotBackgroundCard({ scope = 'bot' }: { scope?: AppearanceScope }) {
  const appearance = useBotAppearance(scope)
  const limit = useQuery({ queryKey: appearanceLimitKey, queryFn: ({ signal }) => appearanceApi.getLimit(signal), staleTime: 30_000, refetchInterval: 60_000 })

  return <GlassCard className="p-4 sm:p-6">
    <h2 className="profile-section-title">{scope === 'super-admin' ? 'Super admin orqa foni' : 'Bot orqa foni'}</h2>
    <p className="shop-muted mt-2 text-sm leading-6">{scope === 'super-admin' ? 'Bu fon faqat super adminlarga ko‘rinadi.' : 'Bu fon super adminlardan boshqa barcha foydalanuvchilarga ko‘rinadi.'} JPEG, PNG, WebP yoki AVIF rasm yuklang (5 MB gacha).</p>
    <p className="mt-3 text-sm font-bold">Limit: har 30 kunda 5 marta. Standart fonga qaytarish ham hisoblanadi.</p>
    {limit.data ? <p role="status" className="shop-muted mt-1 text-sm">Qolgan: {limit.data.remaining} / {limit.data.maxChanges}{limit.data.nextAvailableAt ? `. Qayta o‘zgartirish mumkin: ${formatDateTime(limit.data.nextAvailableAt)}` : ''}</p> : null}
    {limit.isError ? <p role="alert" className="mt-2 text-sm text-red-600">Limitni yuklab bo‘lmadi. <button type="button" className="font-bold underline" onClick={() => void limit.refetch()}>Qayta urinish</button></p> : null}
    {appearance.isLoading ? <p className="mt-4 text-sm">Fon yuklanmoqda...</p> : null}
    {appearance.isError ? <p role="alert" className="mt-4 text-sm text-red-600">{normalizeApiError(appearance.error).message} <button type="button" className="font-bold underline" onClick={() => void appearance.refetch()}>Qayta urinish</button></p> : null}
    {appearance.data ? <BackgroundEditor key={`${scope}:${appearance.data.updatedAt ?? 'default'}`} appearance={appearance.data} scope={scope} limited={!limit.data || limit.isError || limit.data.remaining === 0} /> : null}
  </GlassCard>
}

function BackgroundEditor({ appearance, scope, limited }: { appearance: BotAppearance; scope: AppearanceScope; limited: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const releasedRef = useRef(false)
  const savingRef = useRef(false)
  const replacingRef = useRef(false)
  const [isReplacing, setIsReplacing] = useState(false)
  const [error, setError] = useState('')
  const showToast = useToastStore((state) => state.show)
  const client = useQueryClient()
  const update = useMutation({
    mutationFn: (input: Parameters<typeof appearanceApi.update>[1]) => appearanceApi.update(scope, input),
    onSettled: () => client.invalidateQueries({ queryKey: appearanceLimitKey }),
  })
  const onCleanupIssue = useCallback(() => showToast('Saqlanmagan rasmni tozalab bo‘lmadi.', 'error'), [showToast])
  const controller = useProductMedia([], onCleanupIssue)
  const { cleanupUnassigned } = controller
  const image = controller.media[0]
  const uploading = image?.status === 'queued' || image?.status === 'uploading'
  const busy = update.isPending || uploading || isReplacing
  const preview = image?.previewUrl ?? appearance.backgroundUrl ?? (scope === 'super-admin' ? '/images/zastore-background-dark.png' : '/images/lumiera-background.jpg')

  useEffect(() => () => {
    if (!releasedRef.current) void cleanupUnassigned()
  }, [cleanupUnassigned])

  async function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file || busy || limited || replacingRef.current) return
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
    if (busy || limited || savingRef.current || (!reset && (image?.status !== 'ready' || !image.fileId || !image.url))) return
    savingRef.current = true
    setError('')
    try {
      await client.cancelQueries({ queryKey: appearanceKey(scope) })
      const current = await update.mutateAsync({ background: reset ? null : { fileId: image!.fileId!, url: image!.url! } })
      if (reset) await controller.cleanupUnassigned()
      releasedRef.current = true
      controller.release()
      client.setQueryData(appearanceKey(scope), current)
      showToast(reset ? 'Standart fon tiklandi' : scope === 'super-admin' ? 'Super admin orqa foni yangilandi' : 'Bot orqa foni yangilandi')
    } catch (cause) {
      setError(normalizeApiError(cause).message)
    } finally {
      savingRef.current = false
    }
  }

  return <div className="mt-4 space-y-4">
    <img src={preview} alt="Bot orqa foni" className="aspect-video w-full rounded-2xl object-cover" />
    <input ref={inputRef} type="file" accept={MEDIA_ACCEPT.image} disabled={busy || limited} className="sr-only" aria-label="Bot orqa foni rasmini tanlash" onChange={(event) => void selectImage(event)} />
    {uploading ? <p role="status" className="flex items-center gap-2 text-sm"><Loader2 className="size-4 animate-spin" />Rasm yuklanmoqda... {image.progress}%</p> : null}
    {image?.status === 'failed' ? <p role="alert" className="text-sm text-red-600">{image.error} <button type="button" disabled={limited} className="font-bold underline disabled:opacity-50" onClick={() => controller.retry(image.localId)}>Qayta urinish</button></p> : null}
    {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" disabled={busy || limited} onClick={() => inputRef.current?.click()}><ImagePlus className="size-4" />Rasm tanlash</Button>
      {image ? <Button type="button" variant="outline" disabled={busy} onClick={() => void controller.remove(image.localId)} aria-label="Tanlangan fon rasmini bekor qilish"><Trash2 className="size-4" />Bekor qilish</Button> : null}
      <Button type="button" disabled={busy || limited || image?.status !== 'ready'} onClick={() => void save()}>{update.isPending ? <Loader2 className="size-4 animate-spin" /> : null}Saqlash</Button>
      {appearance.backgroundUrl ? <Button type="button" variant="outline" disabled={busy || limited} onClick={() => void save(true)}><RotateCcw className="size-4" />Standart fonga qaytarish</Button> : null}
    </div>
  </div>
}
