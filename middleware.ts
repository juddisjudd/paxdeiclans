import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CACHE_MAX_AGE = 60;
const STALE_WHILE_REVALIDATE = 30;

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
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, Authorization"
  );
}

function setSecurityHeaders(response: NextResponse): void {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    setCorsHeaders(response);
    return response;
  }

  if (pathname.startsWith("/api/clans")) {
    const referer = request.headers.get("referer") || "";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

    if (!referer.includes(siteUrl) && request.method !== "GET") {
      return NextResponse.json(
        { error: "Unauthorized request" },
        { status: 401 }
      );
    }

    const response = NextResponse.next();

    if (request.method === "GET") {
      response.headers.set(
        "Cache-Control",
        `public, max-age=${CACHE_MAX_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`
      );
      const etag = `"${Date.now().toString(36)}"`;
      response.headers.set("ETag", etag);
    }

    setSecurityHeaders(response);
    setCorsHeaders(response);

    return response;
  }

  const response = NextResponse.next();
  setSecurityHeaders(response);
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
