import React, { useState, FC, FormEvent, useEffect } from 'react';
import { languages } from './lang';
import { Creator, CreatorType, DOIData, PublisherClass, Title } from '../types';
import { toast, ToastContainer } from 'react-toastify';
import { useRouter } from 'next/navigation';
import SignButton from './signButton';
import Link from 'next/link';

interface DOIFormProp {
  action: 'create' | 'update';
  doiId?: string; // In update mode, the DOI id must be provided
}

type Publisher = {
  name: string;
  ror_id: string;
};

async function getPrefixes() {
  const response = await fetch(`/api/fabrica/prefix`);
  return await response.json();
}

async function fetchDOIMetadata(id: string) {
  const res = await fetch(`/api/fabrica?doi=${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch DOI metadata");
  }
  return await res.json();
}

const UpdateDOIForm: FC<DOIFormProp> = ({ action, doiId }) => {

  const genSuffix = () => Math.random().toString(36).substring(2, 8);

  // Form state variables.
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState(action === 'create' ? genSuffix() : "");
  const [doiState, setDoiState] = useState("draft");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Publisher[]>([]);
  const [error, setError] = useState<null | string>(null);
  const router = useRouter();

  // Creators and Titles, etc.
  const [creators, setCreators] = useState<Creator[]>([{
    nameIdentifiers: [],
    personType: "Unknown",
    givenName: "",
    familyName: "",
    name: "",
    affiliation: ""
  }]);
  const [titles, setTitles] = useState<Title[]>([{ title: "", titleType: "", language: "" }]);
  const [publisher, setPublisher] = useState("");
  const [publisherRorId, setPublisherRorId] = useState<string>("");
  const [publisherQuery, setPublisherQuery] = useState<string>('');
  const [showPubDropdown, setShowPubDropdown] = useState<boolean>(false);
  const [publicationYear, setPublicationYear] = useState("");
  const [resourceTypeGeneral, setResourceTypeGeneral] = useState("");
  const [resourceType, setResourceType] = useState("");
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

  const notifyError = (msg?: string) => toast.error(msg ?? error ?? 'Operation Failed');
  const notifySuccess = (msg: string) => toast.success(msg);

  async function fetchOrganizations(org: string): Promise<any> {
    const url = `/api/ror?org=${encodeURIComponent(org)}`;
    try {
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching organizations:", err);
      return [];
    }
  }

  // If updating, load the existing DOI metadata.
  useEffect(() => {
    if (action === 'update' && doiId) {
      (async () => {
        try {
          const attributes= await fetchDOIMetadata(doiId);
        //   console.log("Data", data);
        //   const {attributes} = data;
          // Assume response is structured as: { data: { id, attributes: { doi, state, url, ... } } }
        //   const attributes = data.data.attributes;
          // Split the doi to get prefix and suffix.
          console.log("Attributes", attributes)
          const doi = attributes.doi;
          const parts = doi.split('/');
          if (parts.length === 2) {
            setPrefix(parts[0]);
            setSuffix(parts[1]);
          }
          setDoiState(attributes.state);
          setUrl(attributes.url);
          setCreators(attributes.creators);
          setTitles(attributes.titles);
          setPublisher(attributes.publisher);
          setPublisherQuery(attributes.publisher)
          setPublisherRorId(attributes.publisherRorId);
          setPublicationYear(attributes.publicationYear);
          setResourceTypeGeneral(attributes.types);
          setResourceType(attributes.resourceType);
          setSubjects(attributes.subjects || []);
          setContributors(attributes.contributors || []);
          setDates(attributes.dates || []);
          setRelatedIdentifiers(attributes.relatedIdentifiers || []);
          setDescriptions(attributes.descriptions || []);
          setGeolocations(attributes.geolocations || []);
          setOptLanguage(attributes.language || "");
          setAlternateIdentifiers(attributes.alternateIdentifiers || []);
          setRights(attributes.rights || []);
          setSizes(attributes.sizes || []);
          setFormats(attributes.formats || []);
          setVersion(attributes.version || "");
          setFundingReferences(attributes.fundingReferences || []);
          setRelatedItems(attributes.relatedItems || []);
        } catch (err: any) {
          console.error(err)
          notifyError("Failed to fetch DOI metadata.");
        }
      })();
    } else {
      // For create mode, load the prefix.
      getPrefixes().then(res => setPrefix(res[0]));
    }
  }, [action, doiId]);

  // Helper to remove an item from a dynamic list.
  const removeAt = (index: number, list: any[], setter: (list: any[]) => void) => {
    const newList = list.filter((_, i) => i !== index);
    setter(newList);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const doi = `${prefix}/${suffix}`;

    const requiredFields = [doi, doiState, url, creators, titles, publicationYear, resourceTypeGeneral];

    for (let i = 0; i < requiredFields.length; i++) {
      if (!requiredFields[i]) {
        notifyError("Please make sure all the required fields are filled");
        setLoading(false);
        return;
      }
    }

    const attributes = {
      doi,
      state: doiState,
      url,
      creators,
      titles,
      publisher: new PublisherClass(),
      publisherRorId,
      publicationYear,
      type:{
        'resourceTypeGeneral':resourceTypeGeneral
      },
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

    try {
      const res = await fetch(
        action === 'create' ? '/api/fabrica' : `/api/fabrica?id=${doiId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        notifyError();
        setLoading(false);
        return;
      }
      const { data } = await res.json();
      const { id } = data;
      notifySuccess(action === 'create' ? "DOI Successfully Created" : "DOI Successfully Updated");
      if (id) router.push(`/doi/${encodeURIComponent(id)}`);
    } catch (err: any) {
      setError(err.message);
      notifyError(err.message);
    }
    setLoading(false);
  };

  const handlePublisherClick = (ror: string) => {
    setPublisherRorId(ror);
  };

  useEffect(() => {
    (async () => {
      await fetchOrganizations(publisherQuery).then(data => setResults(data));
      if (action === 'create') {
        await getPrefixes().then(res => setPrefix(res[0]));
      }
    })();
  }, [publisherQuery, action]);

  // Renders dynamic creator fields.
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
            value={creator.nameIdentifiers[index]?.nameIdentifier  ||''}
            required
            onChange={(e) => {
              const newCreators = [...creators];
              newCreators[index].nameIdentifiers[index].addId(e.target.value);
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

  // Renders title fields.
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
          {Object.entries(languages)
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
        </select>
      </div>
    </div>
  );

  // Renders dynamic list fields for optional/recommended properties.
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

  const RedStar: FC = () => <span className="text-lg text-red-700">*</span>;

  return (
    <>
      <SignButton />
      <form noValidate onSubmit={handleSubmit} className="space-y-8">
        <h3 className="text-2xl font-bold">
          {action === 'create' ? "Create DOI" : "Update DOI"}
        </h3>
        {/* DOI Field */}
        <div className="grid grid-cols-3 gap-4 items-start">
          <label htmlFor="doi" className="col-span-1 font-semibold">
            DOI
          </label>
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
                disabled={action === 'update'} // Optionally disable editing the suffix when updating.
              />
              <div className="flex items-center border border-gray-300 rounded-r">
                {action === 'create' && (
                  <>
                    <button
                      type="button"
                      title="Refresh"
                      className="px-2 py-2 text-gray-500 hover:text-gray-700"
                      onClick={() => setSuffix(genSuffix())}
                    >
                      <svg fill="#000000" className="h-5 w-5" viewBox="0 0 489.645 489.645">
                        <path d="M460.656,132.911c-58.7-122.1-212.2-166.5-331.8-104.1c-9.4,5.2-13.5,16.6-8.3,27
                          c5.2,9.4,16.6,13.5,27,8.3c99.9-52,227.4-14.9,276.7,86.3c65.4,134.3-19,236.7-87.4,274.6
                          c-93.1,51.7-211.2,17.4-267.6-70.7l69.3,14.5c10.4,2.1,21.8-4.2,23.9-15.6
                          c2.1-10.4-4.2-21.8-15.6-23.9l-122.8-25c-20.6-2-25,16.6-23.9,22.9l15.6,123.8
                          c1,10.4,9.4,17.7,19.8,17.7c12.8,0,20.8-12.5,19.8-23.9l-6-50.5c57.4,70.8,170.3,131.2,307.4,68.2
                          C414.856,432.511,548.256,314.811,460.656,132.911z"></path>
                      </svg>
                    </button>
                    <button
                      type="button"
                      title="Clear"
                      onClick={() => setSuffix("")}
                      className="px-2 py-2 text-gray-500 hover:text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                           viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                )}
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
              The state determines whether a DOI is registered and findable.
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
                    {state === "draft" && (
                      <span className="text-xs text-gray-500 ml-1">
                        (only visible in Fabrica, DOI can be deleted)
                      </span>
                    )}
                    {state === "registered" && (
                      <span className="text-xs text-gray-500 ml-1">
                        (registered with the DOI Resolver)
                      </span>
                    )}
                    {state === "findable" && (
                      <span className="text-xs text-gray-500 ml-1">
                        (registered and indexed)
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
        {/* URL Field */}
        <div className="grid grid-cols-3 gap-4 items-start">
          <label htmlFor="url-field" className="col-span-1 font-semibold">
            URL <RedStar />
          </label>
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
              Should be an https URL (or http/ftp if allowed).
            </p>
          </div>
        </div>
        {/* Creators */}
        <div className="space-y-4">
          <label className="block text-lg font-bold">Creators <RedStar /></label>
          {creators.map((creator, index) => renderCreatorFields(creator, index))}
          <button
            type="button"
            onClick={() =>
              setCreators([...creators, {
                nameIdentifiers: [],
                personType: "Unknown",
                givenName: "",
                familyName: "",
                name: "",
                affiliation: ""
              }])
            }
            className="inline-flex items-center px-3 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-500 hover:text-white"
          >
            Add another creator
          </button>
        </div>
        {/* Titles */}
        <div className="space-y-4">
          <label className="block text-lg font-bold">Titles <RedStar /></label>
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
          <label className="col-span-1 font-semibold">Publisher <RedStar /></label>
          <div className="col-span-2">
            <p className="text-sm text-gray-600 mb-2">
              The name of the entity that holds or publishes the resource.
            </p>
            <input
              type="text"
              placeholder="Type a publisher..."
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none"
              value={publisherQuery}
              onChange={(e) => {
                setPublisherQuery(e.target.value);
                setPublisher(e.target.value);
                setShowPubDropdown(true);
              }}
            />
            {showPubDropdown && results.length > 0 && (
              <ul className="top-12 left-0 w-full bg-white border border-gray-300 rounded shadow-md">
                {results.map((pub) => (
                  <li
                    key={pub.ror_id + pub.name}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onMouseDown={() => {
                      handlePublisherClick(pub.ror_id);
                      setShowPubDropdown(false);
                      setPublisherQuery(pub.name);
                      setPublisher(pub.name);
                    }}
                  >
                    {pub.name}
                  </li>
                ))}
              </ul>
            )}
            {publisherRorId && publisherRorId.trim() !== '' && (
              <p className="mt-2 text-sm text-gray-700">
                ROR ID:{" "}
                <span className="font-mono">
                  <Link href={publisherRorId} target="_blank">
                    {publisherRorId}
                  </Link>
                </span>
              </p>
            )}
          </div>
        </div>
        {/* Publication Year */}
        <div className="grid grid-cols-3 gap-4 items-start">
          <label htmlFor="publication-year-field" className="col-span-1 font-semibold">
            Publication Year <RedStar />
          </label>
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
            <p className="text-xs text-gray-500 mt-1">
              Must be a year between 1000 and 2030.
            </p>
          </div>
        </div>
        {/* Resource Type General and Resource Type */}
        <div className="grid grid-cols-3 gap-4 items-start">
          <label className="col-span-1 font-semibold">
            Resource Type General <RedStar />
          </label>
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
          <label htmlFor="version-field" className="col-span-1 font-semibold">
            Version
          </label>
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
            {action === 'create' ? "Create DOI" : "Update DOI"}
          </button>
          <button type="button" className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
            Cancel
          </button>
        </div>
        {message && <p className="mt-4 text-green-600 font-semibold">{message}</p>}
        {error && <p className="mt-4 text-red-600 font-semibold">{error}</p>}
      </form>
    </>
  );
};

export default UpdateDOIForm;
