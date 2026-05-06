import { apiRequest } from "@/app/lib/api-client"
import { badRequest, ok, handleRouteError } from "@/app/lib/route-helper"
import { NextRequest } from "next/server"

interface LoginRequestBody {
    username: string
    password: string
}

export async function POST(req: NextRequest) {
    try {
        const body: LoginRequestBody = await req.json()

        if (!body.username || !body.password) {
            return badRequest("Username and password is required!")
        }

        const data = await apiRequest("/auth/login", {
            method: "POST",
            body
        })

        return ok(data)
    } catch (err) {
        return handleRouteError(err, "POST /api/auth/login")
    }
}