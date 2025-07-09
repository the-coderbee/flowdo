// Authentication types based on backend schemas

export interface User {
  id: number
  email: string
  display_name: string
}

export interface LoginRequest {
  email: string
  password: string
  remember_me?: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  display_name: string
  remember_me?: boolean
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface AuthResponse {
  user: User
  token: TokenResponse
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>
  register: (email: string, password: string, displayName: string, rememberMe?: boolean) => Promise<boolean>
  logout: () => Promise<void>
  refreshAuth: () => Promise<boolean>
  clearError: () => void
}

export interface ApiError {
  message: string
  status?: number
  errors?: Record<string, string[]>
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirmRequest {
  token: string
  new_password: string
}