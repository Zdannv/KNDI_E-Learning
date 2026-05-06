import { apiRequest, extractBearerToken } from "@/app/lib/api-client";
import { badRequest, handleRouteError, ok } from "@/app/lib/route-helper";
import { unauthorized } from "next/navigation";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const token = extractBearerToken(req.headers.get('authorization'))
        if (!token) {
            return unauthorized()
        }

        const { id } = await params
        const questionId = parseInt(id)
        if (!id) {
            return badRequest("Invalid question id!")
        }

        const data = await apiRequest(`/questions/${questionId}`, {
            method: "DELETE",
            token
        })

        return ok(data)
    } catch (err) {
        return handleRouteError(err, "DELETE /questions/[id]")
    }
}