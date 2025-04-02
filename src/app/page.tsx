'use client'
import Link from "next/link";
import SignButton from "@/app/components/signButton";

export default function Home() {
  const effect = "bg-transparent wave-animation bg-gradient-to-r from-[#3A4CB4] to-[#E91E63] opacity-90 transition-all duration-300";

  const listTW = `bg-white border-2 rounded-md p-2 px-4 my-2`;

  return (<>
      <div className={`flex w-full h-screen justify-center items-center ${effect}`}>
        <SignButton/>
          <div className="flex gap-4">
              <div className={listTW}><Link href={'/doi/create'}>Create new DOI</Link></div>
              <div className={listTW}><Link href={'/doi'}>View DOIs</Link></div>
          </div>
      </div>
  </> );
}
