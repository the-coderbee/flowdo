import { useState, useEffect, useRef, useCallback } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout>()

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay, ...deps]
  ) as T

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

export function useDebouncedState<T>(
  initialValue: T,
  delay: number
): [T, T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue)
  const debouncedValue = useDebounce(value, delay)

  return [value, debouncedValue, setValue]
}

export function useDebouncedSearch(
  searchFunction: (query: string) => Promise<unknown>,
  delay: number = 300
) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<unknown[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedQuery = useDebounce(query, delay)

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    searchFunction(debouncedQuery)
      .then((data) => {
        if (!cancelled) {
          setResults(Array.isArray(data) ? data : [])
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Search failed')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [debouncedQuery, searchFunction])

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearResults: () => setResults([]),
    clearError: () => setError(null)
  }
}

export default useDebounce