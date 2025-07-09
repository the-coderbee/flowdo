// lib/hooks/use-auth.ts - Consolidated auth hook
import { useContext } from 'react'
import { AuthContext } from '@/lib/providers/auth-provider'
import { AuthGuards } from '@/lib/auth/guards'
import { AuthStorage } from '@/lib/auth/storage'
import type { User } from '@/lib/auth/types'

export interface UseAuthReturn {
  // State
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  register: (email: string, password: string, displayName: string, rememberMe?: boolean) => Promise<void>
  logout: () => Promise<void>
  refreshAuth: () => Promise<boolean>
  clearError: () => void

  // Utilities
  validators: {
    isValidEmail: (email: string) => boolean
    validatePassword: (password: string) => { valid: boolean; errors: string[] }
    validateDisplayName: (displayName: string) => { valid: boolean; errors: string[] }
  }
  
  // Storage utilities
  storage: {
    hasTokens: () => boolean
    hasAccessToken: () => boolean
    hasRefreshToken: () => boolean
    clearAuthData: () => void
    debug: () => void
  }

  // Route guards
  guards: {
    isProtectedRoute: (pathname: string) => boolean
    isAuthRoute: (pathname: string) => boolean
    isPublicRoute: (pathname: string) => boolean
  }
}

export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return {
    // Auth state
    user: context.user,
    isAuthenticated: context.isAuthenticated,
    loading: context.loading,
    error: context.error,

    // Auth actions
    login: context.login,
    register: context.register,
    logout: context.logout,
    refreshAuth: context.refreshAuth,
    clearError: context.clearError,

    // Utility functions
    validators: {
      isValidEmail: AuthGuards.isValidEmail,
      validatePassword: AuthGuards.validatePassword,
      validateDisplayName: AuthGuards.validateDisplayName,
    },

    storage: {
      hasTokens: AuthStorage.hasTokens,
      hasAccessToken: AuthStorage.hasAccessToken,
      hasRefreshToken: AuthStorage.hasRefreshToken,
      clearAuthData: AuthStorage.clearAuthData,
      debug: AuthStorage.debug,
    },

    guards: {
      isProtectedRoute: AuthGuards.isProtectedRoute,
      isAuthRoute: AuthGuards.isAuthRoute,
      isPublicRoute: AuthGuards.isPublicRoute,
    },
  }
}

// Simplified hook for components that only need auth status
export function useAuthStatus() {
  const { isAuthenticated, loading } = useAuth()
  return { isAuthenticated, loading }
}

// Hook for protected components (automatically handles loading states)
export function useRequireAuth() {
  const auth = useAuth()
  
  if (auth.loading) {
    return { ...auth, ready: false }
  }
  
  if (!auth.isAuthenticated) {
    return { ...auth, ready: false }
  }
  
  return { ...auth, ready: true }
}