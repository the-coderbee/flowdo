
import { NextRequest } from 'next/server'

export interface TokenValidationResult {
  isValid: boolean
  hasTokens: boolean
  reason?: string
}

export class TokenValidator {
  /**
   * Validate tokens from Next.js request
   */
  static async validateFromRequest(request: NextRequest): Promise<TokenValidationResult> {
    const accessToken = request.cookies.get('access_token')?.value
    const refreshToken = request.cookies.get('refresh_token')?.value

    // Check if tokens exist
    if (!accessToken && !refreshToken) {
      return {
        isValid: false,
        hasTokens: false,
        reason: 'No tokens found'
      }
    }

    if (!accessToken) {
      return {
        isValid: false,
        hasTokens: true,
        reason: 'No access token found'
      }
    }

    // Basic JWT format validation
    const tokenValidation = this.validateJWTFormat(accessToken)
    if (!tokenValidation.isValid) {
      return {
        isValid: false,
        hasTokens: true,
        reason: tokenValidation.reason
      }
    }

    // Check if token is expired
    const expiryCheck = this.checkTokenExpiry(accessToken)
    if (!expiryCheck.isValid) {
      return {
        isValid: false,
        hasTokens: true,
        reason: expiryCheck.reason
      }
    }

    return {
      isValid: true,
      hasTokens: true
    }
  }

  /**
   * Validate JWT format (basic structure check)
   */
  private static validateJWTFormat(token: string): { isValid: boolean; reason?: string } {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return { isValid: false, reason: 'Invalid JWT format' }
      }

      // Try to decode the header and payload
      const header = JSON.parse(atob(parts[0]))
      const payload = JSON.parse(atob(parts[1]))

      if (!header.typ || !header.alg) {
        return { isValid: false, reason: 'Invalid JWT header' }
      }

      if (!payload.exp) {
        return { isValid: false, reason: 'No expiration in token' }
      }

      return { isValid: true }
    } catch (error) {
      return { isValid: false, reason: 'Token decode error' }
    }
  }

  /**
   * Check if token is expired
   */
  private static checkTokenExpiry(token: string): { isValid: boolean; reason?: string } {
    try {
      const parts = token.split('.')
      const payload = JSON.parse(atob(parts[1]))
      
      const currentTime = Math.floor(Date.now() / 1000)
      const expirationTime = payload.exp

      if (currentTime >= expirationTime) {
        return { isValid: false, reason: 'Token expired' }
      }

      // Check if token expires within next 5 minutes (optional warning)
      const fiveMinutes = 5 * 60
      if (currentTime + fiveMinutes >= expirationTime) {
        // Token is valid but expires soon - still valid for now
        console.warn('Token expires soon')
      }

      return { isValid: true }
    } catch (error) {
      return { isValid: false, reason: 'Token expiry check failed' }
    }
  }

  /**
   * Check if we have valid tokens (client-side)
   */
  static hasValidTokensClient(): boolean {
    if (typeof document === 'undefined') return false

    try {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=')
        if (name && value) {
          acc[name] = decodeURIComponent(value)
        }
        return acc
      }, {} as Record<string, string>)

      const accessToken = cookies.access_token
      if (!accessToken) return false

      const validation = this.validateJWTFormat(accessToken)
      if (!validation.isValid) return false

      const expiryCheck = this.checkTokenExpiry(accessToken)
      return expiryCheck.isValid
    } catch (error) {
      console.warn('Token validation error:', error)
      return false
    }
  }
}