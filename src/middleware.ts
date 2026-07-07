import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const publicRoutes = ["/", "/login", "/register", "/api/auth"];

const roleRoutes: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  STAFF: "/dashboard/staff",
  CUSTOMER: "/dashboard/customer",
};

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionCookie && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Role-based route protection at the Edge
  if (sessionCookie && pathname.startsWith("/dashboard/")) {
    // Extract session data to get user role
    // We use the token to call the auth API for role verification
    try {
      const sessionResponse = await fetch(
        new URL("/api/auth/get-session", request.url),
        {
          headers: {
            cookie: request.headers.get("cookie") || "",
          },
        }
      );

      if (sessionResponse.ok) {
        const session = await sessionResponse.json();
        const userRole = session?.user?.role as string | undefined;

        if (userRole) {
          const allowedPrefix = roleRoutes[userRole];

          // Check if user is accessing their allowed route
          if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
            // Also allow base /dashboard (redirect page)
            if (pathname !== "/dashboard") {
              return NextResponse.redirect(
                new URL(allowedPrefix, request.url)
              );
            }
          }
        }
      }
    } catch {
      // If session check fails at the Edge, let the Layout handle it
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
