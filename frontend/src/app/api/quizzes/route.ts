import { apiRequest, extractBearerToken } from "@/app/lib/api-client";
<<<<<<< HEAD
import { badRequest, created, handleRouteError, ok, unauthorized } from "@/app/lib/route-helper";
=======
import { badRequest, created, handleRouteError, ok } from "@/app/lib/route-helper";
import { unauthorized } from "next/navigation";
>>>>>>> 9f8d6d7 (feat: Added quizzes route)
import { NextRequest } from "next/server";

interface CreateRequestBody {
    title: string
    description?: string
}

export async function GET(req: NextRequest) {
    try {
        const token = extractBearerToken(req.headers.get('authorization'))
        if (!token) {
            return unauthorized()
        }

        const data = await apiRequest("/quizzes", { token })

        return ok(data)
    } catch (err) {
        return handleRouteError(err, "GET /quizzes")
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = extractBearerToken(req.headers.get('authorization'))
        if (!token) {
            return unauthorized()
        }

        const body: CreateRequestBody = await req.json()

        if (!body.title?.trim()) {
            return badRequest("Quiz title is required!")
        }

        const data = await apiRequest("/quizzes", {
            method: "POST",
            body,
            token
        })

        return created(data)
    } catch (err) {
        return handleRouteError(err, "POST /api/quizzes")
    }
}