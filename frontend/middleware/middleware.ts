import { NextRequest, NextResponse } from "next/server"

export const AUTH_COOKIE = "kndi_session"

const PROTECTED_PREFIXES = [
    "/",
    "/materi",
    "/kuis",
    "/riwayat",
    "/admin"
]

const AUTH_ROUTES = ["/login", "/register"]

function isProtecte(pathname: string): boolean {
    return PROTECTED_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
}

function isAuthOnly(pathname: string): boolean {
    return AUTH_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    )
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    if (
        pathname.startsWith("_next") ||
        pathname.startsWith("/api") ||
        pathname.includes(".")
    ) {
        return NextResponse.next()
    }

    const session = req.cookies.get(AUTH_COOKIE)
    const isLoggedIn = Boolean(session?.value)

    if (!isLoggedIn && isProtecte(pathname)) {
        const loginUrl = new URL("/login", req.url)
        loginUrl.searchParams.set("from", pathname)
        return NextResponse.redirect(loginUrl)
    }

    if (isLoggedIn && isAuthOnly(pathname)) {
        return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)"
    ]
} 