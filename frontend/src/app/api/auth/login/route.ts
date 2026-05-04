import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    const body = await req.json();

    const res = await fetch(`${process.env.INTERNAL_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    })

    const data = await res.json()

    if (!res.ok) {
        return NextResponse.json(data, { status: res.status })
    }

    return NextResponse.json(data);
}