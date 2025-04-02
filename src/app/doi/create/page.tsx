'use client'
import DOIForm from "@/app/components/doiForm";
import Link from "next/link";

export default function createDOI(){

    return (<div className="w-full p-[5rem]">
        
        <Link className="underline cursor-pointer" href={'/'}>Back</Link>
        <DOIForm action="create"/>
    </div>)
}