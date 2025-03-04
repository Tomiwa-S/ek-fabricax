'use server';

import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const API_BASE_URL =
  process.env.IS_PRODUCTION === 'false'
    ? 'https://api.test.datacite.org'
    : 'https://api.datacite.org';

const cookieName = 'ek-dc';

function getOrigin(req){
  return req?.url.match(/^(https?:\/\/[^\/]+)/)[1] || '';
}
export async function checkCookies() {
  const cookieStore =await  cookies();
  const cookie =  cookieStore.get(cookieName);
  if (!cookie) return false;
  const { id, password } = jwt.verify(cookie.value, process.env.SECRET_KEY);
  if(!id || !password) return false;
  return {id, password};
}

async function getAuthHeader() {
  const {id, password} = await checkCookies();
  const credentials = `${id}:${password}`;
  return "Basic " + Buffer.from(credentials).toString('base64');
}

// Common headers for DataCite requests
// const commonHeaders = {
//   "Accept": "application/vnd.api+json",
//   "Content-Type": "application/vnd.api+json",
//   "Authorization": getAuthHeader(),
// };

// Check credentials by making a HEAD request to the DataCite API
async function checkCredentials(repositoryId, password) {
  const response = await fetch(`${API_BASE_URL}/dois`, {
    method: "HEAD",
    headers: {
      "Authorization": await getAuthHeader(),
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




// GET route to check authentication status
export async function GET(req) {
  const isAuthenticated = await checkCookies();
  if (isAuthenticated) {
    return NextResponse.json({ status: 200, body: "authenticated" });
  }
  return NextResponse.json({ status: 401, body: "Unauthenticated" });
}

// POST route for login: verifies credentials and sets a JWT cookie
export async function POST(req) {
  const origin = getOrigin(req)

  // Using URLSearchParams for form-encoded data; consider using JSON if possible.
  const reqText = await req.text();
  const params = new URLSearchParams(reqText);
  const data = Object.fromEntries(params);

  const isAuthenticated = await checkCredentials(data.id, data.password);
  if (isAuthenticated) {
    const jwtToken = jwt.sign(data, process.env.SECRET_KEY, { expiresIn: '1h' });
    const cookieStore = await cookies();
    cookieStore.set(cookieName, jwtToken, {
      path: '/',
      httpOnly: true,
      secure: process.env.IS_PRODUCTION !== 'false',
      sameSite: 'strict',
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });
    return NextResponse.redirect(origin+'/create');
  }
  return NextResponse.json({ status: 401, data: 'Please confirm your login credentials' });
}


export async function DELETE(req) {
  const origin = getOrigin(req)
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
  return NextResponse.redirect(origin);
}
