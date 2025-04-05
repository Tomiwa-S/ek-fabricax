'use client'
import DOIForm from "@/app/components/doiForm";
import Link from "next/link";

export default function createDOI(){

    return (<div className="w-full p-[5rem]">
        
        <Link className="underline cursor-pointer py-8" href={'/'}>{`<< Home`}</Link>
        <DOIForm action="create"/>
    </div>)
}