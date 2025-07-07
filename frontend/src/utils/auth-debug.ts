/**
 * Debug utilities for authentication issues
 */

export function debugAuthState() {
  if (typeof window === 'undefined') return
  
  console.group('🔍 Auth Debug Info')
  
  // Check cookies
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=')
    if (name && value && (name.includes('token') || name.includes('csrf'))) {
      acc[name] = value
    }
    return acc
  }, {} as Record<string, string>)
  
  console.log('📝 Auth Cookies:', Object.keys(cookies).length > 0 ? cookies : 'None found')
  
  // Check localStorage
  const authKeys = Object.keys(localStorage).filter(key => 
    key.includes('auth') || key.includes('user') || key.includes('token')
  )
  console.log('💾 Auth LocalStorage:', authKeys.length > 0 ? authKeys : 'None found')
  
  // Check current URL
  console.log('🌐 Current URL:', window.location.href)
  console.log('📍 Current Path:', window.location.pathname)
  
  console.groupEnd()
}

export function forceLogout() {
  console.log('🚨 Force logout initiated')
  
  // Clear all auth cookies
  const authCookieNames = ['access_token', 'refresh_token', 'csrf_access_token', 'csrf_refresh_token']
  const pathsToTry = ['/', '/api', '/auth']
  
  authCookieNames.forEach(cookieName => {
    pathsToTry.forEach(path => {
      // Clear for current domain
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`
      // Clear for subdomain
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${window.location.hostname}`
      // Clear for parent domain
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=.${window.location.hostname}`
    })
  })
  
  // Clear localStorage
  Object.keys(localStorage).forEach(key => {
    if (key.includes('auth') || key.includes('user') || key.includes('token')) {
      localStorage.removeItem(key)
    }
  })
  
  // Clear sessionStorage
  Object.keys(sessionStorage).forEach(key => {
    if (key.includes('auth') || key.includes('user') || key.includes('token')) {
      sessionStorage.removeItem(key)
    }
  })
  
  console.log('✅ Force logout completed')
  
  // Redirect to home
  window.location.href = '/'
}

// Add global debug functions for testing
if (typeof window !== 'undefined') {
  (window as typeof window & { debugAuth?: () => void; forceLogout?: () => void }).debugAuth = debugAuthState;
  (window as typeof window & { debugAuth?: () => void; forceLogout?: () => void }).forceLogout = forceLogout;
}