import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const session = await auth()
  
  // Protect routes that require authentication
  const protectedPaths = [
    "/dashboard",
    "/list-item",
    "/profile",
    "/admin",
    "/api/listings",
    "/api/transactions",
    "/api/users",
  ]
  
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )
  
  if (isProtectedPath && !session) {
    // Store the original URL to redirect back after login
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // If user is authenticated and trying to access login/register pages, redirect to dashboard
  if (session && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/list-item",
    "/profile/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/api/listings",
    "/api/transactions",
    "/api/users",
  ],
} 