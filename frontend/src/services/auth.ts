import { apiClient } from "@/lib/api"
import { clearAuthCookies } from "@/lib/cookies"
import { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  PasswordResetRequest,
  PasswordResetConfirmRequest 
} from "@/types/auth"

class AuthService {
  // Authentication endpoints
  private readonly endpoints = {
    login: "/api/auth/login",
    register: "/api/auth/register", 
    logout: "/api/auth/logout",
    refresh: "/api/auth/refresh",
    me: "/api/auth/me",
    passwordReset: "/api/auth/password-reset/request",
    passwordResetConfirm: "/api/auth/password-reset/confirm",
  }

  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const loginData: LoginRequest = { email, password }
    return apiClient.post<AuthResponse>(this.endpoints.login, loginData)
  }

  /**
   * Register new user
   */
  async register(email: string, password: string, displayName: string): Promise<AuthResponse> {
    const registerData: RegisterRequest = { 
      email, 
      password, 
      display_name: displayName 
    }
    return apiClient.post<AuthResponse>(this.endpoints.register, registerData)
  }

  /**
   * Logout current user - clears HTTP-only cookies
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(this.endpoints.logout)
    } catch (error) {
      console.warn('Logout API call failed, but continuing with client-side cleanup:', error)
    } finally {
      // Always clear client-side cookies as fallback
      clearAuthCookies()
    }
  }

  /**
   * Refresh access token using refresh token from HTTP-only cookie
   */
  async refreshToken(): Promise<void> {
    await apiClient.post(this.endpoints.refresh)
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>(this.endpoints.me)
  }

  /**
   * Check if user is authenticated by calling /me endpoint
   */
  async checkAuth(): Promise<User | null> {
    try {
      const user = await this.getCurrentUser()
      return user
    } catch (error) {
      // If 401/403, user is not authenticated
      if (typeof error === "object" && error !== null && "status" in error) {
        const status = (error as { status: number }).status
        if (status === 401 || status === 403) {
          clearAuthCookies()
          return null
        }
      }
      
      // For network errors or other issues, return null (not authenticated)
      clearAuthCookies()
      return null
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const resetData: PasswordResetRequest = { email }
    await apiClient.post(this.endpoints.passwordReset, resetData)
  }

  /**
   * Confirm password reset with token
   */
  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    const confirmData: PasswordResetConfirmRequest = { 
      token, 
      new_password: newPassword 
    }
    await apiClient.post(this.endpoints.passwordResetConfirm, confirmData)
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long")
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter")
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter")
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number")
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate display name
   */
  validateDisplayName(displayName: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!displayName || displayName.trim().length === 0) {
      errors.push("Display name is required")
    }
    
    if (displayName.length > 30) {
      errors.push("Display name must be 30 characters or less")
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Export singleton instance
export const authService = new AuthService()