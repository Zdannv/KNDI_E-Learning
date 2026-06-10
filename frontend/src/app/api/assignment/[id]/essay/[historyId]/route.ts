import { apiRequest, extractBearerToken } from "@/app/lib/api-client";
import { badRequest, handleRouteError, ok, unauthorized } from "@/app/lib/route-helper";
import { NextRequest } from "next/server";

interface GradeEssayBody {
    score: number
}

export async function PUT(
    req: NextRequest, 
    { params }: { params: Promise<{ id: string; historyId: string }> }
) {
    try {
        const token = extractBearerToken(req.headers.get("authorization"))
        if (!token) {
            return unauthorized()
        }

        const { id, historyId } = await params

        const assignmentId = parseInt(id, 10)
        if (isNaN(assignmentId) || assignmentId <= 0) {
            return badRequest("Invalid assignment id")
        }

        const historyIdNum = parseInt(historyId, 10)
        if (isNaN(historyIdNum) || historyIdNum <= 0) {
            return badRequest("Invalid assignment history Id")
        }

        const body: GradeEssayBody = await req.json()
        if (typeof body.score !== "number" || body.score <= 0 || body.score >= 100) {
            return badRequest("Score must be a number between 0 and 100")
        }

        const data = await apiRequest(
            `/assignments/${assignmentId}/essay/${historyIdNum}`,
            { method: "PUT", body, token }
        )

        return ok(data)
    } catch (err) {
        return handleRouteError(err, "PUT /assignments/[id]/essay/[historyId]")
    }
}