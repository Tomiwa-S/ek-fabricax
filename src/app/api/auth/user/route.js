import { NextResponse } from "next/server";
import { isLoggedIn } from "../route";

export async function GET(req, res){
    const response = await isLoggedIn();
    console.log("response", response)
    return NextResponse.json({user:response})
}