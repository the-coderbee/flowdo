import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

export interface User {
  id: number;
  email: string;
  display_name: string;
}

export interface AuthResponse {
  user: User;
  token: {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  display_name: string;
}

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Cookie options
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

/**
 * Store authentication data
 */
function storeAuth(data: AuthResponse): void {
  // Store in localStorage for client-side access
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth', JSON.stringify(data));
  }
  
  // Store a simple flag in cookies for middleware
  Cookies.set('auth', 'true', COOKIE_OPTIONS);
}

/**
 * Clear stored authentication data
 */
function clearAuth(): void {
  // Clear from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth');
  }
  
  // Clear the cookie
  Cookies.remove('auth');
}

/**
 * Register a new user
 */
export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to register');
  }

  const data = await response.json();
  
  // Store auth data
  storeAuth(data);
  
  return data;
}

/**
 * Login user
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to login');
  }

  const data = await response.json();
  
  // Store auth data
  storeAuth(data);
  
  return data;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    const auth = getAuthFromStorage();
    if (auth) {
      // Call logout endpoint
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token.access_token}`,
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear auth data
    clearAuth();
  }
}

/**
 * Get current user info
 */
export async function getCurrentUser(): Promise<User | null> {
  const auth = getAuthFromStorage();
  if (!auth) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${auth.token.access_token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const auth = getAuthFromStorage();
  if (!auth) {
    return false;
  }

  try {
    // Decode the token to check its expiration
    const decoded = jwtDecode<{ exp: number }>(auth.token.access_token);
    const currentTime = Math.floor(Date.now() / 1000);
    
    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return false;
  }
}

/**
 * Get authentication data from local storage
 */
export function getAuthFromStorage(): AuthResponse | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const auth = localStorage.getItem('auth');
  return auth ? JSON.parse(auth) : null;
}

/**
 * Get authentication token
 */
export function getToken(): string | null {
  const auth = getAuthFromStorage();
  return auth ? auth.token.access_token : null;
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/password-reset/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to request password reset');
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, new_password: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/password-reset/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, new_password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reset password');
  }
} 