import { AuthStorage } from "./storage"
import { TokenValidator } from "./token-validator"

export enum CleanupReason {
  EXPIRED = "expired",
  INVALID_FORMAT = "invalid_format", 
  CORRUPTED = "corrupted",
  UNAUTHORIZED = "unauthorized",
  MANUAL = "manual",
  LOGOUT = "logout"
}

export interface CleanupResult {
  success: boolean
  reason: CleanupReason
  tokensRemoved: string[]
  redirect?: string
}

export class TokenCleanup {
  private static readonly AUTH_COOKIES = [
    'access_token',
    'refresh_token', 
    'csrf_access_token',
    'csrf_refresh_token'
  ] as const

  /**
   * Check and cleanup invalid tokens automatically
   */
  static async checkAndCleanupTokens(): Promise<CleanupResult> {
    if (typeof window === 'undefined') {
      return { success: false, reason: CleanupReason.MANUAL, tokensRemoved: [] }
    }

    // Check if we have valid tokens
    const hasValidTokens = TokenValidator.hasValidTokensClient()
    
    if (hasValidTokens) {
      return { success: true, reason: CleanupReason.MANUAL, tokensRemoved: [] }
    }

    // If we have tokens but they're invalid, clean them up
    if (AuthStorage.hasTokens()) {
      console.log("Detected invalid tokens, cleaning up...")
      return this.cleanupTokens(CleanupReason.INVALID_FORMAT)
    }

    return { success: true, reason: CleanupReason.MANUAL, tokensRemoved: [] }
  }

  /**
   * Clean up tokens with specified reason
   */
  static cleanupTokens(reason: CleanupReason, redirectPath?: string): CleanupResult {
    if (typeof window === 'undefined') {
      return { success: false, reason, tokensRemoved: [] }
    }

    const removedTokens: string[] = []

    try {
      // Check which tokens exist before removal
      this.AUTH_COOKIES.forEach(cookieName => {
        if (this.getCookie(cookieName)) {
          removedTokens.push(cookieName)
        }
      })

      // Clear all auth data
      AuthStorage.clearAuthData()

      // Clear any additional auth-related items from storage
      this.clearAuthStorage()

      console.log(`Token cleanup completed: ${reason}`, {
        tokensRemoved: removedTokens,
        timestamp: new Date().toISOString()
      })

      return {
        success: true,
        reason,
        tokensRemoved: removedTokens,
        redirect: redirectPath
      }
    } catch (error) {
      console.error("Token cleanup error:", error)
      return {
        success: false,
        reason,
        tokensRemoved: []
      }
    }
  }

  /**
   * Clean up expired tokens specifically
   */
  static cleanupExpiredTokens(): CleanupResult {
    return this.cleanupTokens(CleanupReason.EXPIRED, "/login?error=session_expired")
  }

  /**
   * Clean up on unauthorized access
   */
  static cleanupUnauthorized(): CleanupResult {
    return this.cleanupTokens(CleanupReason.UNAUTHORIZED, "/login?error=unauthorized")
  }

  /**
   * Clean up corrupted/invalid tokens
   */
  static cleanupInvalidTokens(): CleanupResult {
    return this.cleanupTokens(CleanupReason.INVALID_FORMAT, "/login?error=invalid_session")
  }

  /**
   * Clean up on manual logout
   */
  static cleanupLogout(): CleanupResult {
    return this.cleanupTokens(CleanupReason.LOGOUT)
  }

  /**
   * Get a specific cookie value
   */
  private static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null
    
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [cookieName, value] = cookie.trim().split('=')
      if (cookieName === name) {
        return value || null
      }
    }
    return null
  }

  /**
   * Clear auth-related items from localStorage and sessionStorage
   */
  private static clearAuthStorage(): void {
    const storageTypes = [localStorage, sessionStorage]
    const authKeywords = ['auth', 'token', 'user', 'session', 'csrf']

    storageTypes.forEach(storage => {
      if (!storage) return

      // Get all keys first to avoid modifying during iteration
      const keys = Object.keys(storage)
      
      keys.forEach(key => {
        const lowerKey = key.toLowerCase()
        if (authKeywords.some(keyword => lowerKey.includes(keyword))) {
          try {
            storage.removeItem(key)
            console.debug(`Removed ${key} from storage`)
          } catch (error) {
            console.warn(`Failed to remove ${key} from storage:`, error)
          }
        }
      })
    })
  }

  /**
   * Schedule automatic token validation and cleanup
   */
  static startPeriodicCleanup(intervalMinutes: number = 5): () => void {
    if (typeof window === 'undefined') {
      return () => {}
    }

    const interval = setInterval(async () => {
      console.debug("Running periodic token validation...")
      await this.checkAndCleanupTokens()
    }, intervalMinutes * 60 * 1000)

    // Return cleanup function
    return () => {
      clearInterval(interval)
      console.debug("Stopped periodic token cleanup")
    }
  }

  /**
   * Debug utility to show current token state
   */
  static debugTokenState(): void {
    if (typeof window === 'undefined') {
      console.log("Token debug not available on server side")
      return
    }

    console.group("🧹 Token Cleanup Debug")
    console.log("Has tokens:", AuthStorage.hasTokens())
    console.log("Has access token:", AuthStorage.hasAccessToken())
    console.log("Has refresh token:", AuthStorage.hasRefreshToken())
    console.log("Tokens valid:", TokenValidator.hasValidTokensClient())
    
    // Show which specific cookies exist
    this.AUTH_COOKIES.forEach(cookieName => {
      const value = this.getCookie(cookieName)
      console.log(`${cookieName}:`, value ? "present" : "missing")
    })
    
    console.groupEnd()
  }
}