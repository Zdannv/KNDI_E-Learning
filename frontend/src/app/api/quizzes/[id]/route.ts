import { apiRequest, extractBearerToken } from "@/app/lib/api-client"
import { badRequest, handleRouteError, ok, unauthorized } from "@/app/lib/route-helper"
import { NextRequest } from "next/server"

interface UpdateRequestBody {
    title: string
    description?: string
    is_published: boolean
}

async function getQuizId(params: Promise<{ id: string }>): Promise<number | null> {
    const { id } = await params
    const parsed = parseInt(id, 10)
    if (isNaN(parsed) || parsed <= 0 ) {
        return null
    }

    return parsed
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string}> }) {
    try {
        const token = extractBearerToken(req.headers.get('authorization'))
        if (!token) {
            return unauthorized
        }

        const id = getQuizId(params)
        if (!id) {
            return badRequest("Invalid quiz id!")
        }

        const data = await apiRequest(`/quizzes${id}`, { token })

        return ok(data)
    } catch (err) {
        return handleRouteError(err, "GET /api/quizzes/[id]")
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const token = extractBearerToken(req.headers.get('authorization'))
        if (!token) {
            return unauthorized()
        }

        const id = await getQuizId(params)
        if (!id) {
            return badRequest("Invalid quiz id!")
        }

        const body: UpdateRequestBody = await req.json()

        const data = await apiRequest(`/quizzes/${id}`, {
            method: "PUT",
            body
        })

        return ok(data)
    } catch (err) {
        return handleRouteError(err, "PUT /api/quizzes/[id]")
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const token = extractBearerToken(req.headers.get('authorization'))
        if (!token) {
            return unauthorized()
        }

        const id = getQuizId(params)
        if (!id) {
            return badRequest("Invalid quiz id!")
        }

        const data = await apiRequest(`/quizzes/${id}`, {
            method: "DELETE",
            token
        })

        return ok(data)
    } catch (err) {
        return handleRouteError(err, "DELETE /api/quizzes/[id]")
    }
}