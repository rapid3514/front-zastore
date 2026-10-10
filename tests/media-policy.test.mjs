import assert from 'node:assert/strict'
import test from 'node:test'
import {
  MEDIA_LIMITS,
  validateMediaFile,
  validateMediaSelection,
} from '../src/features/media/lib/media-policy.ts'

function file(type, size = 1) {
  return { type, size }
}

test('media policy rejects unsupported file types and oversized files', () => {
  assert.equal(
    validateMediaFile(file('image/gif'), 'IMAGE')?.code,
    'INVALID_IMAGE_TYPE',
  )
  assert.equal(
    validateMediaFile(file('video/mp4', MEDIA_LIMITS.videoMaxBytes + 1), 'VIDEO')?.code,
    'VIDEO_TOO_LARGE',
  )
  assert.equal(validateMediaFile(file('IMAGE/WEBP'), 'IMAGE'), null)
})

test('media policy limits images and videos independently', () => {
  const images = Array.from(
    { length: MEDIA_LIMITS.maxImages + 1 },
    () => file('image/jpeg'),
  )
  const imageResult = validateMediaSelection(images, 'IMAGE', { images: 0, videos: 0 })

  assert.equal(imageResult.acceptedFiles.length, MEDIA_LIMITS.maxImages)
  assert.equal(imageResult.rejectedFiles[0]?.reason.code, 'IMAGE_COUNT_EXCEEDED')

  const videoResult = validateMediaSelection(
    [file('video/mp4')],
    'VIDEO',
    { images: 3, videos: MEDIA_LIMITS.maxVideos },
  )
  assert.equal(videoResult.acceptedFiles.length, 0)
  assert.equal(videoResult.rejectedFiles[0]?.reason.code, 'VIDEO_COUNT_EXCEEDED')
})
