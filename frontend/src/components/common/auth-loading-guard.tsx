"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/providers/auth-provider"
import { AuthGuards } from "@/lib/auth/guards"
import { usePathname } from "next/navigation"
import { TokenValidator } from "@/lib/auth/token-validator"
import { AuthLoadingOverlay } from "./auth-loading-overlay"

interface AuthLoadingGuardProps {
  children: React.ReactNode
}

export const AuthLoadingGuard = ({ children }: AuthLoadingGuardProps) => {
  const { isAuthenticated, loading, user } = useAuth()
  const pathname = usePathname()
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const checkInitialAuth = async () => {
      // If it's not a protected route, no need to wait
      if (!AuthGuards.isProtectedRoute(pathname)) {
        setIsInitializing(false)
        return
      }

      // Check if we have valid tokens client-side
      const hasValidTokens = TokenValidator.hasValidTokensClient()
      
      if (!hasValidTokens) {
        // No valid tokens, we can proceed immediately
        setIsInitializing(false)
        return
      }

      // Wait for auth provider to complete initialization
      // Give it a maximum of 5 seconds
      const timeout = setTimeout(() => {
        console.warn("Auth initialization timeout")
        setIsInitializing(false)
      }, 5000)

      // Check if auth provider has finished loading
      if (!loading && (user !== null || isAuthenticated)) {
        clearTimeout(timeout)
        setIsInitializing(false)
      }
    }

    checkInitialAuth()
  }, [pathname, loading, user, isAuthenticated])

  // Stop initializing when auth provider stops loading
  useEffect(() => {
    if (!loading) {
      setIsInitializing(false)
    }
  }, [loading])

  const handleTimeout = () => {
    console.warn("Auth loading timeout - forcing completion")
    setIsInitializing(false)
  }

  return (
    <>
      <AuthLoadingOverlay 
        isVisible={isInitializing && AuthGuards.isProtectedRoute(pathname)}
        message="Verifying authentication..."
        submessage="Securing your session and loading your data"
        timeout={8000}
        onTimeout={handleTimeout}
      />
      {children}
    </>
  )
}