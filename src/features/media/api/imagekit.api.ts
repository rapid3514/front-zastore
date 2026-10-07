import { z } from 'zod'
import { api } from '@/shared/api/api'

const uploadAuthSchema = z.object({
  token: z.string(),
  signature: z.string(),
  expire: z.union([z.string(), z.number()]),
  publicKey: z.string(),
  urlEndpoint: z.string().url(),
  folder: z.string().optional(),
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
    const { data } = await api.get<unknown>('/media/imagekit/upload-auth', { signal })
    return uploadAuthSchema.parse(data)
  },

  async deleteUnassigned(fileId: string): Promise<void> {
    await api.delete(`/media/imagekit/${encodeURIComponent(fileId)}`)
  },

  upload(file: File, auth: ImageKitUploadAuth, { onProgress, signal }: UploadOptions): Promise<ImageKitUploadResponse> {
    return new Promise((resolve, reject) => {
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

      const abort = () => request.abort()
      signal?.addEventListener('abort', abort, { once: true })
      request.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
      })
      request.addEventListener('load', () => {
        signal?.removeEventListener('abort', abort)
        if (request.status < 200 || request.status >= 300) {
          reject(new Error('ImageKit upload failed.'))
          return
        }
        try {
          resolve(uploadResponseSchema.parse(JSON.parse(request.responseText) as unknown))
        } catch {
          reject(new Error('ImageKit upload response is invalid.'))
        }
      })
      request.addEventListener('error', () => reject(new Error('ImageKit upload failed.')))
      request.addEventListener('abort', () => reject(new DOMException('Upload aborted.', 'AbortError')))
      request.open('POST', 'https://upload.imagekit.io/api/v1/files/upload')
      request.send(form)
    })
  },
}
