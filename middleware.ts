import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('toyla_token')?.value
  const { pathname } = request.nextUrl

  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/events') ||
    pathname.startsWith('/settings')
  const isLogin = pathname === '/login'

  if (isProtected && !token) return NextResponse.redirect(new URL('/login', request.url))
  if (isLogin && token) return NextResponse.redirect(new URL('/dashboard', request.url))
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/events/:path*', '/settings', '/login'],
}
