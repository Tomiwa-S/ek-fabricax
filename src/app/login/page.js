'use client';
import { useEffect } from "react";
import Image from "next/image";



export default function Login(){

    useEffect(()=>{
        (async ()=>( await fetch('/api/auth',{
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache:'no-store'
        }
        ).then(async res=>{
            const data = await res.json();
            if(data.body==='authenticated'){
                console.log('authenticated')
                window.location = window.origin;
            }else{
                return null;
            }
        })))()
        
    },[])

    const effect = "bg-transparent wave-animation bg-gradient-to-r from-[#3A4CB4] to-[#E91E63] opacity-90 transition-all duration-300";
    const inputClass = `block border-2 rounded-md mb-8 p-2`
    return (
        <div className={`flex w-full h-screen justify-center items-center ${effect}`}>

            <form method="POST" action={'api/auth'} className="w-[50%] 
            p-8 bg-[rgba(255,255,255,0.5)] 
             rounded-md border-2 flex flex-col">

                <div>
                    <Image src={'/ek.webp'} width={150} height={150} alt="Eko-Konnect"/>
                </div>

                <label className="block" htmlFor="id">Repository ID</label>
                <input className={inputClass} name="id" type="text"/>

                <label className="block" htmlFor="password">Password</label>
                <input className={inputClass} name="password" type="password"/>

                <button type="submit" className="border-2 bg-green-500 text-white
                mx-10 rounded-md
                ">
                    Login
                </button>

            </form>
        </div>
    )
}