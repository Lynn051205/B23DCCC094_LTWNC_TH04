import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";
import { can } from "@/lib/permissions";

export async function proxy(request: NextRequest) {
  if (request.method === "POST" && request.headers.has("next-action")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && !can(token.role ?? "guest", "create_deadline")) {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
