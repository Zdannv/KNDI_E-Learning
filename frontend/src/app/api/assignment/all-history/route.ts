import { apiRequest, extractBearerToken } from "@/app/lib/api-client";
import { handleRouteError, ok, unauthorized } from "@/app/lib/route-helper";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
    const token = extractBearerToken(req.headers.get("authorization"))
    if (!token) {
        return unauthorized()
    }

    try {
        const data = await apiRequest("/assignments/all-history", { token })
        return ok(data)
    } catch (err) {
        return handleRouteError(err, "GET /assignments/all-history")
    }
}
