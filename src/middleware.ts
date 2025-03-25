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

    if (response.ok) {
      return NextResponse.next();
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
  }

  return NextResponse.redirect(new URL('/auth/login', request.url), {status:303});

}


export const config = {
  matcher: '/doi/:path*',
};
