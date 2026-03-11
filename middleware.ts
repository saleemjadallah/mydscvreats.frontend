import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isEmbedRoute = createRouteMatcher(["/embed(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isDashboardRoute(req)) {
    await auth.protect();
  }

  const response = NextResponse.next();
  const isLegacyEmbedRequest = req.nextUrl.searchParams.get("embed") === "1";

  if (req.nextUrl.pathname.startsWith("/api") || req.nextUrl.pathname.startsWith("/trpc")) {
    return response;
  }

  if (isEmbedRoute(req) || isLegacyEmbedRequest) {
    response.headers.set("Content-Security-Policy", "frame-ancestors *");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    return response;
  }

  response.headers.set("Content-Security-Policy", "frame-ancestors 'none'");
  response.headers.set("X-Frame-Options", "DENY");

  return response;
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
