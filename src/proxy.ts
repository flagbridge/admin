import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const publicPaths = ["/login"];

function isPublicPath(pathname: string): boolean {
  const pathWithoutLocale = pathname.replace(/^\/(en|pt-BR)/, "");
  return publicPaths.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`),
  );
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get("fb_token")?.value;
  const { pathname } = request.nextUrl;

  // Skip API routes and static files
  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // If not authenticated and not on a public path, redirect to login
  if (!token && !isPublicPath(pathname)) {
    const loginUrl = new URL(`/en/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and on login page, redirect to dashboard
  if (token && isPublicPath(pathname)) {
    const dashboardUrl = new URL(`/en`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\.).*)"],
};
