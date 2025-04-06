'use server';
import jwt from 'jsonwebtoken';
import {  isProduction, secretJWTKey } from '@/app/globalVariables';
import { cookies } from 'next/headers';
import { cookieName } from '@/app/globalVariables';
import { NextRequest, NextResponse } from 'next/server';
import { checkCookies, checkDataCiteCredentials } from './utils';





export async function  HEAD(req:NextRequest) {

    if (!!(await checkCookies()))return NextResponse.json({user:true}, {status:200});

    return new NextResponse(null, { status: 401, statusText: 'Not Authorized' });
}

export async function  DELETE(req:NextRequest) {
    const cookieStore = await cookies();
    cookieStore.delete(cookieName);
    return NextResponse.json({status:'Signed Out'})
}

// async function checkDataCiteCredentials(repoId: string, password: string): Promise<boolean> {

//   try {
//     const response = await fetch(`${mdsBaseURL}/doi`, {
//       method: 'GET',
//       headers: {
//         'Authorization': 'Basic ' + btoa(`${repoId}:${password}`),
//         'Content-Type': 'application/json',
//       },
//     });

//     if (response.ok) {
//       return true;
//     }

//     if (response.status === 401 || response.status === 403) {
//       return false;
//     }
//     throw new Error(`Unexpected response status: ${response.status}`);
//   } catch (error) {

//     throw error;
//   }
// }




export async function POST(req:NextRequest) {
    const data =await req.json();

    const isAuthenticated = await checkDataCiteCredentials(data.id, data.password);
    if (isAuthenticated) {
      const jwtToken = jwt.sign(data, secretJWTKey , { expiresIn: '1h' });
      const cookieStore = await cookies();
      cookieStore.set(cookieName, jwtToken, {
        path: '/',
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      });
      return NextResponse.json({ data: 'Authenticated' }, {status:201});
    }
    return NextResponse.json({ data: 'Please confirm your login credentials'}, { status: 401 });
  }