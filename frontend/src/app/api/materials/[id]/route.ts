import { apiRequest, extractBearerToken } from "@/app/lib/api-client";
import { badRequest, handleRouteError, ok, unauthorized } from "@/app/lib/route-helper";
import { NextRequest } from "next/server";

interface UpdateRequestBody {
    name: string
    description?: string
    file_path: string
}

async function getMaterialById(params: Promise<{ id: string }>): Promise<number | null> {
    const { id } = await params
    const parsed = parseInt(id, 10)

    if (isNaN(parsed) || parsed <= 0) {
        return null
    }

    return parsed
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const token = extractBearerToken(req.headers.get('authorization'))
        if (!token) {
            return unauthorized()
        }

        const id = await getMaterialById(params)
        if (!id) {
            return badRequest("Invalid material id!")
        }

        const data = await apiRequest(`/materials/${id}`, { token })

        return ok(data)
    } catch (err) {
        return handleRouteError(err, "GET /api/materials/[id]")
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const token = extractBearerToken(req.headers.get('authoization'))
        if (!token) {
            return unauthorized()
        }

        const id = await getMaterialById(params)
        if (!id) {
            return badRequest("Invalid material id!")
        }

        const body: UpdateRequestBody = await req.json()
        if (!body.name?.trim()) {
            return badRequest("Material name is required!")
        }

        const data = await apiRequest(`/materials/${id}`, {
            method: "PUT",
            body
        })

        return ok(data)
    } catch (err) {
        return handleRouteError(err, "PUT /api/materials/[id]")
    }
}

export async function DELETE(req:NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const token = extractBearerToken(req.headers.get('authorization'))
        if (!token) {
            return unauthorized()
        }

        const id = await getMaterialById(params)
        if (!id) {
            return badRequest("Invalid material id!")
        }

        const data = await apiRequest(`/materials/${id}`, {
            method: "DELETE",
        })

        return ok(data)
    } catch (err) {
        return handleRouteError(err, "DELETE /api/materials/[id]")
    }
}