import { NextRequest, NextResponse } from "next/server"

const COOKIE_SESSION = "app_session"
const COOKIE_ROLE = "app_role"

const AUTH_ONLY_ROUTE = ["/login", "/register"]
const SENSEI_ONLY_PREFIXES = ["/admin"]

const PROTECTED_PREFIXES = [
    "/dashboard",
    "/courses",
    "/kuis",
    "/riwayat",
    "/admin"
]

function isAuthOnlyRoute(pathname: string): boolean {
    return AUTH_ONLY_ROUTE.some(
        (r) => pathname === r || pathname.startsWith(`${r}/`)
    )
}

function isSenseiOnlyRoute(pathname: string): boolean {
    return SENSEI_ONLY_PREFIXES.some(
        (r) => pathname === r || pathname.startsWith(`${r}/`) 
    )
}

function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_PREFIXES.some(
        (r) => pathname === r || pathname.startsWith(`${r}/`) 
    )
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.startsWith(".")
    ) {
        return NextResponse.next()
    }

    const sessionCookie = req.cookies.get(COOKIE_SESSION)
    const roleCookie = req.cookies.get(COOKIE_ROLE)
    const isLoggedIn = Boolean(sessionCookie?.value)
    const role = roleCookie?.value ?? ""

    if (isLoggedIn && isAuthOnlyRoute(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    if (!isLoggedIn && isProtectedRoute(pathname)) {
        const url = new URL("/login", req.url)
        url.searchParams.set("from", pathname)
        return NextResponse.redirect(url)
    }

    if (isLoggedIn && isSenseiOnlyRoute(pathname) && role !== "sensei") {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)"
    ]
}