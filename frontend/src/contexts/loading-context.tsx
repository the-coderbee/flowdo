"use client"

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

interface LoadingState {
  [key: string]: boolean
}

interface LoadingContextType {
  // State
  isLoading: (key: string) => boolean
  isAnyLoading: () => boolean
  getActiveOperations: () => string[]
  
  // Actions
  startLoading: (key: string) => void
  stopLoading: (key: string) => void
  clearAll: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

interface LoadingProviderProps {
  children: ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>({})

  const isLoading = useCallback((key: string): boolean => {
    return loadingState[key] === true
  }, [loadingState])

  const isAnyLoading = useCallback((): boolean => {
    return Object.values(loadingState).some(loading => loading === true)
  }, [loadingState])

  const getActiveOperations = useCallback((): string[] => {
    return Object.keys(loadingState).filter(key => loadingState[key] === true)
  }, [loadingState])

  const startLoading = useCallback((key: string) => {
    setLoadingState(prev => ({
      ...prev,
      [key]: true
    }))
  }, [])

  const stopLoading = useCallback((key: string) => {
    setLoadingState(prev => ({
      ...prev,
      [key]: false
    }))
  }, [])

  const clearAll = useCallback(() => {
    setLoadingState({})
  }, [])

  const value: LoadingContextType = {
    isLoading,
    isAnyLoading,
    getActiveOperations,
    startLoading,
    stopLoading,
    clearAll,
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}