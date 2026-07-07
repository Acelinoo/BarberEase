import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const publicRoutes = ["/", "/login", "/register", "/api/auth"];

const roleBaseRoutes: Record<string, string> = {
  ADMIN: "/admin",
  STAFF: "/staff",
  CUSTOMER: "/dashboard",
};

// Define allowed prefixes for each role
const roleAllowedPrefixes: Record<string, string[]> = {
  ADMIN: ["/admin"],
  STAFF: ["/staff"],
  CUSTOMER: ["/dashboard", "/booking", "/my-bookings"],
};

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isProtectedRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/booking") ||
    pathname.startsWith("/my-bookings") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/admin")
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

  // Fetch session data to get user role if needed for routing
  let userRole: string | undefined = undefined;
  if (sessionCookie && (pathname === "/login" || pathname === "/register" || isProtectedRoute(pathname))) {
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
        userRole = session?.user?.role as string | undefined;
      }
    } catch {
      // Ignore edge fetch error
    }
  }

  if (sessionCookie && (pathname === "/login" || pathname === "/register")) {
    const redirectPath = userRole ? (roleBaseRoutes[userRole] || "/dashboard") : "/dashboard";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // Role-based route protection
  if (sessionCookie && userRole && isProtectedRoute(pathname)) {
    const allowedPrefixes = roleAllowedPrefixes[userRole] || roleAllowedPrefixes["CUSTOMER"];
    
    const isAllowed = allowedPrefixes.some((prefix) => 
      pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    if (!isAllowed) {
      return NextResponse.redirect(new URL(roleBaseRoutes[userRole] || "/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
