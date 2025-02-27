import { NextResponse } from "next/server";
import * as jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const API_BASE_URL =
      process.env.IS_PRODUCTION === 'false' ?
         'https://api.test.datacite.org': 'https://api.datacite.org';

const cookieName='ek-dc';

async function checkCredentials(repositoryId, password) {
        const response = await fetch(`${API_BASE_URL}/dois`, {
          method: "HEAD",
          headers: {
            "Authorization": "Basic " + btoa(`${repositoryId}:${password}`),
            "Accept": "application/json"
          }
        });
      
        if (response.ok) {
          console.log("Credentials are valid.");
          return true;
        } else {
          console.error("Authentication failed:", response.status, response.statusText);
          return false;
        }
}

export async function checkCookies() {
    const cookieStore = cookies();
    const cookie = (await cookieStore).get(cookieName);
    const {id, password} = jwt.verify(cookie?.value, process.env.SECRET_KEY);
    return await checkCredentials(id, password)
}

export async function isLoggedIn() {
    const cookieStore = cookies();
    const cookie = (await cookieStore).get(cookieName);
    const {id, password} = jwt.verify(cookie?.value, process.env.SECRET_KEY);
    return await checkCredentials(id, password);
}


export async function GET() {
    // const {host} = Object.fromEntries(req.headers);
    // let protocol = /^localhost(:\d+)?$/.test(host) ? "http:" : "https:";
    // const origin =  protocol + "//" + host;
    // const cookieStore = cookies();
    // const cookie = (await cookieStore).get(cookieName);
    // const {id, password} = jwt.verify(cookie?.value, process.env.SECRET_KEY);
    // const isAuthenticated = await checkCredentials(id, password);
    const isAuthenticated = await isLoggedIn();
    if(isAuthenticated){
      return NextResponse.json({status: 200, body:"authenticated"})
    }
    return NextResponse.json({status: 401, body:"Unauthenticated"})
    // return NextResponse.redirect(`${origin}/login`)
}


export async function POST(req, res) {
    const {host} = Object.fromEntries(req.headers);
    let protocol = /^localhost(:\d+)?$/.test(host) ? "http:" : "https:";
    const origin =  protocol + "//" + host;

    const reqText = await req.text();
    const params = new URLSearchParams(reqText);

    const data = Object.fromEntries(params);
    const isAuthenticated = await checkCredentials(data.id, data.password);

    if(isAuthenticated){

        const jwtToken = jwt.sign(data, process.env.SECRET_KEY, {expiresIn:'1h'});
        const cookieStore = cookies();
        (await cookieStore).set(cookieName, jwtToken, {
            path: '/',
            httpOnly: true,
            secure: process.env.IS_PRODUCTION!=='false',
            sameSite: 'strict',
            expires: new Date(Date.now() + (1 * 60  * 60 * 1000))  // 1 hour
          });

        
        return NextResponse.redirect(`${origin}/create`);
    }
    return NextResponse.json({status:401, data:'Please confirm yout login credentials'})
}


export async function DELETE(req, res) {
    const {host} = Object.fromEntries(req.headers);
    let protocol = /^localhost(:\d+)?$/.test(host) ? "http:" : "https:";
    const origin =  protocol + "//" + host;
    const cookieStore = cookies();
    (await cookieStore).delete(cookieName);
    return NextResponse.redirect(`${origin}`)
}