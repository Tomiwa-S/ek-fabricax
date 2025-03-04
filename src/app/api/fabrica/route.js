'use server';

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const API_BASE_URL =
  process.env.IS_PRODUCTION === 'false'
    ? 'https://api.test.datacite.org'
    : 'https://api.datacite.org';

const cookieName = 'ek-dc'

function getOrigin(req){
  return req?.url.match(/^(https?:\/\/[^\/]+)/)[1] || '';
}

export async function checkCookies() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(cookieName);
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


// Create a single Basic Auth header upfront
// const authHeader = await getAuthHeader();

// Common headers used for DataCite requests
const commonHeaders = async ()=>({
  Accept: 'application/vnd.api+json',
  'Content-Type': 'application/vnd.api+json',
  Authorization: await getAuthHeader(),
})

/**
 * POST Handler: Creates a DOI via DataCite
 */
export async function POST(req) {
  try {
    const reqBody = await req.json();
    const payload = reqBody;

    // Create the DOI
    const response = await fetch(`${API_BASE_URL}/dois`, {
      method: 'POST',
      headers: await commonHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      // Return error details from DataCite
      return NextResponse.json({ error: data.errors }, { status: response.status });
    }
    // const origin = getOrigin(req);
    // const redirectPath = `/doi?data=${encodeURIComponent(JSON.stringify(data))}`;

 

    // return NextResponse.redirect(origin + redirectPath, 302);
    const doiObj = data;
    return NextResponse.json(doiObj, { status: 200 });
  } catch (error) {
    console.error('Error creating DOI:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * GET Handler: Example that fetches prefix data and DOIs in parallel.
 * Adjust or remove if you only need one of these calls.
 */
export async function GET() {
  try {
    const response = await fetch('https://api.test.datacite.org/dois', {
      headers: {
        'Authorization': await getAuthHeader(),
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      return NextResponse.json({body: "Something went wrong", status: response.status})
    }
    
    const data = await response.json();
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({body: error.message})
  }

}
