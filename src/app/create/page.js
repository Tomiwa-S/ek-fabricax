'use client';
import { useState } from 'react';
import {doiTypes} from './doiTypes';

export default function CreateDoi() {
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [doi, setDoi] = useState('');
  const [prefix, setPrefix] = useState('');
  const [eventValue, setEventValue] = useState('publish');
  const [creator, setCreator] = useState('');
  const [title, setTitle] = useState('');
  const [publisher, setPublisher] = useState('');
  const [rorPublisher, setRorPublisher] = useState([]);
  const [hidePublisherList, setHidePublisherList] = useState(true);
  const [publicationYear, setPublicationYear] = useState('');
  const [resourceType, setResourceType] = useState('Dataset');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const getOrganizations = async()=>{
    try {

      const res = await fetch(`/api/ror?org=${publisher}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      
      if (!res.ok) {
        console.error(data.error ? JSON.stringify(data.error) : 'An error occurred.');
      } else {
        console.log(data);
        setRorPublisher(data);
        setHidePublisherList(false);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  function selectPublisherfromList(org){
    setPublisher(org.name)
    setHidePublisherList(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    // Basic client-side validation
    if (autoGenerate && !prefix) {
      setError('Prefix is required when auto-generating a DOI.');
      return;
    }
    if (!autoGenerate && !doi) {
      setError('Please provide a full DOI if auto-generation is not used.');
      return;
    }
    if (!creator || !title || !publisher || !publicationYear || !url) {
      setError('Please fill in all required fields.');
      return;
    }

    const payload = {
      autoGenerate,
      doi: autoGenerate ? undefined : doi,
      prefix: autoGenerate ? prefix : undefined,
      event: eventValue,
      creators: [{ name: creator }],
      titles: [{ title }],
      publisher,
      publicationYear: parseInt(publicationYear, 10),
      types: { resourceTypeGeneral: resourceType },
      url,
    };

    setLoading(true);
    try {
      const res = await fetch('/api/fabrica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ? JSON.stringify(data.error) : 'An error occurred.');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Create a New DOI</h1>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {result && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">
            DOI created successfully: <span className="font-mono">{result.data.id}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center">
            <input
              id="autoGenerate"
              type="checkbox"
              checked={autoGenerate}
              onChange={(e) => setAutoGenerate(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="autoGenerate" className="font-medium">
              Auto-generate DOI suffix
            </label>
          </div>
          {autoGenerate ? (
            <div>
              <label className="block font-medium">Prefix</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="e.g., 10.1234"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                // required
              />
            </div>
          ) : (
            <div>
              <label className="block font-medium">Full DOI</label>
              <input
                type="text"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                placeholder="e.g., 10.1234/abcd1234"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                // required
              />
            </div>
          )}
          <div>
            <label className="block font-medium">Event</label>
            <select
              value={eventValue}
              onChange={(e) => setEventValue(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            //   required
            >
              <option value="publish">Publish (Findable)</option>
              <option value="register">Register</option>
              <option value="hide">Hide</option>
            </select>
          </div>
          <div>
            <label className="block font-medium">Creator Name</label>
            <input
              type="text"
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
              placeholder="e.g., John Doe"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            //   required
            />
          </div>
          <div>
            <label className="block font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., My Research Data"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            //   required
            />
          </div>
          <div>
            <label className="block font-medium">Publisher</label>
            <input
              type="text"
              value={publisher}
              id='publisherID'
              name='publisher'
              list='publisher'
              aria-autocomplete="list"
              aria-controls="publisher"
              role='combobox'
              onChange={(e) => {
                setPublisher(e.target.value)
                getOrganizations();
              }}
              onKeyDown={(e)=>{ e.key === 'Enter' ? setHidePublisherList(true) : null}}
              placeholder="e.g., Your Organization"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            //   required
            />
            {!hidePublisherList && <div>
              <span className='block pl-2 border-[1px]'>
                Press "Enter" to use your Organization name
              </span>
            {rorPublisher.map((org, index)=>(
                <span
                onClick={()=>selectPublisherfromList(org)}
                className='block pl-2 border-[1px] cursor-pointer'
                key={`${org.name}-${index}`}>{org.name}</span>
              ))}
            </div>}

          </div>
          <div>
            <label className="block font-medium">Publication Year</label>
            <input
              type="number"
              value={publicationYear}
              onChange={(e) => setPublicationYear(e.target.value)}
              placeholder="e.g., 2025"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            //   required
            />
          </div>
          <div>
            <label className="block font-medium">Resource Type</label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            //   required
            >
              {doiTypes.map((value, index)=>(
                  <option value={value} key={`doiType-${value}-${index}`}>{value}</option>
              ))}

            </select>
          </div>
          <div>
            <label className="block font-medium">URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.org"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
              // required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            {loading ? 'Processing...' : 'Create DOI'}
          </button>
        </form>
      </div>
    </div>
  );
}
