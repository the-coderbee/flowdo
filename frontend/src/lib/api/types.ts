export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  status: 'success' | 'error'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

export interface FilterOptions {
  [key: string]: string | number | boolean | string[] | undefined
}

export interface QueryParams {
  page?: number
  limit?: number
  sort?: SortOptions
  filters?: FilterOptions
  search?: string
}

export interface RequestConfig extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
}

// HTTP Method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// API Client interface
export interface IApiClient {
  get<T>(endpoint: string, config?: RequestConfig): Promise<T>
  post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T>
  put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T>
  patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T>
  delete<T>(endpoint: string, config?: RequestConfig): Promise<T>
}

// Upload types
export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface FileUploadConfig extends RequestConfig {
  onProgress?: (progress: UploadProgress) => void
}

// Webhook types
export interface WebhookEvent<T = unknown> {
  type: string
  data: T
  timestamp: string
  id: string
}

// Cache types
export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  key?: string
  enabled?: boolean
}

// Request retry configuration
export interface RetryConfig {
  attempts: number
  delay: number
  backoff?: 'linear' | 'exponential'
  retryCondition?: (error: ApiError) => boolean
}

export default ApiError