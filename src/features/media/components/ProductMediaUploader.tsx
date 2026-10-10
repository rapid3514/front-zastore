import { useRef, type ChangeEvent } from 'react'
import { Check, ChevronDown, ChevronUp, ImagePlus, Loader2, RotateCcw, Trash2, TriangleAlert, Video } from 'lucide-react'
import type { ProductMediaController } from '../hooks/use-product-media'
import {
  MEDIA_ACCEPT,
  MEDIA_LIMITS,
  validateMediaSelection,
  type MediaSelectionResult,
} from '../lib/media-policy'
import { Button } from '@/components/ui/button'

interface ProductMediaUploaderProps {
  controller: ProductMediaController
  onError: (message: string) => void
  disabled?: boolean
}

function mediaFilename(item: ProductMediaController['media'][number]) {
  return item.file?.name ?? item.url?.split('/').pop() ?? 'Media fayl'
}

export function ProductMediaUploader({ controller, onError, disabled = false }: ProductMediaUploaderProps) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const images = controller.media.filter((item) => item.type === 'IMAGE')
  const video = controller.media.find((item) => item.type === 'VIDEO')

  function reportRejectedFiles(result: MediaSelectionResult) {
    const messages = [...new Set(result.rejectedFiles.map(({ reason }) => reason.message))]
    if (messages.length) onError(messages.join(' '))
  }

  function handleImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? [])
    event.currentTarget.value = ''
    if (!files.length) return
    reportRejectedFiles(controller.appendFiles(files, 'IMAGE'))
  }

  async function handleVideo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) return

    const validation = validateMediaSelection([file], 'VIDEO', { images: 0, videos: 0 })
    if (validation.rejectedFiles.length) {
      reportRejectedFiles(validation)
      return
    }

    if (video) await controller.remove(video.localId)
    reportRejectedFiles(controller.appendFiles([file], 'VIDEO'))
  }

  return (
    <section className="media-uploader sa-glass rounded-2xl p-4" aria-label="Mahsulot media fayllari">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h3 className="font-extrabold text-slate-950">Mahsulot rasmlari</h3><p className="mt-1 text-xs text-slate-500">Birinchi rasm asosiy bo‘ladi. Har biri ko‘pi bilan {MEDIA_LIMITS.imageMaxBytes / 1024 / 1024} MB. {images.length}/{controller.maxImages}</p></div>
        <input ref={imageInputRef} type="file" accept={MEDIA_ACCEPT.image} multiple disabled={disabled} className="sr-only" onChange={handleImages} />
        <Button type="button" variant="outline" disabled={disabled || images.length >= controller.maxImages} onClick={() => imageInputRef.current?.click()}><ImagePlus className="size-4" />Rasm tanlash</Button>
      </div>

      <div className="media-upload-grid mt-4">
        {images.map((item, index) => (
          <article key={item.localId} className="media-preview-card">
            <div className="relative overflow-hidden rounded-xl bg-white/60 aspect-square">
              {item.previewUrl ? <img src={item.previewUrl} alt={mediaFilename(item)} loading="lazy" decoding="async" className="size-full object-cover" /> : null}
              {index === 0 ? <span className="media-primary-badge">Asosiy rasm</span> : null}
              <button type="button" className="media-remove" onClick={() => void controller.remove(item.localId)} aria-label={`${mediaFilename(item)}ni olib tashlash`}><Trash2 className="size-4" /></button>
            </div>
            <p className="mt-2 truncate text-xs font-bold text-slate-700">{mediaFilename(item)}</p>
            <MediaStatus item={item} onRetry={() => controller.retry(item.localId)} />
            <div className="mt-2 flex gap-2"><Button type="button" variant="outline" className="min-h-9 flex-1 px-2" disabled={index === 0} onClick={() => controller.reorderImage(item.localId, -1)} aria-label="Rasmni yuqoriga surish"><ChevronUp className="size-4" />Yuqori</Button><Button type="button" variant="outline" className="min-h-9 flex-1 px-2" disabled={index === images.length - 1} onClick={() => controller.reorderImage(item.localId, 1)} aria-label="Rasmni pastga surish"><ChevronDown className="size-4" />Past</Button></div>
          </article>
        ))}
        {!images.length ? <button type="button" onClick={() => imageInputRef.current?.click()} className="media-upload-empty"><ImagePlus className="size-6" /><span>Rasmlarni tanlang</span></button> : null}
      </div>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-3 border-t border-white/70 pt-4">
        <div><h3 className="font-extrabold text-slate-950">Video</h3><p className="mt-1 text-xs text-slate-500">Ixtiyoriy, faqat bitta va ko‘pi bilan {MEDIA_LIMITS.videoMaxBytes / 1024 / 1024} MB video.</p></div>
        <input ref={videoInputRef} type="file" accept={MEDIA_ACCEPT.video} className="sr-only" disabled={disabled} onChange={(event) => void handleVideo(event)} />
        <Button type="button" variant="outline" disabled={disabled} onClick={() => videoInputRef.current?.click()}><Video className="size-4" />{video ? 'Video almashtirish' : 'Video tanlash'}</Button>
      </div>
      {video ? <article className="media-video-card mt-3"><video src={video.previewUrl} controls playsInline preload="metadata" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-700">{mediaFilename(video)}</p><MediaStatus item={video} onRetry={() => controller.retry(video.localId)} /></div><Button type="button" variant="outline" className="shrink-0 text-red-600" onClick={() => void controller.remove(video.localId)} aria-label="Videoni olib tashlash"><Trash2 className="size-4" /></Button></article> : null}
    </section>
  )
}

function MediaStatus({ item, onRetry }: { item: ProductMediaController['media'][number]; onRetry: () => void }) {
  if (item.status === 'queued') return <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-amber-700"><Loader2 className="size-3 animate-spin" />Yuklash navbatida...</p>
  if (item.status === 'uploading') return <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-amber-700"><Loader2 className="size-3 animate-spin" />Yuklanmoqda... {item.progress}%</p>
  if (item.status === 'failed') return <div className="mt-1 flex flex-wrap items-center gap-1 text-xs font-semibold text-red-600"><TriangleAlert className="size-3" />{item.error ?? 'Fayl yuklanmadi.'} <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 underline"><RotateCcw className="size-3" />Qayta urinish</button></div>
  return <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-700"><Check className="size-3" />Tayyor</p>
}
