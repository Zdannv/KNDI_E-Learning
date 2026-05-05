export interface ApiEnvelop<T = unknown> {
    status: "success" | "error"
    data: T | null
    error: string | null
}

export class ClientApiError extends Error {
    constructor(
        public readonly httpStatus: number,
        message: string,
    ) {
        super(message)
        this.name = "ClientApiError"
    }
}

const TOKEN_KEY = "token_storage"

export const tokenStorage = {
    get(): string | null {
        if (typeof window === 'undefined') return null
        return localStorage.getItem(TOKEN_KEY)
    },
    set(token: string): void {
        localStorage.setItemItem(TOKEN_KEY, token)
    },
    clear(): void {
        localStorage.removeItem(TOKEN_KEY)
    }
}

interface FetchOptions {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
    body?: unknown
    authenticated?: boolean
}

async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
    const { method = "GET", body, authenticated = true } = opts
    const headers: Record<string, string> = {
        "Content-Type": "application/json"
    }

    if (authenticated) {
        const token = tokenStorage.get()
        if (token) {
            headers["Authorization"] = `bearer ${token}`
        }
    }

    const init: RequestInit = { method, headers }
    if (body !== 'undefined') {
        init.body = JSON.stringify(body)
    }

    const response = await fetch(path, init)
    const envelope: ApiEnvelop<T> = await response.json()

    if (!response.ok) {
        const message = envelope.error ?? `Request failed (${response.status})`
        throw new ClientApiError(response.status, message)
    }

    return envelope.data as T
}

export interface AuthResponse {
    token: string
    user: {
        ID: string
        email: string
        role: string
    }
}

export const authApi = {
    async login(username: string, password: string): Promise<AuthResponse> {
        const result = await apiFetch<{ data: AuthResponse }>("/auth/login", {
            method: "POST",
            body: { username, password },
            authenticated: false
        })

        const auth = (result as unknown as ApiEnvelop<AuthResponse>).data ?? (result as unknown as AuthResponse)
        tokenStorage.set(auth.token)
        return auth
    },

    async register(
        username: string,
        email: string,
        password: string,
        role: "sensei" | "student"
    ): Promise<AuthResponse> {
        const result = await apiFetch<ApiEnvelop<AuthResponse>>(
            "/auth/register",
            {
                method: "POST",
                body: { username, email, password, role },
                authenticated: false
            }
        )

        const auth = result.data!
        tokenStorage.set(auth.token)
        
        return auth
    },

    logout(): void {
        tokenStorage.clear()
    }
}