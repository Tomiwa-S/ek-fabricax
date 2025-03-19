import { apiBaseURL } from '@/app/globalVariables';
import { NextRequest, NextResponse } from 'next/server';
import { checkCookies } from '../auth/route';

export async function POST(req: NextRequest) {

  try{
    const payload  = await req.json();
    console.log("Payload", payload)
    const {id, password}:any = await checkCookies();
    const credentials = `${id}:${password}`;
    const authHeader = "Basic " + Buffer.from(credentials).toString('base64');

    const response = await fetch(`${apiBaseURL}/dois`, {
        method: 'POST',
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
