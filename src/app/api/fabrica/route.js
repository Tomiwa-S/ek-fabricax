'use server';

import { NextResponse } from "next/server";

const REPOSITORY_ID = process.env.DATACITE_REPOSITORY_ID;
const PASSWORD = process.env.DATACITE_PASSWORD;
const API_BASE_URL =
      process.env.IS_PRODUCTION === 'false' ?
         'https://api.test.datacite.org': 'https://api.datacite.org';

// Helper to build the Basic Authentication header.
function getAuthHeader() {
  const credentials = `${REPOSITORY_ID}:${PASSWORD}`;
  return "Basic " + btoa(credentials);
}

// Common options for all requests.
const commonHeaders = {
  "Accept": "application/vnd.api+json",
  "Content-Type": "application/vnd.api+json",
  "Authorization": getAuthHeader(),
};


export async function POST(req, res) {

    if (req.method !== 'POST') {
    //   res.setHeader('Allow', ['POST']);
      
      
      return NextResponse.json({ error: `Method ${req.method} not allowed` }, {status: 405});
    }
    const reqBody = await req.json();

  
    try {
      const {
        autoGenerate,
        doi,
        prefix,
        event,
        creators,
        titles,
        publisher,
        publicationYear,
        types,
        url,
      } = reqBody;

      console.log('prefix', prefix )
  
      // Build attributes for the DataCite payload.
      let attributes = {
        event,
        creators,
        titles,
        publisher,
        publicationYear,
        types,
        url,
      };
  
      if (autoGenerate) {
        // For auto-generation, include your prefix.
        attributes.prefix = prefix;
      } else {
        // Otherwise, include the full DOI.
        attributes.doi = doi;
      }
  
      const payload = {
        data: {
          type: 'dois',
          attributes,
        },
      };
  
  
      const response = await fetch(`${API_BASE_URL}/dois`, {
        method: 'POST',
        headers: commonHeaders,
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      console.log(payload)

  
  
      if (!response.ok) {
        return NextResponse.json({ error: data.errors }, {status: response.status});
      }
  
    //   return res.status(200).json(data);
    return NextResponse.json(data, {status: 200});
    } catch (error) {
      console.error('Error creating DOI:', error);
      return NextResponse.json({ error: error.message },{status:500});
    }
  }
  

  export async function GET(req, res) {
    return NextResponse.json(
      {
        hello:'world'
      }
    )
  }