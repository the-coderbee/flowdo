"use client"

import React, { createContext, useContext, useEffect, useReducer, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AuthState, AuthContextType, User } from "@/types/auth"
import { authService } from "@/services/auth"
import { handleApiError } from "@/lib/api"
import { clearAuthCookies, hasRefreshToken } from "@/lib/cookies"

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true, // Start with loading true to check auth status
  error: null,
}

// Action types
type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: User }
  | { type: "SET_ERROR"; payload: string }
  | { type: "CLEAR_ERROR" }
  | { type: "LOGOUT" }

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      }
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      }
    case "CLEAR_ERROR":
      return { ...state, error: null }
    case "LOGOUT":
      // Clear authentication cookies when logging out
      clearAuthCookies()
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      }
    default:
      return state
  }
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const router = useRouter()

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" })
  }, [])

  // Login function
  const login = useCallback(async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })
      
      const response = await authService.login(email, password, rememberMe)
      dispatch({ type: "SET_USER", payload: response.user })
      dispatch({ type: "SET_LOADING", payload: false })
      return true
    } catch (error) {
      const errorMessage = handleApiError(error)
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      dispatch({ type: "SET_LOADING", payload: false })
      throw new Error(errorMessage) // Throw a proper error with the message
    }
  }, [])

  // Register function
  const register = useCallback(async (email: string, password: string, displayName: string, rememberMe: boolean = false) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })
      
      const response = await authService.register(email, password, displayName, rememberMe)
      dispatch({ type: "SET_USER", payload: response.user })
      dispatch({ type: "SET_LOADING", payload: false })
    } catch (error) {
      const errorMessage = handleApiError(error)
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      dispatch({ type: "SET_LOADING", payload: false })
      throw new Error(errorMessage) // Throw a proper error with the message
    }
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authService.logout()
      dispatch({ type: "LOGOUT" })
    } catch {
      // Even if logout fails on server, clear local state
      dispatch({ type: "LOGOUT" })
    } finally {
      // Always redirect to login page after logout
      router.push('/auth/login')
    }
  }, [router])

  // Manual token refresh function
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      if (!hasRefreshToken()) {
        console.log("No refresh token available for manual refresh")
        return false
      }
      
      console.log("Manual token refresh requested...")
      await authService.refreshToken()
      console.log("Manual token refresh successful")
      return true
    } catch (error) {
      console.error("Manual token refresh failed:", error)
      return false
    }
  }, [])

  // Refresh auth function - check if user is still authenticated
  const refreshAuth = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })
      
      // Check if we have any auth cookies first
      if (typeof window !== 'undefined') {
        const cookies = document.cookie
        const hasAccessToken = cookies.includes('access_token')
        const hasRefreshToken = cookies.includes('refresh_token')
        
        // If no tokens at all, don't bother making API call
        if (!hasAccessToken && !hasRefreshToken) {
          console.log("No auth cookies found, skipping auth check")
          clearAuthCookies()
          dispatch({ type: "LOGOUT" })
          return false
        }
      }
      
      try {
        const user = await authService.checkAuth()
        if (user) {
          dispatch({ type: "SET_USER", payload: user })
          return true
        } else {
          console.log("Auth check returned null user, logging out")
          clearAuthCookies()
          dispatch({ type: "LOGOUT" })
          return false
        }
      } catch (error) {
        console.error("Auth check error:", error)
        clearAuthCookies()
        dispatch({ type: "LOGOUT" })
        return false
      }
    } catch (error) {
      console.error("Auth refresh error:", error)
      clearAuthCookies()
      dispatch({ type: "LOGOUT" })
      return false
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  // Initialize auth state on mount
  useEffect(() => {
    let isMounted = true
    
    const initializeAuth = async () => {
      // Small delay to ensure cookies are available
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (isMounted) {
        refreshAuth()
      }
    }
    
    initializeAuth()
    
    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Remove refreshAuth dependency to avoid infinite loops

  // Set up periodic auth check (every 10 minutes) only if authenticated
  useEffect(() => {
    if (!state.isAuthenticated) return

    const interval = setInterval(refreshAuth, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [state.isAuthenticated, refreshAuth])

  // Auto-refresh token before it expires
  useEffect(() => {
    if (!state.isAuthenticated) return

    // Refresh token every 12 minutes (tokens expire in 15 minutes)
    const refreshInterval = setInterval(async () => {
      try {
        // Check if we have a refresh token before attempting refresh
        if (!hasRefreshToken()) {
          console.log("No refresh token found, skipping token refresh")
          dispatch({ type: "LOGOUT" })
          return
        }
        
        console.log("Attempting to refresh token...")
        
        // Retry logic for network failures (but not 401 errors)
        let retryCount = 0
        const maxRetries = 3
        
        while (retryCount <= maxRetries) {
          try {
            await authService.refreshToken()
            console.log("Token refresh successful")
            return // Success, exit the retry loop
          } catch (error) {
            // If it's a 401, don't retry - token is expired
            if (typeof error === "object" && error !== null && "status" in error) {
              const status = (error as { status: number }).status
              if (status === 401) {
                throw error // Don't retry on 401, re-throw immediately
              }
            }
            
            retryCount++
            if (retryCount > maxRetries) {
              throw error // Re-throw after max retries
            }
            
            console.log(`Token refresh attempt ${retryCount} failed, retrying...`)
            // Wait 1 second before retry
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
      } catch (error) {
        console.error("Token refresh failed:", error)
        
        // Check if it's a 401 (token expired) vs other errors
        if (typeof error === "object" && error !== null && "status" in error) {
          const status = (error as { status: number }).status
          if (status === 401) {
            console.log("Refresh token expired, logging out user")
          } else {
            console.log(`Token refresh failed with status ${status}, logging out user`)
          }
        } else {
          console.log("Token refresh failed with network/unknown error, logging out user")
        }
        
        // If refresh fails, logout user
        dispatch({ type: "LOGOUT" })
      }
    }, 12 * 60 * 1000)

    return () => clearInterval(refreshInterval)
  }, [state.isAuthenticated])

  // Handle visibility change to refresh auth when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && state.isAuthenticated) {
        refreshAuth()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [state.isAuthenticated, refreshAuth])

  // Set up listener for 401 responses anywhere in the app
  useEffect(() => {
    const handle401Error = () => {
      console.log("Auth token invalid or expired - logging out");
      clearAuthCookies();
      dispatch({ type: "LOGOUT" });
      router.push('/auth/login');
    };
    
    window.addEventListener("auth:unauthorized", handle401Error);
    return () => window.removeEventListener("auth:unauthorized", handle401Error);
  }, [router]);

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshAuth,
    refreshTokens,
    clearError,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Hook to get auth status for SSR-safe components
export function useAuthStatus() {
  const { isAuthenticated, loading } = useAuth()
  return { isAuthenticated, loading }
}