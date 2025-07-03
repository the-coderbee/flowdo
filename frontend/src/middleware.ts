import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Define protected routes that require authentication
const protectedRoutes = ["/tasks", "/settings", "/dashboard"]

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
  const isAuthenticated = Boolean(accessToken || refreshToken)

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if the current path is a public auth route
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if the current path is always accessible
  const isPublicAccessRoute = publicAccessRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // Allow access to always accessible routes
  if (isPublicAccessRoute) {
    return NextResponse.next()
  }

  // Handle protected routes
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login with the intended destination
    const loginUrl = new URL("/", request.url)
    loginUrl.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Handle public auth routes (login/register)
  if (isPublicRoute && isAuthenticated) {
    // Redirect authenticated users away from login/register pages
    const redirectTo = request.nextUrl.searchParams.get("redirectTo") || "/tasks"
    return NextResponse.redirect(new URL(redirectTo, request.url))
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