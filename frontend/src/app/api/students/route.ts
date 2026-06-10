import { apiRequest, extractBearerToken } from "@/app/lib/api-client";
import { badRequest, created, handleRouteError, ok, unauthorized } from "@/app/lib/route-helper";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const token = extractBearerToken(req.headers.get('authorization'))
        if (!token) {
            return unauthorized()
        }

        const data = await apiRequest("/students", { token })

        return ok(data)
    } catch (err) {
        return handleRouteError(err, "GET /students")
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = extractBearerToken(req.headers.get('authorization'))
        if (!token) {
            return unauthorized()
        }

        const body = await req.json()

        if (!body.username?.trim()) {
            return badRequest("Username is required!")
        }
        if (!body.email?.trim()) {
            return badRequest("Email is required!")
        }
        if (!body.password?.trim()) {
            return badRequest("Password is required!")
        }

        const data = await apiRequest("/students", {
            method: "POST",
            body,
            token
        })

        return created(data)
    } catch (err) {
        return handleRouteError(err, "POST /api/students")
    }
}
