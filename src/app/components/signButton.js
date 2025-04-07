'use client';
import { useState, useEffect } from "react";
import { Suspense } from "react";

export default function SignButton(){



  async function signOut() {
    await fetch('api/auth',{
      method:'DELETE',
    })
    window.location = '/';
  }


  const [isLoggedIn, setIsLoggedIn] = useState(undefined);

  useEffect(()=>{
    (async ()=>{
      try{
        const res = await fetch('/api/auth', {
          method:'HEAD'
        });
        const user = res.ok;
        setIsLoggedIn(user);
      }catch(err){}
    })();
  },[])


  return (
  <Suspense>
    {(true || isLoggedIn) ?
          <span className="bg-blue-500 text-white 
          cursor-pointer 
          rounded-full px-4 py-2 absolute right-2 top-4"
          onClick={signOut}
      >Sign Out</span>
      :
      <span className="bg-blue-500 text-white 
            cursor-pointer 
            rounded-full px-4 py-2 absolute right-2 top-4"
            onClick={()=>window.location = 'auth/login'}
            >Log In</span>}
  </Suspense>
  )
  

}