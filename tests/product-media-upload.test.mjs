import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import test from 'node:test'
import { StrictMode, act, createElement, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { JSDOM } from 'jsdom'

const mediaApi = {}
globalThis.__productMediaTestApi = mediaApi
const hookUrl = new URL('../src/features/media/hooks/use-product-media.ts', import.meta.url).href
const loader = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL === hookUrl) {
      if (specifier === '../api/imagekit.api') {
        return {
          url: 'data:text/javascript,export const imageKitApi = globalThis.__productMediaTestApi',
          shortCircuit: true,
        }
      }
      if (specifier === '../lib/media-policy') {
        return {
          url: new URL('../src/features/media/lib/media-policy.ts', import.meta.url).href,
          shortCircuit: true,
        }
      }
    }
    return nextResolve(specifier, context)
  },
})
const { useProductMedia } = await import(hookUrl)
loader.deregister()
delete globalThis.__productMediaTestApi

async function withUploadForm(run) {
  const dom = new JSDOM('<div id="root"></div>')
  const globals = ['window', 'document', 'IS_REACT_ACT_ENVIRONMENT']
  const previous = globals.map((key) => Object.getOwnPropertyDescriptor(globalThis, key))
  Object.defineProperties(globalThis, {
    window: { configurable: true, value: dom.window },
    document: { configurable: true, value: dom.window.document },
    IS_REACT_ACT_ENVIRONMENT: { configurable: true, value: true },
  })

  let controller
  let effectSetups = 0
  const onCleanupIssue = () => assert.fail('Unexpected media cleanup failure')
  function Form() {
    const value = useProductMedia([], onCleanupIssue)
    useEffect(() => { controller = value }, [value])
    useEffect(() => { effectSetups += 1 }, [])
    return null
  }

  const root = createRoot(dom.window.document.getElementById('root'))
  let mounted = true
  async function unmount() {
    if (!mounted) return
    mounted = false
    await act(async () => root.unmount())
  }
  try {
    await act(async () => root.render(createElement(StrictMode, null, createElement(Form))))
    assert.equal(effectSetups, 2, 'Regression must run with StrictMode effect replay')
    await run(() => controller, unmount)
  } finally {
    await unmount()
    dom.window.close()
    globals.forEach((key, index) => {
      if (previous[index]) Object.defineProperty(globalThis, key, previous[index])
      else delete globalThis[key]
    })
  }
}

const file = () => new File(['image'], 'product.png', { type: 'image/png' })
const uploaded = { fileId: 'image-1', url: 'https://ik.imagekit.io/shop/product.png' }

test('a selected image reaches ready after StrictMode effect replay', async () => {
  let authCalls = 0
  let uploadCalls = 0
  mediaApi.getUploadAuth = async () => { authCalls += 1; return {} }
  mediaApi.upload = async (_file, _type, _auth, { onProgress }) => {
    uploadCalls += 1
    onProgress(50)
    return uploaded
  }

  await withUploadForm(async (current) => {
    await act(async () => { current().appendFiles([file()], 'IMAGE') })
    assert.equal(authCalls, 1, 'The upload auth request must actually start')
    assert.equal(uploadCalls, 1)
    assert.equal(current().media[0].status, 'ready')
    assert.equal(current().media[0].progress, 100)
    assert.equal(current().media[0].fileId, uploaded.fileId)
  })
})

test('a failed upload can be retried and completed', async () => {
  let attempts = 0
  mediaApi.getUploadAuth = async () => ({})
  mediaApi.upload = async () => {
    attempts += 1
    if (attempts === 1) throw new Error('ImageKit upload failed.')
    return uploaded
  }

  await withUploadForm(async (current) => {
    await act(async () => { current().appendFiles([file()], 'IMAGE') })
    assert.equal(current().media[0].status, 'failed')
    await act(async () => { current().retry(current().media[0].localId) })
    assert.equal(attempts, 2)
    assert.equal(current().media[0].status, 'ready')
  })
})

test('closing the form aborts an in-flight upload', async () => {
  let uploadSignal
  mediaApi.getUploadAuth = async () => ({})
  mediaApi.upload = (_file, _type, _auth, { signal }) => {
    uploadSignal = signal
    return new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
    })
  }

  await withUploadForm(async (current, unmount) => {
    await act(async () => { current().appendFiles([file()], 'IMAGE') })
    assert.equal(current().media[0].status, 'uploading')
    assert.ok(uploadSignal)
    await unmount()
    assert.equal(uploadSignal.aborted, true)
  })
})
