import { NextResponse, type NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const locale = pathname.match(/^\/(es|en|fr)(?:\/|$)/)?.[1] ?? 'en'
  const headers = new Headers(request.headers)
  headers.set('x-portfolio-locale', locale)
  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
