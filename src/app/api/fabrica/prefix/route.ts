import { apiBaseURL } from '@/app/globalVariables';
import { NextRequest, NextResponse } from 'next/server';
import { checkCookies } from '../../auth/utils';

export async function GET(req:NextRequest){
    const cookies = await checkCookies();
    if(!cookies) return NextResponse.json({body:"No Organization Found"}, {status:403});
    const {id, password} = cookies;

    const res = await fetch(`${apiBaseURL}/prefixes?client-id=${id}`, {
      headers: {
        Authorization: `Basic ${Buffer.from(id+':'+password).toString('base64')}`,
        Accept: 'application/json',
      },
    });
    const {data} = await res.json();

    const prefixes = data.map((item:any)=>item.id)
   
    return NextResponse.json(prefixes,{status:200})
  }