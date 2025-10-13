import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    // Verify and extract payload
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    const role = payload.role as string;

    // --- Route protection by role ---
    const path = req.nextUrl.pathname;

    // Admin routes
    if (path.startsWith("/adminDashboard") && role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (path.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Student routes
    if (path.startsWith("/studentDashboard") && role !== "student") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (path.startsWith("/student/results/") && role !== "student") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (path.startsWith("/examInterface") && role !== "student") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Teacher routes (Later things)
    // if (path.startsWith("/teacherDashboard") && role !== "teacher") {
    //   return NextResponse.redirect(new URL("/login", req.url));
    // }

    return NextResponse.next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/studentDashboard/:path*",
    "/adminDashboard/:path*",
    "/student/results/:path*",
    "/examInterface/:path*",
  ],
};
