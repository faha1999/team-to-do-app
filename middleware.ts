import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((request) => {
  const isAuthPage = request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");

  if (request.auth?.user && isAuthPage) {
    return NextResponse.redirect(new URL("/app", request.nextUrl.origin));
  }

  if (!request.auth?.user && request.nextUrl.pathname.startsWith("/app")) {
    const signInUrl = new URL("/login", request.nextUrl.origin);
    signInUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/app/:path*", "/login", "/register"],
};
