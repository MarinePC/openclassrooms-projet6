// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_COOKIE = "sportsee_token";

export function middleware(req: NextRequest) {
  const token = req.cookies.get(TOKEN_COOKIE)?.value;

  // ✅ AJOUTE ÇA ICI (debug)
  console.log("[middleware] path:", req.nextUrl.pathname);
  console.log("[middleware] cookie header:", req.headers.get("cookie"));
  console.log("[middleware] token:", token ? "YES" : "NO");

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
