import {  NextResponse } from 'next/server';
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const response = await fetch(new URL('/api/auth', request.url), {
      method: 'HEAD',
      headers: {
        Cookie: request.headers.get('cookie') || '',
      },
    });

    console.log('Auth API response status:', response.status);
    console.log(response)
    if (response.ok) {
      return NextResponse.next();
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
  }
  
  console.log('Redirecting to /auth/login');

  // return NextResponse.rewrite(new URL('/auth/login', request.url), {status:303})
  return NextResponse.redirect(new URL('/auth/login', request.url), {status:303});

}


export const config = {
  matcher: '/doi/:path*',
};
