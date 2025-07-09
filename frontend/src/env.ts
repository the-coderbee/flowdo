import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:5000'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('FlowDo'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
})

function getEnvVar(key: string): string | undefined {
  if (typeof window !== 'undefined') {
    return undefined
  }
  return process.env[key]
}

function getClientEnvVar(key: string): string | undefined {
  if (typeof window !== 'undefined') {
    return (window as any).__ENV__?.[key]
  }
  return process.env[key]
}

const rawEnv = {
  NODE_ENV: getEnvVar('NODE_ENV') || getClientEnvVar('NODE_ENV'),
  NEXT_PUBLIC_API_URL: getClientEnvVar('NEXT_PUBLIC_API_URL'),
  NEXT_PUBLIC_APP_URL: getClientEnvVar('NEXT_PUBLIC_APP_URL'),
  NEXT_PUBLIC_APP_NAME: getClientEnvVar('NEXT_PUBLIC_APP_NAME'),
  NEXT_PUBLIC_APP_VERSION: getClientEnvVar('NEXT_PUBLIC_APP_VERSION'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: getClientEnvVar('NEXT_PUBLIC_ENABLE_ANALYTICS'),
  NEXT_PUBLIC_SENTRY_DSN: getClientEnvVar('NEXT_PUBLIC_SENTRY_DSN'),
  NEXT_PUBLIC_POSTHOG_KEY: getClientEnvVar('NEXT_PUBLIC_POSTHOG_KEY'),
  NEXT_PUBLIC_POSTHOG_HOST: getClientEnvVar('NEXT_PUBLIC_POSTHOG_HOST'),
}

let env: z.infer<typeof envSchema>

try {
  env = envSchema.parse(rawEnv)
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Environment validation failed:', error.format())
    throw new Error('Invalid environment configuration')
  }
  throw error
}

export { env }

export const isProd = env.NODE_ENV === 'production'
export const isDev = env.NODE_ENV === 'development'
export const isTest = env.NODE_ENV === 'test'

export const config = {
  app: {
    name: env.NEXT_PUBLIC_APP_NAME,
    version: env.NEXT_PUBLIC_APP_VERSION,
    url: env.NEXT_PUBLIC_APP_URL,
  },
  api: {
    baseUrl: env.NEXT_PUBLIC_API_URL,
  },
  analytics: {
    enabled: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    sentry: {
      dsn: env.NEXT_PUBLIC_SENTRY_DSN,
    },
    posthog: {
      key: env.NEXT_PUBLIC_POSTHOG_KEY,
      host: env.NEXT_PUBLIC_POSTHOG_HOST,
    },
  },
  features: {
    enableDebugMode: isDev,
    enableErrorBoundary: true,
    enableServiceWorker: isProd,
  },
} as const

export type Config = typeof config

export function validateEnv() {
  return envSchema.safeParse(rawEnv)
}

export default env