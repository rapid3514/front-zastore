export const MEDIA_LIMITS = {
  imageMaxBytes: 5 * 1024 * 1024,
  videoMaxBytes: 150 * 1024 * 1024,
  maxImages: 5,
  maxVideos: 1,
  uploadConcurrency: 1,
} as const

export const MEDIA_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  video: ['video/mp4', 'video/quicktime', 'video/webm'],
} as const

export const MEDIA_ACCEPT = {
  image: MEDIA_MIME_TYPES.image.join(','),
  video: MEDIA_MIME_TYPES.video.join(','),
} as const

export type MediaPolicyType = 'IMAGE' | 'VIDEO'

export type MediaRejectionCode =
  | 'INVALID_IMAGE_TYPE'
  | 'INVALID_VIDEO_TYPE'
  | 'IMAGE_TOO_LARGE'
  | 'VIDEO_TOO_LARGE'
  | 'IMAGE_COUNT_EXCEEDED'
  | 'VIDEO_COUNT_EXCEEDED'
  | 'PREVIEW_UNAVAILABLE'

export interface MediaRejectionReason {
  code: MediaRejectionCode
  message: string
}

export interface RejectedMediaFile {
  file: File
  reason: MediaRejectionReason
}

export interface MediaSelectionResult {
  acceptedFiles: File[]
  rejectedFiles: RejectedMediaFile[]
}

export interface MediaCounts {
  images: number
  videos: number
}

const BYTES_PER_MEBIBYTE = 1024 * 1024

function maxSizeMegabytes(type: MediaPolicyType) {
  const bytes = type === 'IMAGE' ? MEDIA_LIMITS.imageMaxBytes : MEDIA_LIMITS.videoMaxBytes
  return bytes / BYTES_PER_MEBIBYTE
}

export function invalidTypeMessage(type: MediaPolicyType) {
  return type === 'IMAGE'
    ? 'Rasm formati noto‘g‘ri. Faqat JPEG, PNG, WebP yoki AVIF rasm tanlang.'
    : 'Video formati noto‘g‘ri. Faqat MP4, MOV yoki WebM video tanlang.'
}

export function fileTooLargeMessage(type: MediaPolicyType) {
  return type === 'IMAGE'
    ? `Rasm hajmi maksimal ${maxSizeMegabytes(type)} MB bo‘lishi mumkin.`
    : `Video hajmi maksimal ${maxSizeMegabytes(type)} MB bo‘lishi mumkin.`
}

export function mediaCountMessage(type: MediaPolicyType) {
  return type === 'IMAGE'
    ? `Bir mahsulotga maksimal ${MEDIA_LIMITS.maxImages} ta rasm qo‘shish mumkin.`
    : `Bir mahsulotga maksimal ${MEDIA_LIMITS.maxVideos} ta video qo‘shish mumkin.`
}

export function validateMediaFile(file: File, type: MediaPolicyType): MediaRejectionReason | null {
  const allowedTypes: readonly string[] = type === 'IMAGE' ? MEDIA_MIME_TYPES.image : MEDIA_MIME_TYPES.video
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      code: type === 'IMAGE' ? 'INVALID_IMAGE_TYPE' : 'INVALID_VIDEO_TYPE',
      message: invalidTypeMessage(type),
    }
  }

  const maxBytes = type === 'IMAGE' ? MEDIA_LIMITS.imageMaxBytes : MEDIA_LIMITS.videoMaxBytes
  if (file.size > maxBytes) {
    return {
      code: type === 'IMAGE' ? 'IMAGE_TOO_LARGE' : 'VIDEO_TOO_LARGE',
      message: fileTooLargeMessage(type),
    }
  }

  return null
}

export function validateMediaSelection(
  files: readonly File[],
  type: MediaPolicyType,
  counts: MediaCounts,
): MediaSelectionResult {
  const acceptedFiles: File[] = []
  const rejectedFiles: RejectedMediaFile[] = []
  let imageCount = counts.images
  let videoCount = counts.videos

  for (const file of files) {
    const fileError = validateMediaFile(file, type)
    if (fileError) {
      rejectedFiles.push({ file, reason: fileError })
      continue
    }

    const countExceeded = type === 'IMAGE'
      ? imageCount >= MEDIA_LIMITS.maxImages
      : videoCount >= MEDIA_LIMITS.maxVideos

    if (countExceeded) {
      rejectedFiles.push({
        file,
        reason: {
          code: type === 'IMAGE' ? 'IMAGE_COUNT_EXCEEDED' : 'VIDEO_COUNT_EXCEEDED',
          message: mediaCountMessage(type),
        },
      })
      continue
    }

    acceptedFiles.push(file)
    if (type === 'IMAGE') imageCount += 1
    else videoCount += 1
  }

  return { acceptedFiles, rejectedFiles }
}
