import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAppHostname, normalizeHostname } from "@/lib/domains";

const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const customDomainAllowedPathname = (pathname: string) =>
  pathname === "/" ||
  pathname === "/robots.txt" ||
  pathname === "/sitemap.xml" ||
  pathname === "/favicon.ico" ||
  pathname.startsWith("/_next/") ||
  pathname.startsWith("/api/public/page-view");

export default clerkMiddleware(async (auth, req) => {
  const hostname = normalizeHostname(
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? ""
  );
  const isCustomDomainRequest = Boolean(hostname) && !isAppHostname(hostname);

  if (isCustomDomainRequest && !customDomainAllowedPathname(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isDashboardRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
