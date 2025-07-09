import { useState, useEffect, useCallback, useRef } from 'react'
import { apiClient } from '@/lib/api/client'
import type { ApiError, RequestConfig } from '@/lib/api/types'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
}

interface UseApiOptions extends RequestConfig {
  immediate?: boolean
  onSuccess?: (data: unknown) => void
  onError?: (error: ApiError) => void
}

export function useApi<T>(
  endpoint: string,
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: options.immediate ?? false,
    error: null
  })

  const mounted = useRef(true)
  const { immediate = false, onSuccess, onError, ...requestConfig } = options

  const execute = useCallback(async () => {
    if (!mounted.current) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const data = await apiClient.get<T>(endpoint, requestConfig)
      
      if (mounted.current) {
        setState({ data, loading: false, error: null })
        onSuccess?.(data)
      }
      
      return data
    } catch (error) {
      const apiError = error as ApiError
      
      if (mounted.current) {
        setState(prev => ({ ...prev, loading: false, error: apiError }))
        onError?.(apiError)
      }
      
      throw apiError
    }
  }, [endpoint, requestConfig, onSuccess, onError])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  return {
    ...state,
    execute,
    refetch: execute
  }
}

export function useMutation<TData, TVariables = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: ApiError, variables: TVariables) => void
    onSettled?: (data: TData | null, error: ApiError | null, variables: TVariables) => void
  } = {}
) {
  const [state, setState] = useState<UseApiState<TData>>({
    data: null,
    loading: false,
    error: null
  })

  const mounted = useRef(true)

  const mutate = useCallback(async (variables: TVariables) => {
    if (!mounted.current) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const data = await mutationFn(variables)
      
      if (mounted.current) {
        setState({ data, loading: false, error: null })
        options.onSuccess?.(data, variables)
        options.onSettled?.(data, null, variables)
      }
      
      return data
    } catch (error) {
      const apiError = error as ApiError
      
      if (mounted.current) {
        setState(prev => ({ ...prev, loading: false, error: apiError }))
        options.onError?.(apiError, variables)
        options.onSettled?.(null, apiError, variables)
      }
      
      throw apiError
    }
  }, [mutationFn, options])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  return {
    ...state,
    mutate,
    reset: () => setState({ data: null, loading: false, error: null })
  }
}

export function useApiPost<TData, TBody = unknown>(
  endpoint: string,
  options: UseApiOptions = {}
) {
  return useMutation<TData, TBody>(
    (data) => apiClient.post<TData>(endpoint, data, options),
    options
  )
}

export function useApiPut<TData, TBody = unknown>(
  endpoint: string,
  options: UseApiOptions = {}
) {
  return useMutation<TData, TBody>(
    (data) => apiClient.put<TData>(endpoint, data, options),
    options
  )
}

export function useApiPatch<TData, TBody = unknown>(
  endpoint: string,
  options: UseApiOptions = {}
) {
  return useMutation<TData, TBody>(
    (data) => apiClient.patch<TData>(endpoint, data, options),
    options
  )
}

export function useApiDelete<TData = unknown>(
  endpoint: string,
  options: UseApiOptions = {}
) {
  return useMutation<TData, void>(
    () => apiClient.delete<TData>(endpoint, options),
    options
  )
}

export function useInfiniteApi<T>(
  getEndpoint: (page: number) => string,
  options: UseApiOptions & {
    pageSize?: number
    getNextPageParam?: (lastPage: T[], allPages: T[][]) => number | undefined
  } = {}
) {
  const [pages, setPages] = useState<T[][]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [hasNextPage, setHasNextPage] = useState(true)

  const { pageSize = 20, getNextPageParam, ...requestConfig } = options

  const fetchNextPage = useCallback(async () => {
    if (loading || !hasNextPage) return

    setLoading(true)
    setError(null)

    try {
      const nextPage = getNextPageParam ? 
        getNextPageParam(pages[pages.length - 1], pages) : 
        pages.length

      if (nextPage === undefined) {
        setHasNextPage(false)
        setLoading(false)
        return
      }

      const endpoint = getEndpoint(nextPage)
      const data = await apiClient.get<T[]>(endpoint, requestConfig)
      
      setPages(prev => [...prev, data])
      
      if (data.length < pageSize) {
        setHasNextPage(false)
      }
    } catch (error) {
      setError(error as ApiError)
    } finally {
      setLoading(false)
    }
  }, [loading, hasNextPage, pages, getEndpoint, getNextPageParam, pageSize, requestConfig])

  const reset = useCallback(() => {
    setPages([])
    setError(null)
    setHasNextPage(true)
  }, [])

  return {
    pages,
    data: pages.flat(),
    loading,
    error,
    hasNextPage,
    fetchNextPage,
    reset
  }
}

export default useApi