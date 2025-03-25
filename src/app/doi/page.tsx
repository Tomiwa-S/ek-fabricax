'use client';
import { useState, useEffect, useRef, ChangeEvent } from "react";
import { handleBaseUrl } from "../globalVariables";
import Link from "next/link";

interface doiList {
    title: string;
    publicationYear: Number;
    doi: string;
    author: string;
    state:'draft'|'registered'|'findable';
  }
export default function Page() {
    const [alldDoiItems, setAllDoiItems] = useState<doiList[]|null|undefined>(null);
    const [doiItems, setDoiItems] = useState<doiList[]|null|undefined>(null);
    const findableRef = useRef<HTMLInputElement>(null);
    const draftRef= useRef<HTMLInputElement>(null)

    async function getDOIs() {
      const res = await fetch('/api/fabrica');
      if(!res.ok) window.location = '/' as (string & Location);
      return await res.json();  
    }

    async function deleteDOI(doi:string) {
      const res = await fetch(`/api/fabrica?doi=${encodeURIComponent(doi)}`,{method:'DELETE'});
      if(!res.ok) window.location = '/' as (string & Location);
      window.location.reload()
      // setDoiItems(prev=>prev?.filter(item=>item.doi!==doi))
    }
    function findableAction(event:ChangeEvent<HTMLInputElement>){
      const state = event.currentTarget.checked;
      if(state) {
        draftRef.current ? draftRef.current.disabled=true : null;
        setDoiItems(()=>alldDoiItems?.filter(doi=>doi.state==='findable'))
      }
      else {
        draftRef.current ? draftRef.current.disabled=false : null
        setDoiItems(()=>alldDoiItems)
      }
    }
    function draftAction(event:ChangeEvent<HTMLInputElement>){
      const state = event.currentTarget.checked;
      if(state) {
        findableRef.current ? findableRef.current.disabled=true : null;
        setDoiItems(()=>alldDoiItems?.filter(doi=>doi.state==='draft'))
      }
      else {
        findableRef.current ? findableRef.current.disabled=false : null
        setDoiItems(()=>alldDoiItems)
      }
    }



    useEffect(()=>{
      getDOIs().then(res=>{
        setAllDoiItems(res)
        setDoiItems(res)})
    },[])
    
    return (
      <div className="w-full p-4 flex">
        <div className="p-4 cols-4">

          <Link href={`/doi/create`} className="bg-green-500 text-white p-2 rounded-full mt-12 font-semibold text-lg border-b border-gray-200 pb-1 mb-3">
            Create new
          </Link>
          {/* Heading */}
          <h2 className="text-green-500 font-semibold text-lg border-b border-gray-200 pb-1 mb-3">
            State
          </h2>

          {/* Checkbox List */}
          <div className="space-y-2">
            {/* Findable Checkbox */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                ref={findableRef}
                onChange={findableAction}
                className="w-4 h-4 text-green-500 border-gray-300 rounded"
              />
              <span className="text-gray-600">
                Findable <span className="text-gray-400">({(alldDoiItems?.length??0) - (alldDoiItems?.filter(doi=>doi.state=='draft').length??0)})</span>
              </span>
            </label>

            {/* Draft Checkbox */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                ref={draftRef}
                onChange={draftAction}
                className="w-4 h-4 text-green-500 border-gray-300 rounded"
              />
              <span className="text-gray-600">
                Draft <span className="text-gray-400">({(alldDoiItems?.filter(doi=>doi.state=='draft').length??0)})</span>
              </span>
            </label>
          </div>
        </div>
        <section className="p-4  cols-8">
          {
            doiItems?.map(item=>(
              <span key={item.doi} className="block border-2 p-4 rounded-md border-blue-500 my-5">
                <p>Title: {item.title}</p>
                <p>Author: {item.author}</p>
                <p>Publication Year{item?.publicationYear?.toString()??'N/A'}</p>
                <p>DOI: {item.doi}</p>
                <p>State: {item.state}</p>
                {item.state === 'draft' ? (
                  <p className='cursor-pointer' onClick={()=>deleteDOI(item.doi)}>Delete</p>
                ):(
                  <Link href={handleBaseUrl+'/'+ encodeURIComponent(item.doi)} target="_blank">{`${handleBaseUrl}/${item.doi}`}</Link>
                )}
                <p>
                  <Link href={`/doi/${encodeURIComponent(item.doi)}`}>View</Link>
                </p>
              </span>
            ))
          }
        </section>
      </div>
    )
}