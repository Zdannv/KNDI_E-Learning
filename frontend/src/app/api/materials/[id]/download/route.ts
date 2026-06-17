import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            return new NextResponse("Invalid material id", { status: 400 });
        }

        // Get token from Authorization header or from token query param
        let token = req.nextUrl.searchParams.get("token");
        if (!token) {
            const authHeader = req.headers.get("authorization");
            if (authHeader) {
                const parts = authHeader.split(" ");
                if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
                    token = parts[1];
                }
            }
        }

        if (!token) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const backendUrl = (process.env.INTERNAL_API_URL || "http://backend:8080/api").replace(/\/$/, "");
        const downloadUrl = `${backendUrl}/materials/${parsedId}/download?token=${token}`;

        const backendRes = await fetch(downloadUrl);
        if (!backendRes.ok) {
            return new NextResponse("Failed to download file from backend", { status: backendRes.status });
        }

        // Pipe headers
        const headers = new Headers();
        headers.set("Content-Disposition", backendRes.headers.get("Content-Disposition") || "attachment");
        headers.set("Content-Type", backendRes.headers.get("Content-Type") || "application/octet-stream");
        if (backendRes.headers.get("Content-Length")) {
            headers.set("Content-Length", backendRes.headers.get("Content-Length")!);
        }

        // Return the file stream
        return new NextResponse(backendRes.body, {
            status: 200,
            headers,
        });
    } catch (err) {
        console.error("Download route error:", err);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
