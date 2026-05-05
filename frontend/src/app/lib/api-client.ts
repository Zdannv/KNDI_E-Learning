export interface BackendSuccessResponse<T = unknown> {
    status: "success";
    data: T;
    error: null;
}

export interface BackendErrorResponse {
    status: "error";
    data: null;
    error: string
}

export type BackendResponse<T = unknown> = BackendSuccessResponse<T> | BackendErrorResponse

export interface ApiRequestOptions {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    token?: string;
    headers?: Record<string, string>
}

export class ApiError extends Error {
    constructor(
        public readonly status: number,
        public readonly backendMessage: string
    ) {
        super(backendMessage);
        this.name = "ApiError";
    }
}

function getBaseURL(): string {
    const url = process.env.INTERNAL_API_URL
    if (!url) {
        throw new Error(
            "[Api-Client] INTERNAL API URL is not set."
        );
    }

    return url.replace(/\/$/, "")
}

export async function apiRequest<T = unknown>(
    path: string,
    opts: ApiRequestOptions = {}
): Promise<BackendResponse<T>> {
    const { method = "GET", body, token, headers: extractHeaders = {} } = opts
    
    const baseUrl = getBaseURL();
    const url = `${baseUrl}${path}`

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...extractHeaders,
    }

    if (token) {
        headers['Authorization'] = `bearer ${token}`
    }

    const init: RequestInit = {
        method,
        headers,
    }

    if (body != undefined) {
        init.body = JSON.stringify(body);
    }

    let response: Response;
    try {
        response = await fetch(url, init);
    } catch (networkError) {
        throw new Error(
            `[Api-Client] Can't reach backend ${url}: (${networkError})`
        )
    }

    let json: BackendResponse<T>;
    try {
        json = (await response.json()) as BackendResponse<T>
    } catch {
        throw new Error(
            `[Api-Client] Couldn't parse JSON from backend (status ${response.status})`
        )
    }

    if (!response.ok) {
        const message = json.status === "error" && json.error ? json.error : `Request failed: ${response.status}`
        throw new ApiError(response.status, message)
    }

    return json
}

export function extractBearerToken(
    authHeader: string | null | undefined
): string | undefined {
    if (!authHeader) {
        return undefined
    }

    const parts = authHeader.split(" ")
    if (parts.length !== 2 || parts[0].toLocaleLowerCase() !== "bearer") {
        return undefined
    }

    return parts[1]
}