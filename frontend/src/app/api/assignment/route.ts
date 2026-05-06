import { apiRequest, extractBearerToken } from "@/app/lib/api-client";
import { badRequest, created, handleRouteError } from "@/app/lib/route-helper";
import { unauthorized } from "next/navigation";
import { NextRequest } from "next/server";

interface StartAssignmentBody {
    quiz_id: number
}

export async function POST(req: NextRequest) {
    try {
        const token = extractBearerToken(req.headers.get('authorization'))
        if (!token) {
            return unauthorized()
        }

        const body: StartAssignmentBody = await req.json()
        if (!body.quiz_id || body.quiz_id <= 0) {
            return badRequest("Quiz id is required!")
        }

        const data = await apiRequest("/assignments", {
            method: "POST",
            body,
            token
        })

        return created(data)
    } catch (err) {
        return handleRouteError(err, "/api/assignments")
    }
}