import { apiRequest } from "@/app/lib/api-client";
import { badRequest, created, handleRouteError } from "@/app/lib/route-helper";
import { NextRequest, NextResponse } from "next/server";

interface RegisterRequestBody {
    username: string
    email: string
    password: string
    role: string
}

export async function POST(req: NextRequest) {
    try {
        const body: RegisterRequestBody = await req.json()
        const missing: string[] = []

        if (!body.username) missing.push("username")
        if (!body.email) missing.push("email")
        if (!body.password) missing.push("password")
        if (!body.role) missing.push("role")

        if (missing.length > 0) {
            return badRequest(`Missing required fields: ${missing.join(", ")}`)
        }

        if (body.role !== "sensei" && body.role !== "student") {
            return badRequest("User role must be 'sensei' or 'student'")
        }

        const data = await apiRequest("/auth/register", {
            method: "POST",
            body
        })

        return created(data)
    } catch (err) {
        return handleRouteError(err, "POST /api/auth/register")
    }
}