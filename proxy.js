import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Role-based entry redirects
    if (pathname === "/") {
      if (token?.role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.next();
    }

    // Prevent logged-in users from seeing login page again
    if (pathname === "/login" && token) {
      const destination =
        token.role === "admin" ? "/admin/dashboard" : "/user-dashboard";
      return NextResponse.redirect(new URL(destination, req.url));
    }

    // Protect admin routes
    if (pathname.startsWith("/admin")) {
      if (!token || token.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
