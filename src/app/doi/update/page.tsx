'use client';
import UpdateDOIForm from "@/app/components/updateDOI";
import { useSearchParams } from "next/navigation";

export default function Page(){
    const searchParams = useSearchParams();
    const doi =  searchParams.get('id') as string;
   
    return(
    // <h1>Hiii</h1>
    <UpdateDOIForm action="update" doiId={encodeURIComponent(doi)}/>
)
}

