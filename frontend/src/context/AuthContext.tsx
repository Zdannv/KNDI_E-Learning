"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react"

const TOKEN_KEY = "kndi_token"

export interface AuthUser {
    ID: string
    username: string
    email: string
    role: "sensei" | "student"
}

interface AuthContextValue {
    user: AuthUser | null
    token: string | null
    isLoading: boolean
    login: ( username: string, password: string ) => Promise<void>
    register: (
        username: string,
        email: string,
        password: string,
        role: "sensei" | "student"
    ) => Promise<void>
    logout: () => void
}

export class AuthError extends Error {
    constructor(
        public readonly httpStatus: number,
        message: string
    ) {
        super(message)
        this.name = "AuthError"
    }
}

interface ApiEnvelop<T = unknown> {
    status: "success" | "error"
    data: T | null
    error: string | null
    message?: string
}

interface AuthResponseData {
    token: string
    user: AuthUser
}

async function postJson<T>(
    path: string, 
    body: unknown
): Promise<ApiEnvelop<T>> {
    const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })

    const json: ApiEnvelop<T> = await response.json()

    if (!response.ok) {
        const message = json.message ?? json.error ?? `Request failed (${response.status})`
        throw new AuthError(response.status, message)
    }

    return json
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        try {
            const storedToken = localStorage.getItem(TOKEN_KEY)
            const storedUser = localStorage.getItem(`${TOKEN_KEY}_user`)

            if (storedToken && storedUser) {
                setToken(storedToken)
                setUser(JSON.parse(storedUser) as AuthUser)
            }
        } catch (err) {
            localStorage.removeItem(TOKEN_KEY)
            localStorage.removeItem(`${TOKEN_KEY}_user`)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // PERSIST HELPER
    const persistSession = useCallback((newToken: string, newUser: AuthUser) => {
        localStorage.setItem(TOKEN_KEY, newToken)
        localStorage.setItem(`${TOKEN_KEY}_user`, JSON.stringify(newUser))
        setToken(newToken)
        setUser(newUser)
    }, [])

    const clearSession = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(`${TOKEN_KEY}_user`)
        setToken(null)
        setUser(null)
    }, [])

    const login = useCallback(
        async (username: string, password: string) => {
            const envelop = await postJson<AuthResponseData>("/api/auth/login", {
                username,
                password
            })

            const { token: newToken, user: newUser } = envelop.data!
            persistSession(newToken, newUser)
        },
        [persistSession]
    )

    const register = useCallback(
        async (
            username: string,
            email: string,
            password: string,
            role: "sensei" | "student"
        ) => {
            const envelop = await postJson<AuthResponseData>(
                "/api/auth/register",
                { username, email, password, role }
            )

            const { token: newToken, user: newUser } = envelop.data!
            persistSession(newToken, newUser)
        },
        [persistSession]
    )

    const logout = useCallback(() => {
        clearSession()
        document.cookie = "kndi_session=; path=/; max-age=0; SameSite=Lax"
        window.location.href = "/login"
    }, [clearSession])

    const value = useMemo<AuthContextValue>(
        () => ({ user, token, isLoading, login, register, logout }),
        [user, token, isLoading, login, register, logout]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside <AuthProvider>");
    }
    return ctx;
}
