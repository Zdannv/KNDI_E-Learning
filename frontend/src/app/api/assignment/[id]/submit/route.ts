import { apiRequest, extractBearerToken } from "@/app/lib/api-client";
import { badRequest, handleRouteError, ok } from "@/app/lib/route-helper";
import { unauthorized } from "next/navigation";
import { NextRequest } from "next/server";

interface SubmitAnswerBody {
    question_id: number
    question_option_id?: number
    question_card_id?: number
    selected_card?: number
    answer_text?: string
}

interface SubmitAssignmentBody {
    answer: SubmitAnswerBody[]
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const token = extractBearerToken(req.headers.get('authorization'))
        if (!token) {
            return unauthorized()
        }

        const { id } = await params
        const assignmentId = parseInt(id, 10)
        if (isNaN(assignmentId) || assignmentId <= 0) {
            return badRequest("Invalid assignment id!")
        }

        const body: SubmitAssignmentBody = await req.json()

        if (!body.answer || !Array.isArray(body.answer)) {
            return badRequest("Request body must contain an answers")
        }

        const data = await apiRequest(`/assignments/${id}/submit`, {
            method: "POST",
            body,
            token
        })

        return ok(data)
    } catch (err) {
        return handleRouteError(err, "POST /assignments/[id]/submit")
    }
}