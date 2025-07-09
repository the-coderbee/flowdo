import type { ApiError, IApiClient, RequestConfig } from './types'
import { interceptorManager } from './interceptors'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

class ApiClient implements IApiClient {
    private baseURL: string

    constructor(baseURL: string = API_BASE_URL) {
        this.baseURL = baseURL
    }

    private async request<T>(endpoint: string, options: RequestConfig = {}): Promise<T> {
        const url = `${this.baseURL}${endpoint}`

        let config: RequestInit = {
            headers: {
                "Content-Type": "application/json",
                ...options.headers as Record<string, string>
            },
            ...options
        }

        // Process request through interceptors
        config = await interceptorManager.processRequest(config, url)

        try {
            const response = await fetch(url, config)
            
            // Process response through interceptors
            const processedResponse = await interceptorManager.processResponse(response, url)
            
            let data: unknown
            const contentType = processedResponse.headers.get("content-type")

            if (contentType && contentType.includes("application/json")) {
                data = await processedResponse.json()
            } else {
                data = await processedResponse.text()
            }

            if (!processedResponse.ok) {
                const responseData = data as Record<string, unknown>
                const error: ApiError = {
                    message: responseData?.error as string || responseData?.message as string || "An error occurred",
                    status: processedResponse.status,
                    errors: responseData?.errors as Record<string, string[]> || undefined
                }

                await interceptorManager.processError(error, url)
                throw error
            }

            return data as T
        } catch (error) {
            if (error instanceof TypeError) {
                const networkError: ApiError = {
                    message: "Network error - check your connection",
                    status: 0,
                }
                await interceptorManager.processError(networkError, url)
            }

            if (typeof error === 'object' && error !== null && 'status' in error) {
                await interceptorManager.processError(error as ApiError, url)
            }

            throw error
        }
    }

    async get<T>(endpoint: string, options: RequestConfig = {}): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: "GET"
        })
    }

    async post<T>(endpoint: string, data: unknown = undefined, options: RequestConfig = {}): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        })
    }

    async put<T>(endpoint: string, data: unknown = undefined, options: RequestConfig = {}): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined,
        })
    }

    async patch<T>(endpoint: string, data: unknown = undefined, options: RequestConfig = {}): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: "PATCH",
            body: data ? JSON.stringify(data) : undefined,
        })
    }

    async delete<T>(endpoint: string, options: RequestConfig = {}): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: "DELETE",
        })
    }
}

export const apiClient = new ApiClient()

export function handleApiError(error: unknown) {
    if (typeof error === "object" && error !== null && "message" in error) {
        return (error as ApiError).message
    }
    return "An unexpected error occurred"
}
