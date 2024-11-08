import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/clans')) {
    const referer = request.headers.get('referer')
    
    if (!referer?.includes(process.env.NEXT_PUBLIC_SITE_URL || '')) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*'
}