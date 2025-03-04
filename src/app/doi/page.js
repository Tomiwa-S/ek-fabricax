'use client'
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function DoiDetailsPage() {

    const searchParams = useSearchParams();
    const data = searchParams.get('data') || null;
    const [doiData, setDoiData] = useState(null);

  useEffect(() => {
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        console.log(parsedData)
        setDoiData(parsedData);
      } catch (error) {
        console.error('Failed to parse DOI data:', error);
      }
    }
  }, [data]);

  if (!doiData) {
    return <div className="p-4">Loading DOI details...</div>;
  }

  const { attributes } = doiData.data;

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">DOI Details</h1>
        <table className="min-w-full border-collapse">
          <tbody>
            <tr className="border-b">
              <td className="px-4 py-2 font-semibold">DOI</td>
              <td className="px-4 py-2">{doiData.data.id}</td>
            </tr>
            {attributes.prefix && (
              <tr className="border-b">
                <td className="px-4 py-2 font-semibold">Prefix</td>
                <td className="px-4 py-2">{attributes.prefix}</td>
              </tr>
            )}
            <tr className="border-b">
              <td className="px-4 py-2 font-semibold">Event</td>
              <td className="px-4 py-2">{attributes.event}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 font-semibold">Title</td>
              <td className="px-4 py-2">
                {attributes.titles && attributes.titles[0]
                  ? attributes.titles[0].title
                  : 'N/A'}
              </td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 font-semibold">Publisher</td>
              <td className="px-4 py-2">{attributes.publisher}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 font-semibold">Publication Year</td>
              <td className="px-4 py-2">{attributes.publicationYear}</td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 font-semibold">Resource Type</td>
              <td className="px-4 py-2">
                {attributes.types && attributes.types.resourceTypeGeneral}
              </td>
            </tr>
            <tr className="border-b">
              <td className="px-4 py-2 font-semibold">URL</td>
              <td className="px-4 py-2">
                <a
                  href={attributes.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  {attributes.url}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="mt-6 flex justify-center space-x-4">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => router.push(`/doi-update/${doiData.data.id}`)}
          >
            Update DOI
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            onClick={() => {
              // For deletion, call your delete API and then redirect
              if (confirm('Are you sure you want to delete this DOI?')) {
                fetch(`/api/dois/${doiData.data.id}`, { method: 'DELETE' })
                  .then((res) => {
                    if (res.ok) {
                      router.push('/dois');
                    } else {
                      alert('Failed to delete DOI.');
                    }
                  })
                  .catch((err) => console.error(err));
              }
            }}
          >
            Delete DOI
          </button>
        </div>
      </div>
    </div>
  );
}
