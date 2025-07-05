/**
 * Cookie management utilities for authentication
 */

export interface CookieOptions {
  domain?: string
  path?: string
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

/**
 * Clear a specific cookie by setting it to expire in the past
 */
export function clearCookie(name: string, options?: CookieOptions): void {
  if (typeof document === 'undefined') return

  const { domain, path = '/', secure, sameSite } = options || {}
  
  let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`
  
  if (domain) {
    cookieString += `; domain=${domain}`
  }
  
  if (secure) {
    cookieString += '; secure'
  }
  
  if (sameSite) {
    cookieString += `; samesite=${sameSite}`
  }
  
  document.cookie = cookieString
}

/**
 * Clear all authentication-related cookies
 */
export function clearAuthCookies(): void {
  if (typeof document === 'undefined') return
  
  console.log('Clearing authentication cookies...')
  console.log('Cookies before clearing:', getAllCookies())
  
  // List of authentication cookie names that might be present
  const authCookieNames = [
    'access_token',
    'refresh_token', 
    'csrf_access_token',
    'csrf_refresh_token'
  ]
  
  // Clear cookies for different path and domain combinations
  const pathsToTry = ['/', '/api', '/auth']
  const domainsToTry = [
    undefined, // current domain
    window.location.hostname,
    `.${window.location.hostname}` // with dot prefix for subdomain support
  ]
  
  authCookieNames.forEach(cookieName => {
    pathsToTry.forEach(path => {
      domainsToTry.forEach(domain => {
        clearCookie(cookieName, { 
          path, 
          domain,
          secure: window.location.protocol === 'https:',
          sameSite: 'lax'
        })
      })
    })
  })
  
  console.log('Authentication cookies cleared')
  console.log('Cookies after clearing:', getAllCookies())
}

/**
 * Get all cookies as an object
 */
export function getAllCookies(): Record<string, string> {
  if (typeof document === 'undefined') return {}
  
  const cookies: Record<string, string> = {}
  
  document.cookie.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=')
    if (name && value) {
      cookies[name] = decodeURIComponent(value)
    }
  })
  
  return cookies
}

/**
 * Check if any authentication cookies are present
 */
export function hasAuthCookies(): boolean {
  if (typeof document === 'undefined') return false
  
  const cookies = getAllCookies()
  const authCookieNames = ['access_token', 'refresh_token']
  
  return authCookieNames.some(cookieName => cookies[cookieName])
}

/**
 * Debug: Log current authentication cookies
 */
export function debugAuthCookies(): void {
  if (typeof document === 'undefined') return
  
  const cookies = getAllCookies()
  const authCookies = Object.keys(cookies)
    .filter(name => name.includes('token') || name.includes('csrf'))
    .reduce((acc, name) => {
      acc[name] = cookies[name]
      return acc
    }, {} as Record<string, string>)
  
  console.log('Current auth cookies:', authCookies)
}