import { z } from 'zod'
import { api } from '@/shared/api/api'
import type { ProductMediaType } from '@/features/catalog/api/products.api'
import { MEDIA_LIMITS, validateMediaFile } from '../lib/media-policy'

const UPLOAD_AUTH_TIMEOUT_MS = 15_000
const UPLOAD_START_TIMEOUT_MS = 30_000
const IMAGE_UPLOAD_TIMEOUT_MS = 2 * 60_000
const VIDEO_UPLOAD_TIMEOUT_MS = 20 * 60_000

const uploadAuthSchema = z.object({
  token: z.string(),
  signature: z.string(),
  expire: z.union([z.string(), z.number()]),
  publicKey: z.string(),
  urlEndpoint: z.string().url(),
  folder: z.string().optional(),
  limits: z.object({
    maxImageBytes: z.number().int().positive(),
    maxVideoBytes: z.number().int().positive(),
  }).optional(),
})

const uploadResponseSchema = z.object({
  fileId: z.string(),
  url: z.string().url(),
  name: z.string(),
  fileType: z.string().optional(),
})

export type ImageKitUploadAuth = z.infer<typeof uploadAuthSchema>
export type ImageKitUploadResponse = z.infer<typeof uploadResponseSchema>

interface UploadOptions {
  onProgress: (progress: number) => void
  signal?: AbortSignal
}

export const imageKitApi = {
  async getUploadAuth(signal?: AbortSignal): Promise<ImageKitUploadAuth> {
    const { data } = await api.get<unknown>('/media/imagekit/upload-auth', {
      signal,
      timeout: UPLOAD_AUTH_TIMEOUT_MS,
    })
    return uploadAuthSchema.parse(data)
  },

  async deleteUnassigned(fileId: string): Promise<void> {
    await api.delete(`/media/imagekit/${encodeURIComponent(fileId)}`)
  },

  upload(file: File, type: ProductMediaType, auth: ImageKitUploadAuth, { onProgress, signal }: UploadOptions): Promise<ImageKitUploadResponse> {
    return new Promise((resolve, reject) => {
      const validationError = validateMediaFile(file, type)
      if (validationError) {
        reject(new Error(validationError.message))
        return
      }
      if (auth.limits && (
        auth.limits.maxImageBytes !== MEDIA_LIMITS.imageMaxBytes
        || auth.limits.maxVideoBytes !== MEDIA_LIMITS.videoMaxBytes
      )) {
        reject(new Error('Frontend va server media limitlari mos emas.'))
        return
      }
      if (signal?.aborted) {
        reject(new DOMException('Upload aborted.', 'AbortError'))
        return
      }
      const request = new XMLHttpRequest()
      const form = new FormData()
      form.append('file', file)
      form.append('fileName', file.name)
      form.append('token', auth.token)
      form.append('signature', auth.signature)
      form.append('expire', String(auth.expire))
      form.append('publicKey', auth.publicKey)
      if (auth.folder) form.append('folder', auth.folder)

      let settled = false
      let uploadStarted = false
      let uploadStartTimer: number | undefined
      const cleanup = () => {
        signal?.removeEventListener('abort', abort)
        if (uploadStartTimer !== undefined) window.clearTimeout(uploadStartTimer)
      }
      const fail = (error: Error) => {
        if (settled) return
        settled = true
        cleanup()
        reject(error)
      }
      const succeed = (response: ImageKitUploadResponse) => {
        if (settled) return
        settled = true
        cleanup()
        resolve(response)
      }
      const abort = () => {
        request.abort()
        fail(new DOMException('Upload aborted.', 'AbortError'))
      }
      signal?.addEventListener('abort', abort, { once: true })
      request.upload.addEventListener('progress', (event) => {
        if (!uploadStarted && event.loaded > 0) {
          uploadStarted = true
          if (uploadStartTimer !== undefined) window.clearTimeout(uploadStartTimer)
        }
        if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
      })
      request.addEventListener('load', () => {
        if (request.status < 200 || request.status >= 300) {
          fail(new Error('ImageKit upload failed.'))
          return
        }
        try {
          succeed(uploadResponseSchema.parse(JSON.parse(request.responseText) as unknown))
        } catch {
          fail(new Error('ImageKit upload response is invalid.'))
        }
      })
      request.addEventListener('error', () => fail(new Error('ImageKit upload failed.')))
      request.addEventListener('abort', () => fail(new DOMException('Upload aborted.', 'AbortError')))
      request.addEventListener('timeout', () => fail(new Error('ImageKit upload timed out.')))
      request.open('POST', 'https://upload.imagekit.io/api/v1/files/upload')
      request.timeout = type === 'VIDEO' ? VIDEO_UPLOAD_TIMEOUT_MS : IMAGE_UPLOAD_TIMEOUT_MS
      uploadStartTimer = window.setTimeout(() => {
        if (uploadStarted) return
        fail(new Error('ImageKit upload did not start.'))
        request.abort()
      }, UPLOAD_START_TIMEOUT_MS)
      request.send(form)
    })
  },
}
