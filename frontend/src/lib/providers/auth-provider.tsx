"use client";

import {
	createContext,
	useContext,
	useEffect,
	useReducer,
	useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthClient } from "@/lib/auth/client";
import { AuthStorage } from "@/lib/auth/storage";
import { AuthGuards } from "@/lib/auth/guards";
import { handleApiError } from "@/lib/api/client";
import { AuthState, User, AuthContextType } from "@/types/auth";

// Reducer for auth state
type AuthAction =
	| { type: "SET_LOADING"; payload: boolean }
	| { type: "SET_USER"; payload: User }
	| { type: "SET_ERROR"; payload: string }
	| { type: "CLEAR_ERROR" }
	| { type: "LOGOUT" }
	| { type: "INIT_COMPLETE" };

function authReducer(state: AuthState, action: AuthAction): AuthState {
	switch (action.type) {
		case "SET_LOADING":
			return { ...state, loading: action.payload };
		case "SET_USER":
			return {
				...state,
				user: action.payload,
				isAuthenticated: true,
				loading: false,
				error: null,
			};
		case "SET_ERROR":
			return {
				...state,
				error: action.payload,
				loading: false,
			};
		case "CLEAR_ERROR":
			return { ...state, error: null };
		case "LOGOUT":
			AuthStorage.clearAuthData();
			return {
				...state,
				user: null,
				isAuthenticated: false,
				loading: false,
				error: null,
			};
		default:
			return state;
	}
}

const initialState: AuthState = {
	user: null,
	isAuthenticated: false,
	loading: true, // Start with loading true to block initial render
	error: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [state, dispatch] = useReducer(authReducer, initialState);
	const router = useRouter();
	const pathname = usePathname();

	// auth validation
	const validateAuthState = useCallback(async (): Promise<boolean> => {
		try {
			dispatch({ type: "SET_LOADING", payload: true });
			dispatch({ type: "CLEAR_ERROR" });

			if (!AuthStorage.hasTokens()) {
				dispatch({ type: "LOGOUT" });
				return false;
			}

			try {
				const user = await AuthClient.getCurrentUser();

				if (user) {
					dispatch({ type: "SET_USER", payload: user });
					return true;
				} else {
					handleAuthFailure();
					return false;
				}

			} catch (error) {
				// check if error is a 401 or 403
				if (typeof error === "object" && error !== null && "status" in error) {
					const status = (error as { status: number }).status

					if (status === 401 || status === 403) {
						// refresh token once
						if (AuthStorage.hasRefreshToken()) {
							try {
								await AuthClient.refreshToken();
								const user = await AuthClient.getCurrentUser();
								if (user) {
									dispatch({ type: "SET_USER", payload: user });
									return true;
								}
							} catch {
								// Token refresh failed, will log out below
							}
						}

						// if refresh token fails, log out
						handleAuthFailure();
						return false;
						}
					}
					dispatch({ type: "SET_LOADING", payload: false })
					return false
			}
		} catch (error) {
			console.error("Unexpected error during auth check:", error);
			dispatch({ type: "SET_LOADING", payload: false })
			return false
		}
	}, []);

	const login = useCallback(
		async (
			email: string,
			password: string,
			rememberMe: boolean = false
		): Promise<boolean> => {
			try {
				dispatch({ type: "SET_LOADING", payload: true });
				dispatch({ type: "CLEAR_ERROR" });

				const response = await AuthClient.login(email, password, rememberMe);
				dispatch({ type: "SET_USER", payload: response.user });
				return true;
			} catch (error) {
				const errorMessage = handleApiError(error);
				dispatch({ type: "SET_ERROR", payload: errorMessage });
				return false
			}
		}, []);

	const register = useCallback(
		async (
			email: string,
			password: string,
			displayName: string,
			rememberMe: boolean = false
		): Promise<boolean> => {
			try {
				dispatch({ type: "SET_LOADING", payload: true });
				dispatch({ type: "CLEAR_ERROR" });

				const response = await AuthClient.register(
					email,
					password,
					displayName,
					rememberMe
				);
				dispatch({ type: "SET_USER", payload: response.user });
				return true;
			} catch (error) {
				const errorMessage = handleApiError(error);
				dispatch({ type: "SET_ERROR", payload: errorMessage });
				return false;
			}
		}, []);

	const logout = useCallback(async (): Promise<void> => {
		try {
			await AuthClient.logout();
		} catch {
			// Logout API call failed, but we still clear local auth state
		} finally {
			dispatch({ type: "LOGOUT" });
			router.push("/login");
		}
	}, [router]);

	const refreshAuth = useCallback(async (): Promise<boolean> => {
		return validateAuthState()
	}, [validateAuthState])

	const handleAuthFailure = useCallback(() => {
		dispatch({ type: "LOGOUT" })

		// redirect if the current route is protected
		if (AuthGuards.isProtectedRoute(pathname)) {
			router.push("/login");
		}
	}, [pathname, router]);

	const clearError = useCallback(() => {
		dispatch({ type: "CLEAR_ERROR" });
	}, []);

	// initialize auth state on mount
	useEffect(() => {
		let mounted = true;

		const initialize = async () => {
			try {
				await new Promise(resolve => setTimeout(resolve, 100))
				if (mounted) {
					await validateAuthState()
				}
			} catch (error) {
				console.error("Error during auth initialization:", error);
			}
		}

		initialize();
		return () => {mounted = false}
	}, [validateAuthState])

	// setup periodic auth checks (every 15 minutes when authenticated)
	useEffect(() => {
		if (!state.isAuthenticated) return;

		const interval = setInterval(async () => {
			validateAuthState();
		}, 15 * 60 * 1000);

		return () => clearInterval(interval);
	}, [state.isAuthenticated, validateAuthState]);

	// auto-refresh tokens (every 15 minutes when authenticated)
	useEffect(() => {
		if (!state.isAuthenticated) return;

		const performTokenRefresh = async () => {
			try {
				if (!AuthStorage.hasRefreshToken()) {
					handleAuthFailure()
					return
				}

				await AuthClient.refreshToken()
			} catch (error) {
				if (typeof error === "object" && error !== null && "status" in error) {
					const status = (error as { status: number }).status
					if (status === 401 || status === 403) {
						handleAuthFailure()
					}
				}
			}
		};

		const refreshInterval = setInterval(performTokenRefresh, 15 * 60 * 1000); // 15 minutes
		return () => clearInterval(refreshInterval);
	}, [state.isAuthenticated, handleAuthFailure]);

	// listen for 401 events globally
	useEffect(() => {
		const handle401 = () => {
			handleAuthFailure();
		};

		window.addEventListener("auth:unauthorized", handle401);
		return () => window.removeEventListener("auth:unauthorized", handle401);
	}, [handleAuthFailure]);

	const contextValue: AuthContextType = {
		...state,
		login,
		register,
		logout,
		refreshAuth,
		clearError,
	};

	return (
		<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
	);
}

// custom hook for using auth context
export function useAuth(): AuthContextType {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
