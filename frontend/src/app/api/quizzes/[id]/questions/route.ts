import { apiRequest, extractBearerToken } from "@/app/lib/api-client"
import { badRequest, created, handleRouteError, unauthorized } from "@/app/lib/route-helper"
import { NextRequest } from "next/server"

interface MatchingCardBody {
    left_text: string
    left_image_url?: string
    left_audio_url?: string
    right_text: string
    right_image_url?: string
    right_audio_url?: string
}

interface OptionsBody {
    option_text: string
    image_url?: string
    audio_url?: string
    is_correct: boolean
}

interface QuestionRequestBody {
    question_text: string
    question_type: 1 | 2 | 3 | 4
    correct_answer?: string
    image_url?: string
    audio_url?: string
    point: number
    order_number: number
    options?: OptionsBody[]
    matching_cards?: MatchingCardBody[]
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const token = extractBearerToken(req.headers.get('authorization'))
        if (!token) {
            return unauthorized()
        }

        const { id } = await params
        const quizId = parseInt(id, 10)
        if (isNaN(quizId) || quizId <= 0) {
            return badRequest("Invalid quiz id!")
        }

        const body: QuestionRequestBody[] = await req.json()
        if (!Array.isArray(body) || body.length === 0 ) {
            return badRequest("Question is required!")
        }

        for (let i = 0; i < body.length; i++) {
            const q = body[i]
            if (!q.question_text?.trim() && !q.image_url && !q.audio_url) {
                return badRequest(`Question text, image, or audio is required at question ${i}`)
            }

            if (![1, 2, 3, 4].includes(q.question_type)) {
                return badRequest(`Question type must be matching card, short answer, or mulitple choice at question ${i}`)
            }
        }

        const data = await apiRequest(`/quizzes/${id}/questions`, {
            method: "POST",
            body,
            token
        })

        return created(data)
    } catch (err) {
        return handleRouteError(err, "/api/quizzes/[id]/questions")
    }
}