import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { registerHooks } from 'node:module'
import test from 'node:test'
import { StrictMode, act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { JSDOM } from 'jsdom'
import ts from 'typescript'

const state = {
  auth: { status: 'authenticated', user: { role: 'ADMIN' } },
  backgrounds: { bot: { backgroundUrl: 'https://images.example/store.jpg' }, 'super-admin': undefined },
  requested: null,
}
globalThis.__appearanceScopeTest = state
const componentUrl = new URL('../src/features/appearance/components/BotAppearanceSync.tsx', import.meta.url).href
const loader = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL === componentUrl && specifier === '@/features/auth/model/auth.store') {
      return { url: 'data:text/javascript,export const useAuthStore = (select) => select(globalThis.__appearanceScopeTest.auth)', shortCircuit: true }
    }
    if (context.parentURL === componentUrl && specifier === '../hooks/use-bot-appearance') {
      return { url: 'data:text/javascript,export function useBotAppearance(scope, enabled) { const state = globalThis.__appearanceScopeTest; state.requested = { scope, enabled }; return { data: state.backgrounds[scope] } }', shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (url === componentUrl) {
      return { format: 'module', source: ts.transpileModule(readFileSync(new URL(url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText, shortCircuit: true }
    }
    return nextLoad(url, context)
  },
})
const { BotAppearanceSync } = await import(componentUrl)
loader.deregister()

test('role changes and resets keep the super admin background separate from the store background', async () => {
  const dom = new JSDOM('<div id="root"></div>')
  const keys = ['window', 'document', 'IS_REACT_ACT_ENVIRONMENT']
  const previous = keys.map((key) => Object.getOwnPropertyDescriptor(globalThis, key))
  Object.defineProperties(globalThis, {
    window: { configurable: true, value: dom.window },
    document: { configurable: true, value: dom.window.document },
    IS_REACT_ACT_ENVIRONMENT: { configurable: true, value: true },
  })
  const root = createRoot(document.getElementById('root'))
  const render = () => act(async () => root.render(createElement(StrictMode, null, createElement(BotAppearanceSync))))
  const background = () => document.documentElement.style.getPropertyValue('--bot-background-image')
  try {
    await render()
    assert.match(background(), /store\.jpg/)
    state.auth.user.role = 'SUPER_ADMIN'
    await render()
    assert.deepEqual(state.requested, { scope: 'super-admin', enabled: true })
    assert.equal(background(), '', 'A pending private query must clear the previous store background')
    state.backgrounds['super-admin'] = { backgroundUrl: 'https://images.example/private.jpg' }
    await render()
    assert.match(background(), /private\.jpg/)
    state.backgrounds.bot = { backgroundUrl: 'https://images.example/store-new.jpg' }
    await render()
    assert.match(background(), /private\.jpg/, 'An admin update must not change the super admin background')
    state.backgrounds['super-admin'] = { backgroundUrl: null }
    await render()
    assert.equal(background(), '', 'Resetting the private background must use the default, not the store image')
    state.auth = { status: 'unauthenticated', user: null }
    await render()
    assert.match(background(), /store-new\.jpg/)
    state.auth.status = 'loading'
    await render()
    assert.equal(state.requested.enabled, false)
    assert.equal(background(), '', 'Authentication bootstrap must not briefly show the wrong background')
  } finally {
    await act(async () => root.unmount())
    dom.window.close()
    keys.forEach((key, index) => {
      if (previous[index]) Object.defineProperty(globalThis, key, previous[index])
      else delete globalThis[key]
    })
    delete globalThis.__appearanceScopeTest
  }
})
