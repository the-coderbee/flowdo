export class AuthGuards {
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    static isValidPassword(password: string): boolean {
        return password.length >= 8 // TODO: Add more complex password validation
    }

    static isStrongPassword(password: string): boolean {
        return password.length >=8 // TODO: Add more complex password validation
    }

    static validateDisplayName(displayName: string): {valid: boolean, errors: string[]} {
        const errors: string[] = []

        if (!displayName || displayName.trim().length === 0) {
            errors.push('Display name is required')
        }

        if (displayName.length > 30) {
            errors.push('Display name must be less than 30 characters')
        }

        if (displayName.includes(' ')) {
            errors.push('Display name cannot contain spaces')
        }

        return {valid: errors.length === 0, errors}
    }

    static isProtectedRoute(pathname: string): boolean {
        const protectedRoutes = ['/dashboard', '/tasks', '/settings', "/my-day", "/starred", "/pomodoro", "/groups"]
        return protectedRoutes.some(route => pathname.startsWith(route))
    }

    static isAuthRoute(pathname: string): boolean {
        const authRoutes = ["/login", "/register"]
        return authRoutes.some(route => pathname.startsWith(route))
    }

    static isPublicRoute(pathname: string): boolean {
        const publicRoutes = ["/", "/support", "/about", "/privacy", "/terms"]
        return publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))
    }
}
