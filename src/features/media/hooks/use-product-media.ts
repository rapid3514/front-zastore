import { useCallback, useEffect, useRef, useState } from 'react'
import type { ProductMedia, ProductMediaType } from '@/features/catalog/api/products.api'
import { imageKitApi } from '../api/imagekit.api'
import {
  MEDIA_LIMITS,
  validateMediaSelection,
  type MediaSelectionResult,
  type RejectedMediaFile,
} from '../lib/media-policy'

export type MediaUploadStatus = 'queued' | 'uploading' | 'ready' | 'failed'

export interface DraftProductMedia {
  localId: string
  type: ProductMediaType
  file?: File
  previewUrl?: string
  fileId?: string
  url?: string
  position: number
  progress: number
  status: MediaUploadStatus
  isExisting: boolean
  error?: string
}

export interface ProductMediaController {
  media: DraftProductMedia[]
  appendFiles: (files: readonly File[], type: ProductMediaType) => MediaSelectionResult
  remove: (localId: string) => Promise<void>
  reorderImage: (localId: string, direction: -1 | 1) => void
  retry: (localId: string) => void
  cleanupUnassigned: () => Promise<void>
  release: () => void
  maxImages: number
  maxVideos: number
}

function createLocalId() {
  return crypto.randomUUID()
}

function asDraft(item: ProductMedia): DraftProductMedia {
  return {
    localId: item.id ?? `${item.fileId ?? item.type}-${item.type}-${item.position}`,
    type: item.type,
    fileId: item.fileId,
    url: item.url,
    previewUrl: item.url,
    position: item.position,
    progress: 100,
    status: 'ready',
    isExisting: true,
  }
}

function initialDraft(media: ProductMedia[]) {
  return [...media].sort((a, b) => (a.type === b.type ? a.position - b.position : a.type === 'IMAGE' ? -1 : 1)).map(asDraft)
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}

function uploadErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback
  if (/timeout|timed out|did not start/i.test(error.message)) {
    return 'Ulanish vaqti tugadi. Internetni tekshirib, qayta urinib ko\'ring.'
  }
  return fallback
}

export function useProductMedia(initialMedia: ProductMedia[], onCleanupIssue: () => void) {
  const [media, setMedia] = useState<DraftProductMedia[]>(() => initialDraft(initialMedia))
  const mediaRef = useRef(media)
  const activeRef = useRef(0)
  const controllersRef = useRef(new Map<string, AbortController>())
  const uploadsRef = useRef(new Set<Promise<void>>())
  const queueStoppedRef = useRef(false)
  const revokedPreviewUrlsRef = useRef(new Set<string>())

  const revokePreviewUrl = useCallback((url: string | undefined) => {
    if (!url?.startsWith('blob:') || revokedPreviewUrlsRef.current.has(url)) return
    revokedPreviewUrlsRef.current.add(url)
    URL.revokeObjectURL(url)
  }, [])

  const commitMedia = useCallback((change: (items: DraftProductMedia[]) => DraftProductMedia[]) => {
    const next = change(mediaRef.current)
    mediaRef.current = next
    setMedia(next)
  }, [])

  const normalizePositions = useCallback((items: DraftProductMedia[]) => {
    const images = items.filter((item) => item.type === 'IMAGE').map((item, index) => ({ ...item, position: index }))
    const videos = items.filter((item) => item.type === 'VIDEO').map((item, index) => ({ ...item, position: index }))
    return [...images, ...videos]
  }, [])

  const updateOne = useCallback((localId: string, change: (item: DraftProductMedia) => DraftProductMedia) => {
    commitMedia((items) => normalizePositions(items.map((item) => item.localId === localId ? change(item) : item)))
  }, [commitMedia, normalizePositions])

  const runQueueRef = useRef<() => void>(() => undefined)
  const runQueue = useCallback(() => {
    if (queueStoppedRef.current) return

    while (activeRef.current < MEDIA_LIMITS.uploadConcurrency) {
      const next = mediaRef.current.find((item) => item.status === 'queued' && item.file && !controllersRef.current.has(item.localId))
      if (!next?.file) return
      const controller = new AbortController()
      activeRef.current += 1
      controllersRef.current.set(next.localId, controller)
      updateOne(next.localId, (item) => ({ ...item, status: 'uploading', error: undefined, progress: 0 }))
      const upload = Promise.resolve().then(async () => {
        try {
          if (controller.signal.aborted) return
          let auth
          try {
            auth = await imageKitApi.getUploadAuth(controller.signal)
          } catch (error) {
            if (controller.signal.aborted) return
            updateOne(next.localId, (item) => ({
              ...item,
              status: 'failed',
              error: uploadErrorMessage(error, 'Media yuklashga ruxsat olinmadi.'),
            }))
            return
          }
          const uploaded = await imageKitApi.upload(next.file as File, next.type, auth, {
            signal: controller.signal,
            onProgress: (progress) => updateOne(next.localId, (item) => ({ ...item, progress })),
          })
          if (mediaRef.current.some((item) => item.localId === next.localId)) {
            updateOne(next.localId, (item) => ({ ...item, fileId: uploaded.fileId, url: uploaded.url, progress: 100, status: 'ready' }))
          } else {
            try {
              await imageKitApi.deleteUnassigned(uploaded.fileId)
            } catch {
              onCleanupIssue()
            }
          }
        } catch (error) {
          if (!isAbortError(error)) updateOne(next.localId, (item) => ({
            ...item,
            status: 'failed',
            error: uploadErrorMessage(error, 'Faylni yuklab bo‘lmadi.'),
          }))
        } finally {
          activeRef.current -= 1
          controllersRef.current.delete(next.localId)
          uploadsRef.current.delete(upload)
          queueMicrotask(runQueueRef.current)
        }
      })
      uploadsRef.current.add(upload)
    }
  }, [onCleanupIssue, updateOne])

  useEffect(() => {
    // StrictMode replays setup after cleanup; each setup must reopen the queue.
    queueStoppedRef.current = false
    const controllers = controllersRef.current
    return () => {
      queueStoppedRef.current = true
      controllers.forEach((controller) => controller.abort())
      mediaRef.current.forEach((item) => {
        revokePreviewUrl(item.previewUrl)
      })
    }
  }, [revokePreviewUrl])

  useEffect(() => {
    runQueueRef.current = runQueue
  }, [runQueue])

  useEffect(() => {
    runQueue()
  }, [media, runQueue])

  const appendFiles = useCallback((files: readonly File[], type: ProductMediaType): MediaSelectionResult => {
    const result = validateMediaSelection(files, type, {
      images: mediaRef.current.filter((item) => item.type === 'IMAGE').length,
      videos: mediaRef.current.filter((item) => item.type === 'VIDEO').length,
    })
    const rejectedFiles: RejectedMediaFile[] = [...result.rejectedFiles]
    const additions: DraftProductMedia[] = []
    const imageCount = mediaRef.current.filter((item) => item.type === 'IMAGE').length

    for (const file of result.acceptedFiles) {
      try {
        additions.push({
          localId: createLocalId(),
          type,
          file,
          previewUrl: URL.createObjectURL(file),
          position: type === 'IMAGE' ? imageCount + additions.length : 0,
          progress: 0,
          status: 'queued',
          isExisting: false,
        })
      } catch {
        rejectedFiles.push({
          file,
          reason: {
            code: 'PREVIEW_UNAVAILABLE',
            message: 'Fayl uchun xavfsiz preview yaratib bo‘lmadi.',
          },
        })
      }
    }

    if (additions.length) commitMedia((items) => normalizePositions([...items, ...additions]))

    return {
      acceptedFiles: additions.flatMap((item) => item.file ? [item.file] : []),
      rejectedFiles,
    }
  }, [commitMedia, normalizePositions])

  const retry = useCallback((localId: string) => updateOne(localId, (item) => item.status === 'failed'
    ? { ...item, status: 'queued', progress: 0, error: undefined }
    : item), [updateOne])

  const remove = useCallback(async (localId: string) => {
    const current = mediaRef.current.find((item) => item.localId === localId)
    if (!current) return
    controllersRef.current.get(localId)?.abort()
    revokePreviewUrl(current.previewUrl)
    commitMedia((items) => normalizePositions(items.filter((item) => item.localId !== localId)))
    if (!current.isExisting && current.fileId) {
      try {
        await imageKitApi.deleteUnassigned(current.fileId)
      } catch {
        onCleanupIssue()
      }
    }
  }, [commitMedia, normalizePositions, onCleanupIssue, revokePreviewUrl])

  const reorderImage = useCallback((localId: string, direction: -1 | 1) => {
    commitMedia((items) => {
      const imageIndexes = items.map((item, index) => item.type === 'IMAGE' ? index : -1).filter((index) => index >= 0)
      const currentIndex = items.findIndex((item) => item.localId === localId)
      const imagePosition = imageIndexes.indexOf(currentIndex)
      const targetIndex = imageIndexes[imagePosition + direction]
      if (targetIndex === undefined) return items
      const copy = [...items]
      ;[copy[currentIndex], copy[targetIndex]] = [copy[targetIndex], copy[currentIndex]]
      return normalizePositions(copy)
    })
  }, [commitMedia, normalizePositions])

  const cleanupUnassigned = useCallback(async () => {
    queueStoppedRef.current = true
    controllersRef.current.forEach((controller) => controller.abort())
    await Promise.allSettled([...uploadsRef.current])
    const items = mediaRef.current.filter((item) => !item.isExisting && item.fileId)
    await Promise.allSettled(items.map(async (item) => {
      try {
        await imageKitApi.deleteUnassigned(item.fileId as string)
      } catch {
        onCleanupIssue()
      }
    }))
  }, [onCleanupIssue])

  const release = useCallback(() => {
    queueStoppedRef.current = true
    mediaRef.current.forEach((item) => {
      revokePreviewUrl(item.previewUrl)
    })
  }, [revokePreviewUrl])

  return {
    media,
    appendFiles,
    remove,
    reorderImage,
    retry,
    cleanupUnassigned,
    release,
    maxImages: MEDIA_LIMITS.maxImages,
    maxVideos: MEDIA_LIMITS.maxVideos,
  } satisfies ProductMediaController
}
