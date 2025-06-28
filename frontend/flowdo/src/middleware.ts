import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of paths that require authentication
const protectedPaths = ['/dashboard', '/tasks', '/pomodoro', '/profile'];

// List of paths that should redirect if user is already authenticated
const authPaths = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if path needs protection
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAuthPath = authPaths.some(path => pathname === path);
  
  // Get authentication status from cookies
  const authCookie = request.cookies.has('auth');
  
  // If trying to access protected path without auth, redirect to login
  if (isProtectedPath && !authCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If trying to access auth paths while already logged in, redirect to dashboard
  if (isAuthPath && authCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

// Configure to match specific paths
export const config = {
  matcher: [...protectedPaths, ...authPaths],
}; 