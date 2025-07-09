import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { TokenValidator } from "./lib/auth/token-validator"

const PROTECTED_ROUTES = ["/dashboard", "/tasks", "/settings", "/my-day", "/starred", "/pomodoro", "/groups"]
const PUBLIC_ROUTES = ["/", "/support", "/about", "/privacy", "/terms"]
const AUTH_ROUTES = ["/login", "/register"]

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Allow public routes without any checks
    if (PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
        return NextResponse.next()
    }

    // Validate tokens for protected routes
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
        const tokenValidation = await TokenValidator.validateFromRequest(request)

        if (!tokenValidation.isValid) {
            
            // Build redirect URL with parameters
            const loginUrl = new URL("/login", request.url)
            loginUrl.searchParams.set("redirectTo", pathname)
            
            // Create response with redirect
            const response = NextResponse.redirect(loginUrl)
            
            if (tokenValidation.hasTokens) {
                // Clear invalid tokens
                response.cookies.delete("access_token")
                response.cookies.delete("refresh_token")
                response.cookies.delete("csrf_access_token")
                response.cookies.delete("csrf_refresh_token")
            }
            
            return response
        }

        return NextResponse.next()
    }

    // Handle auth routes (login/register)
    if (AUTH_ROUTES.some(route => pathname.startsWith(route))) {
        const tokenValidation = await TokenValidator.validateFromRequest(request)
        
        if (tokenValidation.isValid) {
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }
        
        // If has invalid tokens, clear them
        if (tokenValidation.hasTokens && !tokenValidation.isValid) {
            const response = NextResponse.next()
            response.cookies.delete("access_token")
            response.cookies.delete("refresh_token")
            response.cookies.delete("csrf_access_token")
            response.cookies.delete("csrf_refresh_token")
            return response
        }

        return NextResponse.next()
    }

    // Default fallback
    return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
}