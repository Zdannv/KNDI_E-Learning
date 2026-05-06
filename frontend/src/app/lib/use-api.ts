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

export interface Material {
    id: number;
    name: string;
    description: string | null
    file_path: string | null
    created_at: string
    updated_at: string
}

export const materiaApi = {
    list: () => apiFetch<Material[]>("/api/materials"),
    getById: (id: number) => apiFetch<Material>(`/api/materials/${id}`),
    create: (payload: { 
        name: string, 
        description?: string, 
        file_path?: string 
    }) => apiFetch<Material>("/api/materials", { method: "POST", body: payload }),
    update: (
        id: number,
        payload: { name: string, description?: string, file_path?: string }
    ) => apiFetch<Material>(`/api/materials/${id}`, { method: "PUT", body: payload }),
    delete: (id: number) => apiFetch<Material>(`/api/materials/${id}`, { method: "POST" })
}

export interface QuestionOption {
    id: number
    question_id: number
    option_text: string
    url: string | null
    is_correct: boolean
}

export interface MatchingCard {
    id: number
    question_id: number
    left_text: string
    left_url: string | null
    right_text: string
    right_url: string | null
}

export interface Question {
    id: number
    quiz_id: number
    question_text: string
    question_type: 1 | 2 | 3
    correct_answer: string | null
    url: string | null
    point: number
    order_number: number
    question_option?: QuestionOption[]
    matching_card?: MatchingCard[]
}

export interface Quiz {
    id: number
    sensei_id: number
    title: string
    description: string
    is_published: boolean
    created_at: string
    updated_at: string
    question?: Question[]
}

export const quizApi = {
    list: () => apiFetch<Quiz[]>("/api/quizzes"),
    getById: (id: number) => apiFetch<Quiz>(`/api/quizzes/${id}`),
    create: (payload: { 
        title: string, 
        description?: string 
    }) => apiFetch<Quiz>("/api/quizzes", { method: "POST", body: payload }),
    update: (id: number, payload: {
        title: string, description?: string, is_published: boolean
    }) => apiFetch<Quiz>(`/api/quizzes/${id}`, { method: "PUT", body: payload }),
    delete: (id: number) => apiFetch<Quiz>(`/api/quizzes/${id}`, { method: "DELETE" }),

    addQuestions: (quizId: number, question: unknown) => 
        apiFetch<Question>(`/api/quizzes/${quizId}/questions`, { method: "POST", body: question }),
    deleteQuestions: (questionId: number) => apiFetch<Question>(`/pi/questions/${questionId}`)
}

export interface AssignmentResult {
    assignment_id: number
    quiz_title: string
    total_point: number
    score_earned: number
    score_percent: number
    passed: boolean
    status: string
    completed_at: string | null
    answer: {
        question_text: string
        your_answer: string
        is_correct: boolean
        score_earned: number
    }[]
}

export interface HistoryList {
    assignment_id: number
    quiz_title: string
    score_earned: number
    score_percent: number
    status: string
    date_str: string
    time_str: string
    completed_at: string | null
} 

export interface SubmitAnswer {
    question_id: number
    question_option_id?: number
    question_card_id?: number
    selected_card?: number
    answer_text?: string
}

export const assignmentApi = {
    start: (quizId: number) => apiFetch<{
        id: number, student_id: number, quiz_id: number,
        status: string, started_at: string
    }>(`/api/assignment`, { method: "POST", body: { quiz_id: quizId } }),
    submit: (assignmentId: number, answers: SubmitAnswer[]) => 
        apiFetch<AssignmentResult>(`/api/assignments/${assignmentId}/submit`, { method: "POST", body: { answer: answers } }),
    getResult: (assignmentId: number) => apiFetch<AssignmentResult>(`/api/assignments/${assignmentId}`),
    getHistory: () => apiFetch<HistoryList[]>("/api/assignments/history")
}