import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function setCorsHeaders(response: NextResponse): void {
  response.headers.set("Access-Control-Allow-Credentials", "true");
  response.headers.set(
    "Access-Control-Allow-Origin",
    process.env.NEXT_PUBLIC_SITE_URL || ""
  );
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date"
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/api/clans")) {
    const referer = request.headers.get("referer") || "";
    if (!referer.includes(process.env.NEXT_PUBLIC_SITE_URL || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const response = NextResponse.next();
    setCorsHeaders(response);
    return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
