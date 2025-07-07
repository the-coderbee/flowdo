import { ApiError } from "@/types/auth"

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

class ApiClient {
  private baseURL: string
  private ongoingRequests: Map<string, Promise<unknown>> = new Map()

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private generateRequestKey(endpoint: string, options: RequestInit = {}): string {
    const method = options.method || 'GET'
    const body = options.body ? JSON.stringify(options.body) : ''
    return `${method}:${endpoint}:${body}`
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    // Generate request key for deduplication
    const requestKey = this.generateRequestKey(endpoint, options)
    
    // Check if this exact request is already in progress
    const ongoingRequest = this.ongoingRequests.get(requestKey)
    if (ongoingRequest) {
      console.log(`Request deduplication: Using cached request for ${requestKey}`)
      return ongoingRequest as Promise<T>
    }
    
    // Get CSRF token from cookie for authenticated requests
    const getCsrfToken = (tokenType: 'access' | 'refresh' = 'access') => {
      if (typeof document === 'undefined') return null
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

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers as Record<string, string>,
    }

    // Add CSRF token for non-GET requests
    if (options.method && options.method !== 'GET') {
      // Use refresh CSRF token for refresh endpoint, access CSRF token for others
      const isRefreshEndpoint = endpoint.includes('/refresh')
      const csrfToken = getCsrfToken(isRefreshEndpoint ? 'refresh' : 'access')
      if (csrfToken) {
        headers['X-CSRF-TOKEN'] = csrfToken
      }
    }
    
    const config: RequestInit = {
      headers,
      credentials: "include", // Important: Include cookies in requests
      ...options,
    }

    // Create the request promise and cache it
    const requestPromise = this.executeRequest<T>(url, config)
    this.ongoingRequests.set(requestKey, requestPromise)

    try {
      const result = await requestPromise
      return result
    } catch (error) {
      throw error
    } finally {
      // Always clean up the cache when request completes (success or failure)
      this.ongoingRequests.delete(requestKey)
    }
  }

  private async executeRequest<T>(url: string, config: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, config)
      
      // Handle different response types
      const contentType = response.headers.get("content-type")
      let data: unknown
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json()
      } else {
        data = await response.text()
      }

      if (!response.ok) {
        // For auth endpoints that return 401/403, trigger a global auth event
        if (response.status === 401 || response.status === 403) {
          if (typeof window !== 'undefined') {
            // Dispatch a custom event that the auth context can listen for
            window.dispatchEvent(new Event('auth:unauthorized'));
          }
        }
        
        const responseData = data as Record<string, unknown>
        const error: ApiError = {
          message: responseData?.error as string || responseData?.message as string || "An error occurred",
          status: response.status,
          errors: responseData?.errors as Record<string, string[]> || undefined,
        }
        
        throw error
      }

      return data as T
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError) {
        throw {
          message: "Network error. Please check your connection.",
          status: 0,
        } as ApiError
      }
      
      // Re-throw API errors
      throw error
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  }

  async post<T>(
    endpoint: string, 
    data?: unknown, 
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(
    endpoint: string, 
    data?: unknown, 
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  }

  async patch<T>(
    endpoint: string, 
    data?: unknown, 
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Helper function to check if we're on the client side
export const isClientSide = typeof window !== "undefined"

// Helper function to handle API errors consistently
export function handleApiError(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    return (error as ApiError).message
  }
  return "An unexpected error occurred"
}