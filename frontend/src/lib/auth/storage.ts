export class AuthStorage {
    private static readonly AUTH_COKIES = [
        'access_token',
        'refresh_token',
        'csrf_access_token',
        'csrf_refresh_token',
     ] as const

    static hasTokens(): boolean {
        if (typeof document === 'undefined') return false

        const cookies = this.getAllCookies()
        return this.AUTH_COKIES.some(name => name in cookies && cookies[name].length > 0)
    }

    static hasAccessToken(): boolean {
        if (typeof document === 'undefined') return false

        const cookies = this.getAllCookies()
        return 'access_token' in cookies && cookies.access_token.length > 0
    }

    static hasRefreshToken(): boolean {
        if (typeof document === 'undefined') return false

        const cookies = this.getAllCookies()
        return 'refresh_token' in cookies && cookies.refresh_token.length > 0
    }

    static clearAuthData(): void {
        if (typeof document === 'undefined') return

        console.log('Clearing auth data...')
        this.clearCookies()
        this.clearStorage()

        console.log('Auth data cleared')

    }

    private static clearCookies(): void {
        const pathsToTry = ['/', '/api', '/auth']
        const isSecure = window.location.protocol === 'https:'
        const hostname = window.location.hostname

        const domainsToTry = [
            undefined,
            hostname,
            `.${hostname}`,
            ...(hostname === 'localhost' ? ['localhost', '.localhost'] : []),
        ]

        this.AUTH_COKIES.forEach(cookieName => {
            pathsToTry.forEach(path => {
                domainsToTry.forEach(domain => {
                    this.deleteCookie(cookieName, {path, domain, secure:isSecure})
                    this.deleteCookie(cookieName, {path, domain, secure:false})
                })
            })
            document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
        })
    }

    private static clearStorage(): void {
        const storageTypes = ['localStorage', 'sessionStorage']

        storageTypes.forEach(storage => {
            if (typeof storage === 'undefined') return

            Object.keys(storage).forEach(key => {
                if (this.isAuthKey(key)) {
                    storage.removeItem(key)
                }
            })
        })
    }

    private static isAuthKey(key: string): boolean {
        const authKeyWords = ['auth', 'token', 'user', 'session']
        return authKeyWords.some(keyword => key.toLowerCase().includes(keyword))
    }
    
    private static deleteCookie(name: string, options: {
        path?: string, 
        domain?: string, 
        secure?: boolean
    }): void {
            const {path = '/', domain, secure} = options

            let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`

            if (domain) cookieString += `; domain=${domain}`
            if (secure) cookieString += '; secure'
            cookieString += '; samesite=lax'

            document.cookie = cookieString
        }

    private static getAllCookies(): Record<string, string> {
        if (typeof document === 'undefined') return {}

        const cookies: Record<string, string> = {}

        if (document.cookie) {
            document.cookie.split(';').forEach(cookie => {
                const [name, value] = cookie.trim().split('=')
                if (name && value) {
                    cookies[name] = decodeURIComponent(value)
                }
            })
        }

        return cookies
    }

    // Debug utilities
    static debug(): void {
        console.group('🔍 Auth Storage Debug')
        console.log('Has tokens:', this.hasTokens())
        console.log('Has access token:', this.hasAccessToken())
        console.log('Has refresh token:', this.hasRefreshToken())
        console.log('All cookies:', this.getAllCookies())
        console.groupEnd()
    }
}