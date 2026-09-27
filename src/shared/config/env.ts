import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.union([
    z.string().url(),
    z.string().regex(/^\/(?!\/)[^?#]*$/, 'VITE_API_URL must be an absolute URL or a root-relative path.'),
  ]),
})

const parsedEnv = envSchema.safeParse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
})

if (!parsedEnv.success) {
  const message = `Frontend environment is invalid: ${parsedEnv.error.issues.map((issue) => issue.message).join(' ')}`

  if (import.meta.env.DEV) {
    throw new Error(message)
  }

  throw new Error('Frontend configuration is unavailable.')
}

export const env = parsedEnv.data
