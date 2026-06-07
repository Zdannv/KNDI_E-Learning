import { apiRequest, extractBearerToken } from "@/app/lib/api-client"
import { badRequest, handleRouteError, ok, unauthorized } from "@/app/lib/route-helper"
import { NextRequest } from "next/server"

interface UpdateOptionBody {
    option_text: string
    image_url?: string
    audio_url?: string
    is_correct: boolean
}

interface UpdateMatchingCardBody {
    left_text: string
    left_image_url?: string
    left_audio_url?: string
    right_text: string
    right_image_url?: string
    right_audio_url?: string
}

interface UpdateQuestionBody {
    question_text: string
    correct_answer?: string
    image_url?: string
    audio_url?: string
    point: number
    order_number: number
    options?: UpdateOptionBody[]
    matching_cards?: UpdateMatchingCardBody[]
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = extractBearerToken(req.headers.get('authorization'))
        if (!token) {
            return unauthorized()
        }

        const { id } = await params
        const questionId = parseInt(id, 10)
        if (isNaN(questionId) || questionId <= 0) {
            return badRequest("Invalid question id!")
        }

        const body: UpdateQuestionBody = await req.json()

        if (!body.question_text?.trim()) {
            return badRequest("Question text is required!")
        }

        const data = await apiRequest(`/questions/${questionId}`, {
            method: "PUT",
            body,
            token,
        })

        return ok(data)
    } catch (err) {
        return handleRouteError(err, "PUT /api/questions/[id]")
    }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = extractBearerToken(req.headers.get("authorization"))
        if (!token) {
            return unauthorized()
        }

        const { id } = await params
        const questionId = parseInt(id, 10)
        if (isNaN(questionId) || questionId <= 0) {
            return badRequest("Invalid question id!")
        }

        const body: UpdateQuestionBody = await req.json()

        if (!body.question_text?.trim()) {
            return badRequest("Question text is required!")
        }

        const data = await apiRequest(`/questions/${questionId}`, {
            method: "PUT",
            body,
            token,
        })

        return ok(data)
    } catch (err) {
        return handleRouteError(err, "DELETE /api/questions/[id]")
    }
}