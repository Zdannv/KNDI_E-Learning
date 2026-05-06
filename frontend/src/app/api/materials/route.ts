import { apiRequest, extractBearerToken } from "@/app/lib/api-client";
import { badRequest, created, handleRouteError, ok, unauthorized } from "@/app/lib/route-helper";
import { NextRequest } from "next/server";

interface CreateMaterialBody {
    name: string
    description?: string
    file_path?: string
}

export async function GET(req: NextRequest) {
    try {
        const token = extractBearerToken(req.headers.get('Authorization'))
        if (!token) {
            return unauthorized()
        }

        const data = await apiRequest("/materials", { token: token })
        
        return ok(data)
    } catch (err) {
        return handleRouteError(err, "GET /api/materials")
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = extractBearerToken(req.headers.get('Authorization'))
        if (!token) {
            return unauthorized()
        }

        const body: CreateMaterialBody = await req.json()

        if (!body.name?.trim()) {
            return badRequest("Material name is required!")
        }

        const data = await apiRequest("/materials", {
            method: "POST",
            body
        })

        return created(data)
    } catch (err) {
        return handleRouteError(err, "POST /api/materials")
    }
}