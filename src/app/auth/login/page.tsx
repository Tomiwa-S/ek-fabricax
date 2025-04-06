'use client';
import { FormEvent, useState } from "react";
import Image from "next/image";
import LoadingPage from "@/app/components/loading";




export default function Login(){
    const [loading, setLoading] = useState(false);
    // useEffect(()=>{
    //     (async ()=>( await fetch('/api/auth',{
    //         method: 'GET',
    //         headers: { 'Content-Type': 'application/json' },
    //         cache:'no-store'
    //     }
    //     ).then(async res=>{
    //         if(res.ok){
    //             const data = await res.json();
    //             if(data.body==='authenticated'){
    //                 console.log('authenticated')
    //                 window.location = window.origin;
    //             }else{
    //                 return null;
    //             }
    //         }
    //     })))()
        
    // },[])

    const handleSubmit =async(event:FormEvent)=>{
        event.preventDefault(); 
        setLoading(true);
        const formData = new FormData(event.currentTarget as HTMLFormElement);
        const data = Object.fromEntries(formData.entries());
        try{
            const response = await fetch('/api/auth',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                cache:'no-store',
                body: JSON.stringify(data)
            })
            if(response.ok){
                window.location = window.origin as string & Location;
            }
        }catch(err){
            console.error(err)
        }
        setLoading(false);
    }

    const effect = "bg-transparent wave-animation bg-gradient-to-r from-[#3A4CB4] to-[#E91E63] opacity-90 transition-all duration-300";
    const inputClass = `block border-2 rounded-md mb-8 p-2`
    return (<>
        <div className={`flex w-full h-screen justify-center items-center ${effect}`}>

            <form onSubmit={handleSubmit} className="w-[50%] 
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
        {loading && <LoadingPage/>}
        </>
    )
}