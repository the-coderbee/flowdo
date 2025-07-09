export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  status: 'success' | 'error'
  timestamp?: string
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

export interface ListResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
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

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface IApiClient {
  get<T>(endpoint: string, config?: RequestConfig): Promise<T>
  post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T>
  put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T>
  patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T>
  delete<T>(endpoint: string, config?: RequestConfig): Promise<T>
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface FileUploadConfig extends RequestConfig {
  onProgress?: (progress: UploadProgress) => void
}

export interface WebhookEvent<T = unknown> {
  type: string
  data: T
  timestamp: string
  id: string
}

export interface CacheOptions {
  ttl?: number
  key?: string
  enabled?: boolean
}

export interface RetryConfig {
  attempts: number
  delay: number
  backoff?: 'linear' | 'exponential'
  retryCondition?: (error: ApiError) => boolean
}

// Generic API state for components
export interface ApiState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
  lastFetch?: Date
}

// Mutation state for form submissions
export interface MutationState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
  success: boolean
}

export default ApiError