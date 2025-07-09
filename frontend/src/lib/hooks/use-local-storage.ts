import { useState, useCallback } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)

        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}

export function useStorageState<T>(
  key: string,
  initialValue: T,
  storageType: 'localStorage' | 'sessionStorage' = 'localStorage'
) {
  const localStorage = useLocalStorage(key, initialValue)
  const sessionStorage = useSessionStorage(key, initialValue)
  
  return storageType === 'sessionStorage' ? sessionStorage : localStorage
}

export function useMultipleLocalStorage<T extends Record<string, unknown>>(
  keys: T
): [T, (key: keyof T, value: T[keyof T]) => void, (key: keyof T) => void] {
  const [values, setValues] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return keys
    }

    const stored = {} as T
    for (const [key, defaultValue] of Object.entries(keys)) {
      try {
        const item = window.localStorage.getItem(key)
        stored[key as keyof T] = item ? JSON.parse(item) : defaultValue
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error)
        stored[key as keyof T] = defaultValue
      }
    }
    return stored
  })

  const setValue = useCallback(
    (key: keyof T, value: T[keyof T]) => {
      try {
        setValues(prev => ({ ...prev, [key]: value }))
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(String(key), JSON.stringify(value))
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${String(key)}":`, error)
      }
    },
    []
  )

  const removeValue = useCallback(
    (key: keyof T) => {
      try {
        setValues(prev => ({ ...prev, [key]: keys[key] }))
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(String(key))
        }
      } catch (error) {
        console.warn(`Error removing localStorage key "${String(key)}":`, error)
      }
    },
    [keys]
  )

  return [values, setValue, removeValue]
}

export default useLocalStorage