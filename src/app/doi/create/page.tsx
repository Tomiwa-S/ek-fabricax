'use client'
import DOIForm from "@/app/components/doiForm";

export default function createDOI(){

    return (<div className="w-full p-[5rem]">
        <DOIForm action="create"/>
    </div>)
}