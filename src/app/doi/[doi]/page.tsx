
// import useSWR from 'swr';
import * as swr from 'swr';

import {apiBaseURL} from '../../globalVariables';
const fetcher = (url:string) => fetch(url).then(res => res.json());
const useSWR = swr.default;
export default function DoiPage({params}:any) {

  // const { doi } = params ;
  
  const doi = "10.80221/698ewi";
  const { data, error } = useSWR(`${apiBaseURL}/dois/${encodeURIComponent(doi)}`, fetcher);

  if (error) return <div className="flex items-center justify-center h-screen text-red-500">Error loading metadata.</div>;
  if (!data) return <div className="flex items-center justify-center h-screen text-blue-500">Loading...</div>;

  const { attributes } = data.data;


  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">DOI Metadata</h1>
        <ul className="space-y-4 text-gray-700">
          {Object.fromEntries(attributes).map(([key, value]:any) => (
            value && (
              <li key={key} className="p-4 border-l-4 border-indigo-500 bg-gray-100 rounded-md">
                <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</strong>{' '}
                {Array.isArray(value) ? (
                  <ul className="list-disc ml-5">
                    {value.map((item, index) =>
                      typeof item === 'object' ? (
                        <li key={index}>{JSON.stringify(item, null, 2)}</li>
                      ) : (
                        <li key={index}>{item}</li>
                      )
                    )}
                  </ul>
                ) : typeof value === 'object' ? (
                  <pre className="text-xs bg-gray-200 p-2 rounded">{JSON.stringify(value, null, 2)}</pre>
                ) : (
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
