import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`${process.env.INTERNAL_API_URL}/health`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { status: "error", error: "Backend unreachable" },
      { status: 503 }
    );
  }
}