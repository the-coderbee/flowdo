import { apiClient } from "@/lib/api/client"
import { AuthStorage } from "./storage"
import { TokenCleanup } from "./token-cleanup"
import {User, LoginRequest, RegisterRequest, AuthResponse} from "./types"

export class AuthClient {
    private static readonly endpoints = {
        login: "/api/auth/login",
        register: "/api/auth/register",
        logout: "/api/auth/logout",
        refresh: "/api/auth/refresh",
        me: "/api/auth/me",
        passwordReset: "/api/auth/password-reset",
        passwordResetConfirm: "/api/auth/password-reset-confirm",
    } as const

    static async login(email: string, password: string, rememberMe: boolean = false): Promise<AuthResponse> {
        const loginData: LoginRequest = {email, password, remember_me: rememberMe}
        return apiClient.post<AuthResponse>(this.endpoints.login, loginData)
    }

    static async register(email: string, password: string, displayName: string, rememberMe: boolean = false): Promise<AuthResponse> {
        const registerData: RegisterRequest = {
            email, 
            password, 
            display_name: displayName,
            remember_me: rememberMe,
        }
        return apiClient.post<AuthResponse>(this.endpoints.register, registerData)
    }

    static async logout(): Promise<void> {
        try {
            await apiClient.post(this.endpoints.logout, {})
        } catch (error) {
            console.warn('Logout API call failed, continuing with cleanup: ', error)
        } finally {
            TokenCleanup.cleanupLogout()
        }
    }

    static async refreshToken(): Promise<AuthResponse> {
        if (!AuthStorage.hasRefreshToken()) {
            throw new Error('No refresh token found')
        }
        return apiClient.post<AuthResponse>(this.endpoints.refresh, {})
    }

    static async getCurrentUser(): Promise<User> {
        return apiClient.get<User>(this.endpoints.me)
    }

    static async checkAuth(): Promise<User | null> {
        try {
            if (!AuthStorage.hasAccessToken()) {
                return null
            }
            return await this.getCurrentUser()
        } catch (error) {
            if (typeof error === 'object' && error !== null && 'status' in error) {
                const status = (error as {status: number}).status
                if (status === 401) {
                    TokenCleanup.cleanupUnauthorized()
                    return null
                } else if (status === 403) {
                    TokenCleanup.cleanupInvalidTokens()
                    return null
                }
            }
            // For other errors, just clean up without specific reason
            TokenCleanup.cleanupInvalidTokens()
            return null
        }
    }
}