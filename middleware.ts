import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/api/auth/login',
    '/api/auth/register',
    '/api/health'
  ];

  // Check if the path is public
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value;

  // Debug logging for development
  if (process.env.NODE_ENV === 'development' && pathname.startsWith('/api/')) {
    console.log(`[Middleware] ${request.method} ${pathname} - Token: ${token ? 'present' : 'missing'}`);
  }

  if (!token) {
    // Redirect to login if no token
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify token
    const payload = await verifyToken(token);
    
    // Check admin routes
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      if (payload.role !== 'admin') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { success: false, error: 'Admin access required' },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL('/user/dashboard', request.url));
      }
    }

    // Check user routes
    if (pathname.startsWith('/user') || pathname.startsWith('/api/elections') || pathname.startsWith('/api/candidates') || pathname.startsWith('/api/vote') || pathname.startsWith('/api/results')) {
      if (!payload.userId) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { success: false, error: 'Invalid user session' },
            { status: 401 }
          );
        }
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    // Forward auth context to route handlers via request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-email', payload.email);
    requestHeaders.set('x-user-role', payload.role);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    
  } catch (error) {
    // Invalid token - redirect to login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};