import assert from 'node:assert/strict'
import test from 'node:test'
import viteConfig, { getExactDevAllowedHost } from '../vite.config.ts'

test('an exact development hostname is accepted and normalized', () => {
  assert.equal(
    getExactDevAllowedHost('  Demo-123.trycloudflare.com  '),
    'demo-123.trycloudflare.com',
  )
})

test('wildcards, origins, ports, and paths are rejected', () => {
  const invalidHosts = [
    '.trycloudflare.com',
    '*.trycloudflare.com',
    'https://demo.trycloudflare.com',
    'demo.trycloudflare.com:443',
    'demo.trycloudflare.com/path',
  ]

  for (const host of invalidHosts) {
    assert.throws(() => getExactDevAllowedHost(host))
  }
})

test('an unset development hostname keeps the default local-only policy', () => {
  assert.equal(getExactDevAllowedHost(undefined), undefined)
  assert.equal(getExactDevAllowedHost('   '), undefined)
})

test('the development server binds locally and allows only the configured tunnel host', () => {
  const previousHost = process.env.VITE_DEV_ALLOWED_HOST
  process.env.VITE_DEV_ALLOWED_HOST = 'demo.trycloudflare.com'

  try {
    const config = viteConfig({
      command: 'serve',
      mode: 'development',
      isPreview: false,
      isSsrBuild: false,
    })

    assert.equal(config.server?.host, '127.0.0.1')
    assert.deepEqual(config.server?.allowedHosts, ['demo.trycloudflare.com'])
    assert.equal(config.server?.proxy?.['/api/v1']?.target, 'http://127.0.0.1:3001')
    assert.equal(config.server?.proxy?.['/health']?.target, 'http://127.0.0.1:3001')
    assert.equal(config.preview?.host, '127.0.0.1')
    assert.deepEqual(config.preview?.allowedHosts, [])
  } finally {
    if (previousHost === undefined) delete process.env.VITE_DEV_ALLOWED_HOST
    else process.env.VITE_DEV_ALLOWED_HOST = previousHost
  }
})
