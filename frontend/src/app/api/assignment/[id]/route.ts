import { apiRequest, extractBearerToken } from "@/app/lib/api-client"
import { badRequest, handleRouteError, ok } from "@/app/lib/route-helper"
import { unauthorized } from "next/navigation"
import { NextRequest } from "next/server"

async function getAssignmentId(params: Promise<{ id: string }>): Promise<number | null> {
    const { id } = await params
    const parsed = parseInt(id, 10)
    if (isNaN(parsed) || parsed <= 0) {
        return null
    }

    return parsed
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const token = extractBearerToken(req.headers.get('authorization'))
        if (!token) {
            return unauthorized()
        }

        const id = await getAssignmentId(params)
        if (!id) {
            return badRequest("Invalid assignment id")
        }

        const data = await apiRequest(`/assignments/${id}`, { token })

        return ok(data)
    } catch (err) {
        return handleRouteError(err, "GET /assignments/[id]")
    }
}