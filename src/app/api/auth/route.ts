'use server';
import jwt from 'jsonwebtoken';
import { apiBaseURL, isProduction, secretJWTKey, mdsBaseURL, isP } from '@/app/globalVariables';
import { cookies } from 'next/headers';
import { cookieName } from '@/app/globalVariables';
import { NextRequest, NextResponse } from 'next/server';

export async function checkCookies(): Promise<false | { id: any; password: any; }> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(cookieName);
    if (!cookie) return false;
    const { id, password } : any = jwt.verify(cookie.value, secretJWTKey );
    if(!id || !password) return false;
    return {id, password};
}


async function checkCredentials(repositoryId:string, password:string): Promise<boolean> {
    const credentials = `${repositoryId}:${password}`;

     const response = await fetch(`${apiBaseURL}/dois`, {
        method: "PUT",
        headers: {
          "Authorization": "Basic " + Buffer.from(credentials).toString('base64'),
          "Accept": "application/json",
        },
      });

      if (response.ok) {
        console.log("Credentials are valid.");
        return true;
      } else {

        console.error("Authentication failed:", response.status, response.statusText);
        return false;
      }
}

export async function  HEAD(req:NextRequest) {

    if (!!(await checkCookies()))return NextResponse.json({user:true}, {status:200});

    return new NextResponse(null, { status: 401, statusText: 'Not Authorized' });
}

export async function  DELETE(req:NextRequest) {
    const cookieStore = await cookies();
    cookieStore.delete(cookieName);
    return NextResponse.json({status:'Signed Out'})
}

async function checkDataCiteCredentials(repoId: string, password: string): Promise<boolean> {

  try {
    const response = await fetch(`${mdsBaseURL}/doi`, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa(`${repoId}:${password}`),
        'Content-Type': 'application/json',
      },
    });

    console.log('response', response)
    if (response.ok) {
      return true;
    }

    if (response.status === 401 || response.status === 403) {
      return false;
    }
    throw new Error(`Unexpected response status: ${response.status}`);
  } catch (error) {

    throw error;
  }
}




export async function POST(req:NextRequest) {
    console.log("ISP", isP)
    const data =await req.json();

    console.log('Secret', secretJWTKey);
    console.log('SecretAgain', process.env.SECRET_KEY);

    // const isAuthenticated = await checkCredentials(data.id, data.password);
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