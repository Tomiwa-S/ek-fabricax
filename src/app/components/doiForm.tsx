import React, { useState, FC, FormEvent, useEffect } from 'react'; 
import { languages } from './lang';

import { Creator, CreatorType, DOIData, Title } from '../types';
import { toast, ToastContainer } from 'react-toastify';
import { useRouter } from 'next/navigation';
import SignButton from './signButton';
import Link from 'next/link';
interface DOIFormProp{
    action: 'create'|'update'
}
type Publisher = {
  name: string;
  ror_id: string;
};

async function getPrefixes(){
  const response = await fetch(`/api/fabrica/prefix`);
  return await response.json();
}

const DOIForm = ({action} : DOIFormProp) => {
  // Required Fields
  const genSuffix = ()=>Math.random().toString(36).substring(2, 8);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState(action ==='create' ?genSuffix(): '');
  const [doiState, setDoiState] = useState("draft");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Publisher[]>([]);
  const [error, setError] = useState<null| string>(null);
  const router = useRouter();

  const postData = async (payload:DOIData)=>{
    try {
        const res = await fetch('/api/fabrica', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) {
          
          console.error(res);
          notifyError()
          return;
        }
        const {data} = await res.json();
        const {id} = data;
        notifySuccess("DOI Successfully Created");
        if (id) router.push(`/doi/${encodeURIComponent(id)}`)

        return;
  
  
        // router.push(`/doi?data=${encodeURIComponent(JSON.stringify(data))}`)
        // setSubmitResult(data);
      } catch (err:any) {
        console.log(JSON.stringify(err.message))
        setError(err.message);
        setTimeout(()=>setError(null), 7000);
      }
      setLoading(false);
    };

    async function fetchOrganizations(org: string): Promise<any> {
      const url = `/api/ror?org=${encodeURIComponent(org)}`;
    
      try {
        const response = await fetch(url, { method: 'GET' });
    
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching organizations:", error);
        return [];
      }
    }

   
    
  

  // Creators – each creator’s fields change based on personType.
  const [creators, setCreators] = useState<Creator[]>([
    {
      nameIdentifier: "",
      personType: "Unknown",
      givenName: "",
      familyName: "",
      name: "",
      affiliation: ""
    }
  ]);

  // Titles
  const [titles, setTitles] = useState<Title[]>([
    { title: "", titleType: "", language: "" }
  ]);

  // Other required fields
  const [publisher, setPublisher] = useState("");
  const [publisherRorId, setPublisherRorId] = useState("");
  const [publisherQuery, setPublisherQuery] = useState<string>('');
  const [showPubDropdown,setShowPubDropdown] = useState<boolean>(false);
  const [publicationYear, setPublicationYear] = useState("");
  const [resourceTypeGeneral, setResourceTypeGeneral] = useState("");
  const [resourceType, setResourceType] = useState("");

  // Recommended and Optional properties (all as arrays of strings)
  const [subjects, setSubjects] = useState<string[]>([]);
  const [contributors, setContributors] = useState<string[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [relatedIdentifiers, setRelatedIdentifiers] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [geolocations, setGeolocations] = useState<string[]>([]);
  const [optLanguage, setOptLanguage] = useState("");
  const [alternateIdentifiers, setAlternateIdentifiers] = useState<string[]>([]);
  const [rights, setRights] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  const [version, setVersion] = useState("");
  const [fundingReferences, setFundingReferences] = useState<string[]>([]);
  const [relatedItems, setRelatedItems] = useState<string[]>([]);

  const [message, setMessage] = useState("");
  const notifyError = (err?:string) => toast.error(err ?? error?? 'DOI Creation Failed');
  const notifySuccess = (message:any)=> toast.success(message);
  // Simulate a function that retrieves a ROR id when publisher is clicked.
  const handlePublisherClick = (ror:string) => {
    const simulatedRorId = ror;
    setPublisherRorId(simulatedRorId);
  };

  useEffect(()=>{

    (async ()=>{
      await fetchOrganizations(publisherQuery).then(data=>{
        setResults(data)})
      await getPrefixes().then(res=>setPrefix(res[0]))
    })()
  },[publisherQuery])

  // Remove an item from a list field helper
  const removeAt = (index: number, list: any[], setter: (list: any[]) => void) => {
    const newList = list.filter((_, i) => i !== index);
    setter(newList);
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const doi = `${prefix}/${suffix}`;

    const requiredFields = [doi, doiState, url, creators,
       titles, 
      //  publisher,
        publicationYear, resourceTypeGeneral];

    for(let i=0; i< requiredFields.length; i++){
      if(!requiredFields[i] ){
        notifyError("Please make sure all the required fields are filled")
        // notifyError( requiredFields[i] as string)
        return null;
      }
    }

    const attributes = {
      doi,
      state: doiState,
      url,
      creators,
      titles,
      publisher,
      publisherRorId,
      publicationYear,
      resourceTypeGeneral,
      resourceType,
      subjects,
      contributors,
      dates,
      relatedIdentifiers,
      descriptions,
      geolocations,
      language: optLanguage,
      alternateIdentifiers,
      rights,
      sizes,
      formats,
      version,
      fundingReferences,
      relatedItems
    };

    const payload: DOIData = {
      data: {
        type: "dois",
        attributes
      }
    };

    await postData(payload)
    // setMessage("DOI created successfully!");
  };

  // Render creator fields conditionally based on personType.
  const renderCreatorFields = (creator: Creator, index: number) => {
    return (
      <div key={index} className="border p-4 rounded mb-4 relative">
        <ToastContainer />
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">Creator {index + 1}</h4>
          {creators.length > 1 && (
            <button
              type="button"
              onClick={() => removeAt(index, creators, setCreators)}
              className="text-red-500 hover:text-red-700"
              title="Remove creator"
            >
              Remove
            </button>
          )}
        </div>
        <div className="mt-2">
          <label className="block text-sm font-medium">Name Identifier</label>
          <input
            type="text"
            placeholder="Name Identifier (URL)"
            value={creator.nameIdentifier}
            required
            onChange={(e) => {
              const newCreators = [...creators];
              newCreators[index].nameIdentifier = e.target.value;
              setCreators(newCreators);
            }}
            className="w-full border rounded px-3 py-2 mt-1"
          />
          <p className="text-xs text-gray-500">
            Uniquely identifies an individual or legal entity (e.g. ORCID, ROR, ISNI).
          </p>
        </div>
        <div className="mt-2">
          <span className="block text-sm font-medium">Type</span>
          <div className="flex space-x-4 mt-1">
            {(["Personal", "Organizational", "Unknown"] as CreatorType[]).map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="radio"
                  name={`creator-type-${index}`}
                  value={type}
                  checked={creator.personType === type}
                  onChange={() => {
                    const newCreators = [...creators];
                    newCreators[index].personType = type;
                    // If not Personal, clear given/family names.
                    if (type !== "Personal") {
                      newCreators[index].givenName = "";
                      newCreators[index].familyName = "";
                    }
                    setCreators(newCreators);
                  }}
                  className="mr-1"
                />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
        </div>
        {creator.personType === "Personal" && (
          <>
            <div className="mt-2">
              <label className="block text-sm font-medium">Given Name</label>
              <input
                type="text"
                placeholder="Given Name"
                value={creator.givenName}
                onChange={(e) => {
                  const newCreators = [...creators];
                  newCreators[index].givenName = e.target.value;
                  setCreators(newCreators);
                }}
                className="w-full border rounded px-3 py-2 mt-1"
              />
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium">Family Name</label>
              <input
                type="text"
                placeholder="Family Name"
                value={creator.familyName}
                onChange={(e) => {
                  const newCreators = [...creators];
                  newCreators[index].familyName = e.target.value;
                  setCreators(newCreators);
                }}
                className="w-full border rounded px-3 py-2 mt-1"
              />
            </div>
          </>
        )}
        <div className="mt-2">
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            placeholder="Name"
            value={creator.name}
            onChange={(e) => {
              const newCreators = [...creators];
              newCreators[index].name = e.target.value;
              setCreators(newCreators);
            }}
            className="w-full border rounded px-3 py-2 mt-1"
          />
        </div>
        <div className="mt-2">
          <label className="block text-sm font-medium">Affiliation</label>
          <select
            value={creator.affiliation}
            onChange={(e) => {
              const newCreators = [...creators];
              newCreators[index].affiliation = e.target.value;
              setCreators(newCreators);
            }}
            className="w-full border rounded px-3 py-2 mt-1"
          >
            <option value="">Select Affiliation</option>
            <option value="Affiliation 1">Affiliation 1</option>
            <option value="Affiliation 2">Affiliation 2</option>
          </select>
        </div>
      </div>
    );
  };

  // Render title fields with a remove button.
  const renderTitleFields = (title: Title, index: number) => (
    <div key={index} className="border p-4 rounded mb-4 relative">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold">Title {index + 1}</h4>
        {titles.length > 1 && (
          <button
            type="button"
            onClick={() => removeAt(index, titles, setTitles)}
            className="text-red-500 hover:text-red-700"
            title="Remove title"
          >
            Remove
          </button>
        )}
      </div>
      <div className="mt-2">
        <label className="block text-sm font-medium">Title</label>
        <input
          type="text"
          placeholder="Title"
          value={title.title}
          onChange={(e) => {
            const newTitles = [...titles];
            newTitles[index].title = e.target.value;
            setTitles(newTitles);
          }}
          className="w-full border rounded px-3 py-2 mt-1"
        />
      </div>
      <div className="mt-2">
        <label className="block text-sm font-medium">Title Type</label>
        <select
          value={title.titleType}
          onChange={(e) => {
            const newTitles = [...titles];
            newTitles[index].titleType = e.target.value;
            setTitles(newTitles);
          }}
          className="w-full border rounded px-3 py-2 mt-1"
        >
          <option value="">Select Title Type</option>
          <option value="Main">Main</option>
          <option value="Subtitle">Subtitle</option>
        </select>
      </div>
      <div className="mt-2">
        <label className="block text-sm font-medium">Language</label>
        <select
          value={title.language}
          onChange={(e) => {
            const newTitles = [...titles];
            newTitles[index].language = e.target.value;
            setTitles(newTitles);
          }}
          className="w-full border rounded px-3 py-2 mt-1"
        >
          <option value="">Select Language</option>
          {Object.entries(languages).sort((a, b) => {
            if (a[1] < b[1]) return -1;
            if (a[1] > b[1]) return 1;
            return 0;
            }).map(value=>(
            <option key={value[0]} value={value[0]}>{value[1]}</option>))}
        </select>
      </div>
    </div>
  );

  // For recommended/optional properties, render a simple input with add/remove.
  const renderDynamicList = (
    label: string,
    items: string[],
    setItems: (items: string[]) => void
  ) => (
    <div className="grid grid-cols-3 gap-4 items-start mb-4">
      <label className="col-span-1 font-semibold">{label}</label>
      <div className="col-span-2">
        <div className="flex flex-col space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index] = e.target.value;
                  setItems(newItems);
                }}
                className="flex-1 border rounded px-3 py-2"
              />
              <button
                type="button"
                onClick={() => removeAt(index, items, setItems)}
                className="ml-2 text-red-500 hover:text-red-700"
                title={`Remove ${label.toLowerCase()}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setItems([...items, ""])}
          className="mt-2 inline-flex items-center px-3 py-2 border border-yellow-500 text-yellow-500 rounded hover:bg-yellow-500 hover:text-white"
        >
          Add {label.toLowerCase()}
        </button>
      </div>
    </div>
  );
  const RedStar :FC = ()=><span className='text-lg text-red-700'>*</span>
  return (<><SignButton/>
    <form noValidate onSubmit={handleSubmit} className="space-y-8">
      {/* Required Properties */}
      <h3 className="text-2xl font-bold">Required Properties</h3>
      {/* DOI Field */}
      <div className="grid grid-cols-3 gap-4 items-start">
        <label htmlFor="doi" className="col-span-1 font-semibold">DOI</label>
        <div className="col-span-2">
          <p className="text-sm text-gray-600 mb-2">
            A globally unique string that identifies the resource and cannot be changed.
          </p>
          <div className="flex">
            <div className="flex items-center border border-gray-300 rounded-l px-3 py-2 bg-gray-100">
              {prefix}
            </div>
            <input
              id="suffix-field"
              type="text"
              placeholder="Suffix"
              value={suffix}
              onChange={(e) => setSuffix(e.target.value)}
              className="flex-1 border-t border-b border-gray-300 px-3 py-2 focus:outline-none"
            />
            <div className="flex items-center border border-gray-300 rounded-r">
              <button
                type="button"
                title="Refresh"
                className="px-2 py-2 text-gray-500 hover:text-gray-700"
                onClick={()=>setSuffix(()=>genSuffix())}
              >
                {/* Refresh icon */}
                <svg fill="#000000" className="h-5 w-5" version="1.1" id="Capa_1" 
                xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" 
                viewBox="0 0 489.645 489.645" xmlSpace="preserve"><g id="SVGRepo_bgCarrier" 
                strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" 
                strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> 
                  <path d="M460.656,132.911c-58.7-122.1-212.2-166.5-331.8-104.1c-9.4,5.2-13.5,16.6-8.3,27c5.2,9.4,16.6,13.5,27,8.3 c99.9-52,227.4-14.9,276.7,86.3c65.4,134.3-19,236.7-87.4,274.6c-93.1,51.7-211.2,17.4-267.6-70.7l69.3,14.5 c10.4,2.1,21.8-4.2,23.9-15.6c2.1-10.4-4.2-21.8-15.6-23.9l-122.8-25c-20.6-2-25,16.6-23.9,22.9l15.6,123.8 c1,10.4,9.4,17.7,19.8,17.7c12.8,0,20.8-12.5,19.8-23.9l-6-50.5c57.4,70.8,170.3,131.2,307.4,68.2 C414.856,432.511,548.256,314.811,460.656,132.911z"></path> </g> </g></svg>
              </button>
              <button
                type="button"
                title="Clear"
                onClick={() => setSuffix("")}
                className="px-2 py-2 text-gray-500 hover:text-gray-700"
              >
                {/* Clear icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Click refresh for a new random suffix, or clear to enter manually.
          </p>
        </div>
      </div>
      {/* DOI State */}
      <div className="grid grid-cols-3 gap-4 items-start">
        <label className="col-span-1 font-semibold">State</label>
        <div className="col-span-2">
          <p className="text-sm text-gray-600 mb-2">
            The state determines whether a DOI is registered and findable. Once in Registered or Findable state, a DOI cannot be set back to Draft.
            <a href="https://support.datacite.org/docs/doi-states" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline ml-1">
              More…
            </a>
          </p>
          <div className="flex items-center space-x-4">
            {["draft", "registered", "findable"].map((state) => (
              <label key={state} className="flex items-center">
                <input
                  type="radio"
                  name="doiState"
                  value={state}
                  checked={doiState === state}
                  onChange={() => setDoiState(state)}
                  className="mr-1"
                />
                <span className="text-sm">
                  {state.charAt(0).toUpperCase() + state.slice(1)}
                  {state === "draft" && <span className="text-xs text-gray-500 ml-1">(only visible in Fabrica, DOI can be deleted)</span>}
                  {state === "registered" && <span className="text-xs text-gray-500 ml-1">(registered with the DOI Resolver)</span>}
                  {state === "findable" && <span className="text-xs text-gray-500 ml-1">(registered and indexed)</span>}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
      {/* URL Field */}
      <div className="grid grid-cols-3 gap-4 items-start">
        <label htmlFor="url-field" className="col-span-1 font-semibold">URL  <RedStar/></label>
        <div className="col-span-2">
          <p className="text-sm text-gray-600 mb-2">
            The landing page URL with more information about the resource.
          </p>
          <input
            id="url-field"
            type="text"
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Should be an https URL (or http/ftp if allowed). E.g., http://example.org
          </p>
        </div>
      </div>
      {/* Creators */}
      <div className="space-y-4">
        <label className="block text-lg font-bold">Creators <RedStar/></label>
        {creators.map((creator, index) => renderCreatorFields(creator, index))}
        <button
          type="button"
          onClick={() =>
            setCreators([
              ...creators,
              { nameIdentifier: "", personType: "Unknown", givenName: "", familyName: "", name: "", affiliation: "" }
            ])
          }
          className="inline-flex items-center px-3 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white"
        >
          Add another creator
        </button>
      </div>
      {/* Titles */}
      <div className="space-y-4">
        <label className="block text-lg font-bold">Titles <RedStar/></label>
        {titles.map((title, index) => renderTitleFields(title, index))}
        <button
          type="button"
          onClick={() => setTitles([...titles, { title: "", titleType: "", language: "" }])}
          className="inline-flex items-center px-3 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white"
        >
          Add another title
        </button>
      </div>
      {/* Publisher */}
      <div className="grid grid-cols-3 gap-4 items-start">
        <label className="col-span-1 font-semibold">Publisher <RedStar/></label>
        <div className="col-span-2">
          <p className="text-sm text-gray-600 mb-2">
            The name of the entity that holds or publishes the resource.
          </p>
          {/* <select
            value={publisher}
            required
            onChange={(e) => setPublisher(e.target.value)}
            onClick={handlePublisherClick}
            className="w-full border rounded px-3 py-2 focus:outline-none"
          >
            <option value="">Select publisher</option>
            <option value="Publisher 1">Publisher 1</option>
            <option value="Publisher 2">Publisher 2</option>
          </select> */}
          <input
            type="text"
            placeholder="Type a publisher..."
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
            value={publisherQuery}
            onChange={(e) => {
              setPublisherQuery(e.target.value);
              setPublisher(e.target.value)
              setShowPubDropdown(true);
            }}
          />
          {showPubDropdown && results.length > 0 && (
          <ul className="top-12 left-0 w-full bg-white border border-gray-300 rounded shadow-md">
            {results.map((publisher) => (
              <li
                key={publisher.ror_id + publisher.name}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onMouseDown={() => {handlePublisherClick(publisher.ror_id); setShowPubDropdown(false)
                  setPublisherQuery(publisher.name);
                  setPublisher(publisher.name)
                }}
              >
                {publisher.name}
              </li>
          ))}
          </ul>
        )}
        {publisherRorId.trim()!=='' && (
            <p className="mt-2 text-sm text-gray-700">
              ROR ID: <span className="font-mono"><Link href={publisherRorId} target='blank'>
              {publisherRorId}</Link></span>
            </p>
          )}
        </div>
      </div>
      {/* Publication Year */}
      <div className="grid grid-cols-3 gap-4 items-start">
        <label htmlFor="publication-year-field" className="col-span-1 font-semibold">Publication Year <RedStar/></label>
        <div className="col-span-2">
          <p className="text-sm text-gray-600 mb-2">
            The year when the resource was or will be made publicly available.
          </p>
          <input
            id="publication-year-field"
            type="text"
            required
            placeholder="Publication Year"
            value={publicationYear}
            onChange={(e) => setPublicationYear(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">Must be a year between 1000 and 2030.</p>
        </div>
      </div>
      {/* Resource Type General and Resource Type */}
      <div className="grid grid-cols-3 gap-4 items-start">
        <label className="col-span-1 font-semibold">Resource Type General <RedStar/> </label>
        <div className="col-span-2">
          <p className="text-sm text-gray-600 mb-2">
            The general type of the resource.
          </p>
          <select
            value={resourceTypeGeneral}
            required
            onChange={(e) => setResourceTypeGeneral(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none"
          >
            <option value="">Select Resource Type General</option>
            <option value="Text">Text</option>
            <option value="Image">Image</option>
            <option value="Dataset">Dataset</option>
            <option value="Other">Other</option>
          </select>
          {resourceTypeGeneral === "Other" && (
            <div className="mt-2">
              <label className="block text-sm font-medium">Resource Type</label>
              <input
                type="text"
                placeholder="Resource Type"
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide a detailed description of the resource type.
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Recommended Properties */}
      <h3 className="text-2xl font-bold">Recommended Properties</h3>
      {renderDynamicList("Subjects", subjects, setSubjects)}
      {renderDynamicList("Contributors", contributors, setContributors)}
      {renderDynamicList("Dates", dates, setDates)}
      {renderDynamicList("Related Identifiers", relatedIdentifiers, setRelatedIdentifiers)}
      {renderDynamicList("Descriptions", descriptions, setDescriptions)}
      {renderDynamicList("Geolocations", geolocations, setGeolocations)}
      {/* Optional Properties */}
      <h3 className="text-2xl font-bold">Optional Properties</h3>
      {renderDynamicList("Language", [optLanguage], (vals) => setOptLanguage(vals[0] || ""))}
      {renderDynamicList("Alternate Identifiers", alternateIdentifiers, setAlternateIdentifiers)}
      {renderDynamicList("Rights", rights, setRights)}
      {renderDynamicList("Sizes", sizes, setSizes)}
      {renderDynamicList("Formats", formats, setFormats)}
      <div className="grid grid-cols-3 gap-4 items-start mb-4">
        <label htmlFor="version-field" className="col-span-1 font-semibold">Version</label>
        <div className="col-span-2">
          <p className="text-sm text-gray-600 mb-2">
            The version number of the resource.
          </p>
          <input
            id="version-field"
            type="text"
            placeholder="Version"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="w-full border rounded px-3 py-2 focus:outline-none"
          />
        </div>
      </div>
      {renderDynamicList("Funding References", fundingReferences, setFundingReferences)}
      {renderDynamicList("Related Items", relatedItems, setRelatedItems)}
      {/* Form Actions */}
      <div className="flex space-x-4">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Create DOI
        </button>
        <button type="button" className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
          Cancel
        </button>
      </div>
      {message && <p className="mt-4 text-green-600 font-semibold">{message}</p>}
      {error && <p className="mt-4 text-red-600 font-semibold">{error}</p>}
    </form></>
  );
};

export default DOIForm;
