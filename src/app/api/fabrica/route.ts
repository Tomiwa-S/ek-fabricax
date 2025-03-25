import { apiBaseURL } from '@/app/globalVariables';
import { NextRequest, NextResponse } from 'next/server';
import { checkCookies } from '../auth/route';
import { NextApiRequest, NextApiResponse } from 'next';

export async function POST(req: NextRequest) {

  try{
    const payload  = await req.json();
    const {id, password}:any = await checkCookies();
    const credentials = `${id}:${password}`;
    const authHeader = "Basic " + Buffer.from(credentials).toString('base64');
    const {searchParams} = new URL(req.url as string | URL);
    const doi = searchParams.get('id');
  

    const response = await fetch(`${apiBaseURL}/dois${doi?'/'+doi:''}`, {
        method: doi?'PUT':'POST',
        headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': authHeader,
        },
        body: JSON.stringify(payload),
    });


    const data = await response.json();


    if (!response.ok) {
        return NextResponse.json({ error: data.errors }, { status: response.status });
    }
    return NextResponse.json(data, { status: 200 });
  }catch(error:any){
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

}

export async function GET(req:NextApiRequest){
  const cookies = await checkCookies();
  if(!cookies) return NextResponse.json({body:"No Organization Found"}, {status:403});
  const {id, password} = cookies;
  const {searchParams} = new URL(req.url as string | URL);
  const doi = searchParams.get('doi');
  if(doi){
    const res = await fetch(`${apiBaseURL}/dois/${encodeURIComponent(doi)}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(id+':'+password).toString('base64')}`,
        Accept: 'application/json',
      },
    });
    const {data}= await res.json();
    const {attributes} = data;

    return NextResponse.json(attributes);
    // return NextResponse.json(JSON.parse(JSON.stringify(attributes)));
  }
  const res = await fetch(`${apiBaseURL}/dois?client-id=${id}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(id+':'+password).toString('base64')}`,
      Accept: 'application/json',
    },
  });
  const body= await res.json();
  const {data} = body;
  const extractedData = data.map((item:any) => {
    const attrs = item.attributes;
    const title =
      attrs.titles && Array.isArray(attrs.titles) && attrs.titles.length > 0 && attrs.titles[0].title
        ? attrs.titles[0].title
        : "No title";
    const publicationYear =
      typeof attrs.publicationYear === "number" ? attrs.publicationYear : null;
    const doi = attrs.doi ? attrs.doi : "No DOI";
    const author =
      attrs.creators && Array.isArray(attrs.creators) && attrs.creators.length > 0 && attrs.creators[0].name
        ? attrs.creators[0].name
        : "Unknown author";
    return {
      title,
      publicationYear,
      doi,
      author,
      state: attrs.state
    };
  });
  
  return NextResponse.json(extractedData)
}

export async function DELETE(req:NextRequest){
  const cookies = await checkCookies();
  if(!cookies) return NextResponse.json({body:"No Organization Found"}, {status:403});
  const {id, password} = cookies;
  const doi = req.nextUrl.searchParams.get('doi')
  const res = await fetch(`${apiBaseURL}/dois/${doi}`, {
    method:'DELETE',
    headers: {
      Authorization: `Basic ${Buffer.from(id+':'+password).toString('base64')}`,
      Accept: 'application/json',
    },
  });
  return NextResponse.json({status:res.status})
}

