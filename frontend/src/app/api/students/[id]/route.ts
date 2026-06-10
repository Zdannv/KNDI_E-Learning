import { apiRequest, extractBearerToken } from "@/app/lib/api-client";
import { handleRouteError, ok, unauthorized } from "@/app/lib/route-helper";
import { NextRequest } from "next/server";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const token = extractBearerToken(req.headers.get('authorization'))
        if (!token) {
            return unauthorized()
        }

        const { id } = await params

        const data = await apiRequest(`/students/${id}`, {
            method: "DELETE",
            token
        })

        return ok(data)
    } catch (err) {
        return handleRouteError(err, "DELETE /api/students/[id]")
    }
}
