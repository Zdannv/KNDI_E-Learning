import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.INTERNAL_API_URL

  if (!backendUrl) {
    return NextResponse.json(
      { "status": "error", "error": "Environtment variable is not set" },
      { status: 503 }
    )
  }
  
  try {
    const res = await fetch(`${backendUrl.replace(/\/$/, "")}/health`, {
      signal: AbortSignal.timeout(5000)
    })

    const data = await res.json()

    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json(
      { "status": "error", error: "Backend unreachable" },
      { status: 503}
    )
  }
}