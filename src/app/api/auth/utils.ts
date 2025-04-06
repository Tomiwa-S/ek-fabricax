
import { cookies } from "next/headers";
import { cookieName, secretJWTKey, mdsBaseURL } from "@/app/globalVariables";
import jwt from 'jsonwebtoken';

export async function checkCookies(): Promise<false | { id: any; password: any; }> {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(cookieName);
    if (!cookie) return false;
    const { id, password } : any = jwt.verify(cookie.value, secretJWTKey );
    if(!id || !password) return false;
    return {id, password};
}

export async function checkDataCiteCredentials(repoId: string, password: string): Promise<boolean> {

  try {
    const response = await fetch(`${mdsBaseURL}/doi`, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + btoa(`${repoId}:${password}`),
        'Content-Type': 'application/json',
      },
    });

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