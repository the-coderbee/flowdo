"use client"

import React, { createContext, useContext, useEffect, useReducer, useCallback } from "react"
import { AuthState, AuthContextType, User } from "@/types/auth"
import { authService } from "@/services/auth"
import { handleApiError } from "@/lib/api"

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

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" })
  }, [])

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })
      
      const response = await authService.login(email, password)
      dispatch({ type: "SET_USER", payload: response.user })
      dispatch({ type: "SET_LOADING", payload: false })
    } catch (error) {
      const errorMessage = handleApiError(error)
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      dispatch({ type: "SET_LOADING", payload: false })
      throw new Error(errorMessage) // Throw a proper error with the message
    }
  }, [])

  // Register function
  const register = useCallback(async (email: string, password: string, displayName: string) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })
      
      const response = await authService.register(email, password, displayName)
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
    }
  }, [])

  // Refresh auth function - check if user is still authenticated
  const refreshAuth = useCallback(async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })
      
      const user = await authService.checkAuth()
      if (user) {
        dispatch({ type: "SET_USER", payload: user })
      } else {
        dispatch({ type: "LOGOUT" })
      }
      dispatch({ type: "SET_LOADING", payload: false })
    } catch (error) {
      console.error("Auth refresh error:", error)
      dispatch({ type: "LOGOUT" })
    }
  }, [])

  // Check auth status on mount only, with a small delay for cookies to be available
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshAuth()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [refreshAuth])

  // Set up periodic auth check (every 15 minutes) only if authenticated
  useEffect(() => {
    if (!state.isAuthenticated) return

    const interval = setInterval(refreshAuth, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [state.isAuthenticated, refreshAuth])

  // Auto-refresh token before it expires
  useEffect(() => {
    if (!state.isAuthenticated) return

    // Refresh token every 45 minutes (assuming 1-hour token expiry)
    const refreshInterval = setInterval(async () => {
      try {
        await authService.refreshToken()
      } catch {
        // If refresh fails, logout user
        dispatch({ type: "LOGOUT" })
      }
    }, 45 * 60 * 1000)

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

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshAuth,
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