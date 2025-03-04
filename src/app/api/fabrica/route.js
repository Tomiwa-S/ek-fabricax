'use server';

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const API_BASE_URL =
  process.env.IS_PRODUCTION === 'false'
    ? 'https://api.test.datacite.org'
    : 'https://api.datacite.org';

const cookieName = 'ek-dc'
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

    return NextResponse.json(data, { status: 200 });
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
    // Fetch both prefixes and DOIs in parallel to reduce latency
    const [prefixRes, doiRes] = await Promise.all([
      fetch(`${API_BASE_URL}/prefixes`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: await commonHeaders(),
        },
      }),
      fetch(`${API_BASE_URL}/dois?prefix=10.80221`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: await commonHeaders(),
        },
      }),
    ]);

    if (!prefixRes.ok) {
      throw new Error(`Failed to fetch prefixes: ${prefixRes.status} ${prefixRes.statusText}`);
    }
    if (!doiRes.ok) {
      throw new Error(`Failed to fetch DOIs: ${doiRes.status} ${doiRes.statusText}`);
    }

    // Parse both JSON responses in parallel
    const [prefixData, doiData] = await Promise.all([prefixRes.json(), doiRes.json()]);

    // Return combined data (or just one if you only need DOIs)
    return NextResponse.json(
      {
        prefixes: prefixData,
        dois: doiData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/fabrica error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
