import { ApiError } from "@/types/auth"

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
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
        const error: ApiError = {
          message: data?.error || data?.message || "An error occurred",
          status: response.status,
          errors: data?.errors || undefined,
        }
        
        throw error
      }

      return data
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