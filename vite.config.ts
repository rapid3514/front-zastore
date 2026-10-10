
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

const hostnameLabel =
  '[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?'

const exactHostnamePattern = new RegExp(
  `^(?=.{1,253}$)${hostnameLabel}(?:\\.${hostnameLabel})*$`,
  'i',
)

export function getExactDevAllowedHost(
  value: string | undefined,
) {
  const host = value?.trim().toLowerCase()

  if (!host) return undefined

  if (
    !exactHostnamePattern.test(host) ||
    host.includes('..') ||
    host.includes('*')
  ) {
    throw new Error(
      'VITE_DEV_ALLOWED_HOST must be one exact hostname.',
    )
  }

  return host
}

export default defineConfig(({ command, isPreview, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const isDevelopmentServer = command === 'serve' && !isPreview

  const allowedHost =
    isDevelopmentServer
      ? getExactDevAllowedHost(env.VITE_DEV_ALLOWED_HOST)
      : undefined

  const allowedHosts = allowedHost ? [allowedHost] : []

  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      allowedHosts,
      ...(isDevelopmentServer
        ? {
            proxy: {
              '/api/v1': {
                target: 'http://127.0.0.1:3001',
                changeOrigin: true,
              },
              '/health': {
                target: 'http://127.0.0.1:3001',
                changeOrigin: true,
              },
            },
          }
        : {}),
      ...(isDevelopmentServer && allowedHost
        ? {
            hmr: {
              protocol: 'wss' as const,
              clientPort: 443,
            },
          }
        : {}),
    },

    preview: {
      host: '127.0.0.1',
      port: 4173,
      strictPort: true,
      allowedHosts: [],
    },
  }
})
