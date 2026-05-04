import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        const { username, email, password, role } = body;
        
        if (!username || !email || !password || !role) {
            return NextResponse.json(
                {
                    status: "error",
                    error: "username, email, password, role are required!"
                },
                {
                    status: 400
                }
            );
        }

        console.log("INTERNAL_API_URL:", process.env.INTERNAL_API_URL)

        const res = await fetch(`${process.env.INTERNAL_API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, role })
        });

        const data = await res.json()

        return NextResponse.json(data, { status: res.status })
    } catch (error) {
        return NextResponse.json(
            { status: "error", error: "Internal Server Error" },
            { status: 500 }
        )
    }
}