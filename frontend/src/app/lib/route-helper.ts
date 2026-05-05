import { NextResponse } from "next/server";
import { ApiError } from "./api-client";

export function ok<T>(data: T, status = 200): NextResponse {
    return NextResponse.json({ status: "success", data, "error": null })
}

export function created<T>(data: T): NextResponse {
    return ok(data, 201)
}

export function errorResponse(status: number, message: string): NextResponse {
    return NextResponse.json(
        { status: "error", data: null, message  },
        { status }
    )
}

export const badRequest = (msg: string) => errorResponse(400, msg)
export const unauthorized = (msg= "Unathorized") => errorResponse(401, msg)
export const forbidden = (msg = "Forbidden") => errorResponse(403, msg)
export const notFound = (msg = "Not found") => errorResponse(404, msg)
export const internalError = (msg = "Internal server error") => errorResponse(500, msg)

export function handleRouteError(err: unknown, context: string): NextResponse {
    if (err instanceof ApiError) {
        console.warn(`[${context}] Backend service error ${err.status}: ${err.backendMessage}`)
        return errorResponse(err.status, err.backendMessage)
    }

    console.error(`[${context}] Unexpected error: `, err)
    return internalError()
}