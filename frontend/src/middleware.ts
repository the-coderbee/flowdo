import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define protected routes that require authentication
const protectedRoutes = ["/tasks", "/settings", "/my-day", "/starred", "/pomodoro", "/groups", "/dashboard"]

// Define public routes that should redirect authenticated users
const publicRoutes = ["/auth/login", "/auth/register"]

// Define routes that are always accessible (regardless of auth status)
const publicAccessRoutes = ["/", "/support", "/about", "/privacy", "/terms"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get the access token from cookies
  const accessToken = request.cookies.get("access_token")?.value
  const refreshToken = request.cookies.get("refresh_token")?.value
  
  // Determine if user appears to be authenticated (has tokens)
  const isAuthenticated = Boolean(accessToken && refreshToken)
  // Debug logging (temporary)
  console.log(`[Middleware] ${pathname} - accessToken: ${!!accessToken}, refreshToken: ${!!refreshToken}, isAuthenticated: ${isAuthenticated}`)

  // Check if the current path is always accessible (highest priority)
  const isPublicAccessRoute = publicAccessRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // Handle authenticated users on home page - redirect to dashboard
  // Only redirect if we have both tokens (more confident of valid auth)
  if (pathname === "/" && accessToken && refreshToken) {
    console.log(`[Middleware] Redirecting authenticated user from home to dashboard`)
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Allow access to always accessible routes (like onboarding page for unauthenticated users)
  if (isPublicAccessRoute) {
    return NextResponse.next()
  }

  // Check if the current path is a public auth route
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Don't redirect on login/register pages even if we have tokens
  // This allows the auth pages to handle their own validation
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // For protected routes, redirect to login page if no tokens
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Allow the request to continue
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Match all request paths except:
    // - api routes (handled by API)
    // - _next/static (static files)
    // - _next/image (image optimization)
    // - favicon.ico (favicon file)
    // - public folder files
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
}