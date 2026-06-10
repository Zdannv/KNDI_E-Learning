import { apiRequest, extractBearerToken } from "@/app/lib/api-client";
import { handleRouteError, ok, unauthorized } from "@/app/lib/route-helper";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const token = extractBearerToken(req.headers.get('authorization'))
        if (!token) {
            return unauthorized()
        }

        const data = await apiRequest("/assignments/pending-essay", { token })
        
        return ok(data)
    } catch (err) {
        return handleRouteError(err, "GET /assignments/pending-essay")
    }
}