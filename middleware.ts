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
    "/api/listings",
    "/api/transactions",
    "/api/users",
  ]
  
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )
  
  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/list-item",
    "/profile/:path*",
    "/api/listings",
    "/api/transactions",
    "/api/users",
  ],
} 