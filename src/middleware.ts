import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = ['/', '/auth/login', '/auth/register', '/auth/onboarding']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isPublic = PUBLIC_ROUTES.some(route => req.nextUrl.pathname === route)

  // Not logged in trying to access protected route
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  // Already logged in trying to access auth pages
  if (session && (req.nextUrl.pathname.startsWith('/auth') || req.nextUrl.pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox-.*|.*\\.png$).*)',
  ],
}
