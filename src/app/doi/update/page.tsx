'use client';
import UpdateDOIForm from "@/app/components/updateDOI";
import { useSearchParams } from "next/navigation";

export default function Page(){
    const searchParams = useSearchParams();
    const doi =  searchParams.get('id') as string;

    return (<div className="w-full p-[5rem]">
        <span>Back</span>
        <UpdateDOIForm action="update" doiId={encodeURIComponent(doi)}/>
    </div>)
}

