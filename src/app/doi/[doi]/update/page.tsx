'use client';
import UpdateDOIForm from "@/app/components/updateDOI";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function Page(){
    const searchParams = useSearchParams();
    const doi =  searchParams.get('id') as string;

    return (<div className="w-full p-[5rem]">
        <Link className="underline cursor-pointer" href={'/'}>Back</Link>
        <UpdateDOIForm action="update" doiId={encodeURIComponent(doi)}/>
    </div>)
}

