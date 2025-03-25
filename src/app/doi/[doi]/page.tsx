
'use client'
import { useEffect, useState } from 'react';
import {apiBaseURL} from '../../globalVariables';
import { useParams } from 'next/navigation';
import Link from 'next/link';

function ArrangeList({object}:any){

  return  Object?.entries(object).map(([key, value]:any) => (
    value && (
      <li key={key} className="p-4 border-l-4 border-indigo-500 bg-gray-100 rounded-md">
        <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</strong>{' '}
        {Array.isArray(value) ? (
          <ul className="">
            {value.map((item, index) =>
              typeof item === 'object' ? (
                <ArrangeList key={index} object={item}/>
                // <li key={index}>{JSON.stringify(item, null, 2)}</li>
              ) : (
                <li key={index}>{item}</li>
              )
            )}
          </ul>
        ) : typeof value === 'object' ? (
          <ArrangeList key={value} object={value}/>
          // <pre className="text-xs bg-gray-200 p-2 rounded">{JSON.stringify(value, null, 2)}</pre>
        ) : (
          value.toString()
        )}
      </li>
    )
  ))
}

export default function DoiPage() {
  const {doi} = useParams();
  const [attributes, setAttribues] = useState<any>(false);
  const skipFields = ['xml','container', 'schemaVersion','source'];
  const linkKeys = ['url']

  async function fetchDOI() {
    const res = await fetch(`/api/fabrica?doi=${doi}`); 
    // if(!res.ok) window.location = '/' as (string & Location);
    const data = await res.json();
    return data;
  }
  async function deleteDOI() {
    const res = await fetch(`/api/fabrica?doi=${encodeURIComponent(doi as string)}`,{method:'DELETE'});
    window.location =  (res.ok ? '/doi': '/') as (string & Location)
  }

  useEffect(()=>{
    fetchDOI().then(res=>setAttribues(res))
  },[])

  const floatingButtons = `block border-2 p-2 my-3 cursor-pointer`

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className='fixed top-4 left-2'>
        <button className={floatingButtons}>
          <Link href={`/doi/update?id=${doi}`}>Edit</Link>
        </button>
        <button className={`${floatingButtons} bg-red-500`} onClick={deleteDOI}>Delete</button>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">DOI Metadata</h1>
        <ul className="space-y-4 text-gray-700 whitespace-normal break-words">
          {/* <ArrangeList object={attributes}/> */}
          {attributes && Object?.entries(attributes).map(([key, value]:any) => (
            value && value.length>0 && !skipFields.includes(key) && (
              <li key={key} onClick={()=>{
                console.log("Value", value)
                console.log("Key", key)
                }} className="p-4 border-l-4 border-indigo-500 bg-gray-100 rounded-md">
                <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</strong>{' '}
                {Array.isArray(value) ? (
                  <ul className="list-disc ml-5">
                    {value.map((item, index) =>
                      typeof item === 'object' ? (
                        // <li key={index}>{JSON.stringify(item, null, 2)}</li>
                        <ArrangeList key={index} object={item}/>
                      ) : (
                        <li key={index}>{item}</li>
                      )
                    )}
                  </ul>
                ) : typeof value === 'object' ? (
                  <ArrangeList object={value}/>
                  // <pre className="text-xs bg-gray-200 p-2 rounded">{JSON.stringify(value, null, 2)}</pre>
                ) : (
                  linkKeys.includes(key) ?
                  <Link href={value.toString()} target='_blank'>{value.toString()}</Link>
                  :
                  value.toString()
                )}
              </li>
            )
          ))}
        </ul>
      </div>
    </div>
  );
}
