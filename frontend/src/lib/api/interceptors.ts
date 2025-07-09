import { TokenCleanup } from '@/lib/auth/token-cleanup'
import type { ApiError } from './types'

export interface RequestInterceptor {
  (config: RequestInit, url: string): RequestInit | Promise<RequestInit>
}

export interface ResponseInterceptor {
  (response: Response, url: string): Response | Promise<Response>
}

export interface ErrorInterceptor {
  (error: ApiError, url: string): never | Promise<never>
}

class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []

  addRequestInterceptor(interceptor: RequestInterceptor): () => void {
    this.requestInterceptors.push(interceptor)
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor)
      if (index > -1) {
        this.requestInterceptors.splice(index, 1)
      }
    }
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): () => void {
    this.responseInterceptors.push(interceptor)
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor)
      if (index > -1) {
        this.responseInterceptors.splice(index, 1)
      }
    }
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): () => void {
    this.errorInterceptors.push(interceptor)
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor)
      if (index > -1) {
        this.errorInterceptors.splice(index, 1)
      }
    }
  }

  async processRequest(config: RequestInit, url: string): Promise<RequestInit> {
    let processedConfig = config
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig, url)
    }
    return processedConfig
  }

  async processResponse(response: Response, url: string): Promise<Response> {
    let processedResponse = response
    for (const interceptor of this.responseInterceptors) {
      processedResponse = await interceptor(processedResponse, url)
    }
    return processedResponse
  }

  async processError(error: ApiError, url: string): Promise<never> {
    for (const interceptor of this.errorInterceptors) {
      await interceptor(error, url)
    }
    throw error
  }
}

export const interceptorManager = new InterceptorManager()

// Default request interceptor for auth headers
interceptorManager.addRequestInterceptor((config, url) => {
  const headers = new Headers(config.headers)
  
  // Add CSRF token for non-GET requests
  if (config.method && config.method !== 'GET') {
    const isRefreshRequest = url.includes('/refresh')
    const csrfToken = getCsrfToken(isRefreshRequest ? 'refresh' : 'access')
    if (csrfToken) {
      headers.set('X-CSRF-Token', csrfToken)
    }
  }

  return {
    ...config,
    headers,
    credentials: 'include' as RequestCredentials
  }
})

// Default response interceptor for error handling
interceptorManager.addResponseInterceptor((response, url) => {
  if (response.status === 401 || response.status === 403) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:unauthorized'))
    }
  }
  return response
})

// Default error interceptor for network errors
interceptorManager.addErrorInterceptor((error, url) => {
  if (error.status === 401) {
    const result = TokenCleanup.cleanupUnauthorized()
    if (typeof window !== 'undefined' && !url.includes('/auth/') && result.redirect) {
      window.location.href = result.redirect
    }
  } else if (error.status === 403) {
    const result = TokenCleanup.cleanupInvalidTokens()
    if (typeof window !== 'undefined' && !url.includes('/auth/') && result.redirect) {
      window.location.href = result.redirect
    }
  }
  
  // Log errors in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', {
      url,
      message: error.message || 'Unknown error',
      status: error.status || 0,
      errors: error.errors || {},
      tokensCleanedUp: error.status === 401 || error.status === 403,
      timestamp: new Date().toISOString()
    })
  }
  
  throw error
})

function getCsrfToken(tokenType: 'access' | 'refresh' = 'access'): string | null {
  if (typeof window === 'undefined') return null

  const cookies = document.cookie.split(';')
  const csrfCookieName = tokenType === 'refresh' ? 'csrf_refresh_token' : 'csrf_access_token'

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === csrfCookieName) {
      return value
    }
  }
  return null
}

export { getCsrfToken }