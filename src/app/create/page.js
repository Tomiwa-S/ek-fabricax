'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { doiTypes } from './doiTypes';

const titleTypes = ['Title', 'Subtitle', 'AlternativeTitle', 'TranslatedTitle'];
const resourceTypeGenerals = doiTypes;
const nameIdentifierSchemes = ['ORCID', 'ROR', 'ISNI', 'Other'];


export default function CreateDoiFabricaStyle() {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      // Basic fields
      autoGenerate: true,
      doi: '',
      prefix: '',
      // For simplicity, we’ll store the “State” as a string: 'draft' | 'registered' | 'findable'
      state: 'draft',
      url: '',
      publicationYear: '',
      resourceTypeGeneral: 'Dataset',
      resourceType: '',
      // Publisher object (you can add an orcId if needed)
      publisher: {
        name: '',
      },
      // Titles (array for multiple titles)
      titles: [
        {
          title: '',
          titleType: 'Title',
          language: '',
        },
      ],
      // Creators (array of creators, each with multiple name identifiers and affiliations)
      creators: [
        {
          nameType: 'Person', // or "Organization" if needed
          nameIdentifiers: [
            {
              nameIdentifier: '',
              nameIdentifierScheme: 'ORCID',
            },
          ],
          givenName: '',
          familyName: '',
          // If you prefer storing fullName in “name,” adjust accordingly
          name: '',
          affiliations: [
            {
              affiliationName: '',
              affiliationIdentifier: '',
              affiliationIdentifierScheme: 'ROR',
            },
          ],
        },
      ],
    },
  });

  // Field arrays for Titles and Creators
  const {
    fields: titleFields,
    append: appendTitle,
    remove: removeTitle,
  } = useFieldArray({
    control,
    name: 'titles',
  });

  const {
    fields: creatorFields,
    append: appendCreator,
    remove: removeCreator,
  } = useFieldArray({
    control,
    name: 'creators',
  });

  // Local state for submission feedback
  const [submitResult, setSubmitResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Transform form data to a structure matching the DataCite API if desired.
   * For example, DataCite uses `event = publish|register|hide` instead of “draft|registered|findable.”
   */
  function transformToDataCitePayload(formData) {
    let event;
    if (formData.state === 'draft') event = 'hide';
    else if (formData.state === 'registered') event = 'register';
    else if (formData.state === 'findable') event = 'publish';

    return {
      data: {
        type: 'dois',
        attributes: {
          // If autoGenerate is true, we typically only supply the prefix
          // and let DataCite generate the suffix. Otherwise, supply full doi.
          doi: formData.autoGenerate ? undefined : formData.doi || undefined,
          prefix: formData.autoGenerate ? formData.prefix || undefined : undefined,
          event,
          // Title(s)
          titles: formData.titles.map((t) => ({
            title: t.title,
            titleType: t.titleType !== 'Title' ? t.titleType : undefined,
            lang: t.language || undefined,
          })),
          // Publisher
          publisher: formData.publisher.name,
          // Publication Year
          publicationYear: parseInt(formData.publicationYear, 10) || undefined,
          // Resource Type
          types: {
            resourceTypeGeneral: formData.resourceTypeGeneral,
            resourceType: formData.resourceType || undefined,
          },
          // URL
          url: formData.url,
          // Creators
          creators: formData.creators.map((c) => ({
            name: c.name || `${c.givenName} ${c.familyName}`.trim(),
            nameType: c.nameType === 'Organization' ? 'Organizational' : 'Personal',
            // nameType:'Personal',
            givenName: c.givenName || undefined,
            familyName: c.familyName || undefined,
            // Convert nameIdentifiers
            nameIdentifiers: c.nameIdentifiers
              .filter((ni) => ni.nameIdentifier)
              .map((ni) => ({
                nameIdentifier: ni.nameIdentifier,
                nameIdentifierScheme: ni.nameIdentifierScheme,
              })),
            // Affiliations
            affiliation: c.affiliations
              .filter((aff) => aff.affiliationName)
              .map((aff) => ({
                name: aff.affiliationName,
                affiliationIdentifier: aff.affiliationIdentifier || undefined,
                affiliationIdentifierScheme: aff.affiliationIdentifierScheme || undefined,
              })),
          })),
        },
      },
    };
  }

  /**
   * Submit handler
   */
  const onSubmit = async (formData) => {
    setLoading(true);
    setSubmitResult(null);
    setSubmitError(null);

    // Minimal client-side checks
    if (formData.autoGenerate && !formData.prefix) {
      setSubmitError('Prefix is required when auto-generating a DOI.');
      setLoading(false);
      return;
    }
    if (!formData.autoGenerate && !formData.doi) {
      setSubmitError('Please provide a full DOI if auto-generation is not used.');
      setLoading(false);
      return;
    }
    if (!formData.url) {
      setSubmitError('URL is required.');
      setLoading(false);
      return;
    }

    // Transform to DataCite-friendly structure
    const payload = transformToDataCitePayload(formData);

    try {
      // Example: Submit to your Next.js API route
      const res = await fetch('/api/fabrica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        
        throw new Error(data.error ? data.error : 'An error occurred.');
      }


      router.push(`/doi?data=${encodeURIComponent(JSON.stringify(data))}`)
      // setSubmitResult(data);
    } catch (err) {
      console.log(JSON.stringify(err.message))
      setSubmitError(err.message);
    }
    setLoading(false);
  };

  // Watch autoGenerate to conditionally display prefix or full doi
  const autoGenerate = watch('autoGenerate');
  const stateValue = watch('state');

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-6">Create a New DOI (Fabrica-Style)</h1>

        {/* Error/Success Messages */}
        {submitError && <div className="mb-4 text-red-600">{submitError}</div>}
        {submitResult && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">
            DOI created successfully!<br />
            {/* <span className="font-mono">{JSON.stringify(submitResult, null, 2)}</span> */}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 1. DOI Section */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-2">DOI</h2>
            <p className="text-sm text-gray-500 mb-2">
              A globally unique string that identifies the resource and can’t be changed.
            </p>
            <label className="flex items-center space-x-2">
              <input type="checkbox" {...register('autoGenerate')} />
              <span>Auto-generate suffix</span>
            </label>
            {autoGenerate ? (
              <div className="mt-2">
                <label className="block font-medium">Prefix</label>
                <input
                  type="text"
                  {...register('prefix')}
                  placeholder="e.g. 10.1234"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            ) : (
              <div className="mt-2">
                <label className="block font-medium">Full DOI</label>
                <input
                  type="text"
                  {...register('doi')}
                  placeholder="e.g. 10.1234/abcd1234"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            )}
          </div>

          {/* 2. State Section (Draft, Registered, Findable) */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-2">State</h2>
            <p className="text-sm text-gray-500 mb-2">
              The state determines whether a DOI is registered and findable. Once in Registered or Findable,
              a DOI can’t be set back to Draft.
            </p>
            <div className="flex flex-col space-y-2">
              <label className="inline-flex items-center space-x-2">
                <input type="radio" value="draft" {...register('state')} />
                <span>Draft (only visible in Fabrica, can be deleted)</span>
              </label>
              <label className="inline-flex items-center space-x-2">
                <input type="radio" value="registered" {...register('state')} />
                <span>Registered (visible with the DOI Resolver)</span>
              </label>
              <label className="inline-flex items-center space-x-2">
                <input type="radio" value="findable" {...register('state')} />
                <span>Findable (visible with the DOI Resolver and indexed in DataCite Search)</span>
              </label>
            </div>
          </div>

          {/* 3. URL */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-2">URL</h2>
            <p className="text-sm text-gray-500 mb-2">
              The location of the landing page with more information about the resource.
            </p>
            <input
              type="url"
              {...register('url')}
              placeholder="e.g. https://example.org"
              className="block w-full border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          {/* 4. Creators */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-2">Creators</h2>
            <p className="text-sm text-gray-500 mb-2">
              The main researchers or organizations involved in producing the resource, in priority order.
            </p>
            {creatorFields.map((creator, cIndex) => (
              <CreatorSection
                key={creator.id}
                index={cIndex}
                control={control}
                register={register}
                removeCreator={removeCreator}
              />
            ))}
            <button
              type="button"
              onClick={() =>
                appendCreator({
                  nameType: 'Person',
                  nameIdentifiers: [{ nameIdentifier: '', nameIdentifierScheme: 'ORCID' }],
                  givenName: '',
                  familyName: '',
                  name: '',
                  affiliations: [{ affiliationName: '', affiliationIdentifier: '', affiliationIdentifierScheme: 'ROR' }],
                })
              }
              className="mt-2 inline-block bg-blue-500 text-white py-1 px-3 rounded"
            >
              + Add another creator
            </button>
          </div>

          {/* 5. Titles */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-2">Titles</h2>
            <p className="text-sm text-gray-500 mb-2">
              One or more names or titles by which the resource is known.
            </p>
            {titleFields.map((titleField, tIndex) => (
              <div key={titleField.id} className="border p-3 rounded mb-2">
                <label className="block font-medium">Title</label>
                <input
                  type="text"
                  {...register(`titles.${tIndex}.title`)}
                  placeholder="e.g. My Research Data"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                />

                <label className="block font-medium mt-2">Title Type</label>
                <select
                  {...register(`titles.${tIndex}.titleType`)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                >
                  {titleTypes.map((tt) => (
                    <option key={tt} value={tt}>
                      {tt}
                    </option>
                  ))}
                </select>

                <label className="block font-medium mt-2">Language</label>
                <input
                  type="text"
                  {...register(`titles.${tIndex}.language`)}
                  placeholder="e.g. en"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
                />

                {titleFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTitle(tIndex)}
                    className="mt-2 inline-block bg-red-500 text-white py-1 px-3 rounded"
                  >
                    Hide this title
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                appendTitle({ title: '', titleType: 'Title', language: '' })
              }
              className="mt-2 inline-block bg-blue-500 text-white py-1 px-3 rounded"
            >
              + Add another title
            </button>
          </div>

          {/* 6. Publisher */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-2">Publisher</h2>
            <p className="text-sm text-gray-500 mb-2">
              The name of the entity that holds, archives, prints, or distributes the resource.
            </p>
            <input
              type="text"
              {...register('publisher.name')}
              placeholder="e.g. My Organization"
              className="block w-full border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          {/* 7. Publication Year */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-2">Publication Year</h2>
            <p className="text-sm text-gray-500 mb-2">
              The year when the resource was or will be made publicly available. Must be between 1000 and 2030.
            </p>
            <input
              type="number"
              {...register('publicationYear')}
              placeholder="e.g. 2025"
              className="block w-full border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          {/* 8. Resource Type General */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-2">Resource Type General</h2>
            <select
              {...register('resourceTypeGeneral')}
              className="block w-full border-gray-300 rounded-md shadow-sm p-2"
            >
              {resourceTypeGenerals.map((rtg) => (
                <option key={rtg} value={rtg}>
                  {rtg}
                </option>
              ))}
            </select>
          </div>

          {/* 9. Resource Type (Detailed) */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-2">Resource Type</h2>
            <p className="text-sm text-gray-500 mb-2">
              A description of the resource type, the preferred format is a single term of some detail.
            </p>
            <input
              type="text"
              {...register('resourceType')}
              placeholder="e.g. Questionnaire"
              className="block w-full border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
            >
              {loading ? 'Processing...' : 'Create DOI'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Creator Section:
 * A sub-component that handles a single creator and its nested field arrays (name identifiers, affiliations).
 */
function CreatorSection({ index, control, register, removeCreator }) {
  // For nameIdentifiers
  const {
    fields: nameIdFields,
    append: appendNameId,
    remove: removeNameId,
  } = useFieldArray({
    control,
    name: `creators.${index}.nameIdentifiers`,
  });

  // For affiliations
  const {
    fields: affFields,
    append: appendAff,
    remove: removeAff,
  } = useFieldArray({
    control,
    name: `creators.${index}.affiliations`,
  });

  return (
    <div className="border p-3 rounded mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Creator {index + 1}</h3>
        <button
          type="button"
          onClick={() => removeCreator(index)}
          className="bg-red-500 text-white py-1 px-3 rounded"
        >
          {`Hide creator`}
        </button>
      </div>

      <label className="block font-medium">Name Type</label>
      <select
        {...register(`creators.${index}.nameType`)}
        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
      >
        <option value="Person">Person</option>
        {/* <option value="Organization">Organization</option> */}
      </select>

     

      <div className="mt-4">
        <label className="block font-medium">Given Name</label>
        <input
          type="text"
          {...register(`creators.${index}.givenName`)}
          placeholder="Given Name"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div className="mt-2">
        <label className="block font-medium">Family Name</label>
        <input
          type="text"
          {...register(`creators.${index}.familyName`)}
          placeholder="Family Name"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div className="mt-2">
        <label className="block font-medium">Full Name (Optional)</label>
        <input
          type="text"
          {...register(`creators.${index}.name`)}
          placeholder="If you prefer storing the complete name in a single field"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div className="mt-2">
        <label className="block font-medium">Name Identifier(s)</label>
        <p className="text-sm text-gray-500 mb-2">
          Use name identifier expressed as a URL. E.g., ORCID, ROR, ISNI.
        </p>
        {nameIdFields.map((nid, nIndex) => (
          <div key={nid.id} className="border p-2 rounded mb-2">
            <label className="block font-medium">Identifier</label>
            <input
              type="text"
              {...register(`creators.${index}.nameIdentifiers.${nIndex}.nameIdentifier`)}
              placeholder="https://orcid.org/0000-0002-1825-0097"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            />
            <label className="block font-medium mt-2">Scheme</label>
            <select
              {...register(`creators.${index}.nameIdentifiers.${nIndex}.nameIdentifierScheme`)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            >
              {nameIdentifierSchemes.map((scheme) => (
                <option key={scheme} value={scheme}>
                  {scheme}
                </option>
              ))}
            </select>
            {nameIdFields.length > 1 && (
              <button
                type="button"
                onClick={() => removeNameId(nIndex)}
                className="mt-2 bg-red-500 text-white py-1 px-2 rounded"
              >
                Remove Identifier
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            appendNameId({ nameIdentifier: '', nameIdentifierScheme: 'ORCID' })
          }
          className="bg-blue-500 text-white py-1 px-2 rounded"
        >
          + Add another name identifier
        </button>
      </div>

      <div className="mt-4">
        <label className="block font-medium">Affiliations</label>
        <p className="text-sm text-gray-500 mb-2">
          Affiliation names and identifiers are provided by the Research Organization Registry (ROR) or similar.
        </p>
        {affFields.map((aff, affIndex) => (
          <div key={aff.id} className="border p-2 rounded mb-2">
            <label className="block font-medium">Affiliation Name</label>
            <input
              type="text"
              {...register(`creators.${index}.affiliations.${affIndex}.affiliationName`)}
              placeholder="e.g. University of Example"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            />
            <label className="block font-medium mt-2">Affiliation Identifier (ROR)</label>
            <input
              type="text"
              {...register(`creators.${index}.affiliations.${affIndex}.affiliationIdentifier`)}
              placeholder="e.g. https://ror.org/xxxxxxx"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            />
            {/* <label className="block font-medium mt-2">Affiliation Identifier Scheme</label>
            <input
              type="text"
              {...register(`creators.${index}.affiliations.${affIndex}.affiliationIdentifierScheme`)}
              placeholder="e.g. ROR"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2"
            /> */}
            {affFields.length > 1 && (
              <button
                type="button"
                onClick={() => removeAff(affIndex)}
                className="mt-2 bg-red-500 text-white py-1 px-2 rounded"
              >
                Remove Affiliation
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            appendAff({
              affiliationName: '',
              affiliationIdentifier: '',
              affiliationIdentifierScheme: 'ROR',
            })
          }
          className="bg-blue-500 text-white py-1 px-2 rounded"
        >
          + Add another affiliation
        </button>
      </div>
    </div>
  );
}
