'use client';
import { useState, useEffect } from "react";
import { Suspense } from "react";
export default function Home(){



  async function signOut() {
    await fetch('api/auth',{
      method:'DELETE',
    })
    window.location.reload();
  }


  const [isLoggedIn, setIsLoggedIn] = useState(undefined);

  useEffect(()=>{
    (async ()=>{
      try{
        const res = await fetch('api/auth/user');
        const {user} = await res.json();
        setIsLoggedIn(user);
      }catch(err){}
    })();
  },[])

  
  



  const effect = "bg-transparent wave-animation bg-gradient-to-r from-[#3A4CB4] to-[#E91E63] opacity-90 transition-all duration-300"
  return <div className={"w-full h-screen items-center justify-center flex "+effect}>

  <Suspense>
    {isLoggedIn ?
          <span className="bg-blue-500 text-white 
          cursor-pointer 
          rounded-full px-4 py-2 absolute right-2 top-4"
          onClick={signOut}
      >Sign Out</span>
      :
      <span className="bg-blue-500 text-white 
            cursor-pointer 
            rounded-full px-4 py-2 absolute right-2 top-4"
            onClick={()=>window.location = '/login'}
            >Log In</span>}
  </Suspense>
  
  </div>
}