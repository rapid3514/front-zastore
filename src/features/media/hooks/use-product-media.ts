import { useCallback, useEffect, useRef, useState } from 'react'
import type { ProductMedia, ProductMediaType } from '@/features/catalog/api/products.api'
import { imageKitApi } from '../api/imagekit.api'

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
  appendFiles: (files: File[], type: ProductMediaType) => boolean
  remove: (localId: string) => Promise<void>
  reorderImage: (localId: string, direction: -1 | 1) => void
  retry: (localId: string) => void
  cleanupUnassigned: () => Promise<void>
  release: () => void
  maxImages: number
}

const MAX_IMAGES = 5
const MAX_CONCURRENT_UPLOADS = 2

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

export function useProductMedia(initialMedia: ProductMedia[], onCleanupIssue: () => void) {
  const [media, setMedia] = useState<DraftProductMedia[]>(() => initialDraft(initialMedia))
  const mediaRef = useRef(media)
  const activeRef = useRef(0)
  const controllersRef = useRef(new Map<string, AbortController>())
  const uploadsRef = useRef(new Set<Promise<void>>())

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
    while (activeRef.current < MAX_CONCURRENT_UPLOADS) {
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
          } catch {
            if (controller.signal.aborted) return
            updateOne(next.localId, (item) => ({ ...item, status: 'failed', error: 'Media yuklashga ruxsat olinmadi.' }))
            return
          }
          const uploaded = await imageKitApi.upload(next.file as File, auth, {
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
          if (!isAbortError(error)) updateOne(next.localId, (item) => ({ ...item, status: 'failed', error: 'Faylni yuklab bo‘lmadi.' }))
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
    runQueueRef.current = runQueue
  }, [runQueue])

  useEffect(() => {
    runQueue()
  }, [media, runQueue])

  const appendFiles = useCallback((files: File[], type: ProductMediaType) => {
    const available = type === 'IMAGE' ? Math.max(0, MAX_IMAGES - mediaRef.current.filter((item) => item.type === 'IMAGE').length) : 1
    const accepted = files.slice(0, available)
    if (!accepted.length) return false
    const additions = accepted.map((file, index): DraftProductMedia => ({
      localId: createLocalId(),
      type,
      file,
      previewUrl: URL.createObjectURL(file),
      position: type === 'IMAGE' ? mediaRef.current.filter((item) => item.type === 'IMAGE').length + index : 0,
      progress: 0,
      status: 'queued',
      isExisting: false,
    }))
    commitMedia((items) => normalizePositions([...items, ...additions]))
    return accepted.length === files.length
  }, [commitMedia, normalizePositions])

  const retry = useCallback((localId: string) => updateOne(localId, (item) => ({ ...item, status: 'queued', progress: 0, error: undefined })), [updateOne])

  const remove = useCallback(async (localId: string) => {
    const current = mediaRef.current.find((item) => item.localId === localId)
    if (!current) return
    controllersRef.current.get(localId)?.abort()
    if (current.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(current.previewUrl)
    commitMedia((items) => normalizePositions(items.filter((item) => item.localId !== localId)))
    if (!current.isExisting && current.fileId) {
      try {
        await imageKitApi.deleteUnassigned(current.fileId)
      } catch {
        onCleanupIssue()
      }
    }
  }, [commitMedia, normalizePositions, onCleanupIssue])

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
    mediaRef.current.forEach((item) => {
      if (item.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(item.previewUrl)
    })
  }, [])

  useEffect(() => () => {
    controllersRef.current.forEach((controller) => controller.abort())
    mediaRef.current.forEach((item) => {
      if (item.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(item.previewUrl)
    })
  }, [])

  return { media, appendFiles, remove, reorderImage, retry, cleanupUnassigned, release, maxImages: MAX_IMAGES } satisfies ProductMediaController
}
