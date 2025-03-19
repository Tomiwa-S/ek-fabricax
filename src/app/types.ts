export type CreatorType = 'Personal' | 'Organizational' | 'Unknown';

export interface Creator {
  nameIdentifier: string;
  personType: CreatorType;
  // For personal, show given and family names; for others these may be omitted.
  givenName?: string;
  familyName?: string;
  name: string;
  affiliation: string;
}

export interface Title {
  title: string;
  titleType: string;
  language: string;
}

export interface DOIAttributes {
  doi: string;
  state: string;
  url: string;
  creators: Creator[];
  titles: Title[];
  publisher: string;
  publisherRorId?: string;
  publicationYear: string;
  resourceTypeGeneral: string;
  resourceType: string;
  subjects: string[];
  contributors: string[];
  dates: string[];
  relatedIdentifiers: string[];
  descriptions: string[];
  geolocations: string[];
  language: string;
  alternateIdentifiers: string[];
  rights: string[];
  sizes: string[];
  formats: string[];
  version: string;
  fundingReferences: string[];
  relatedItems: string[];
}

export interface DOIData {
  data: {
    type: 'dois';
    attributes: DOIAttributes;
  };
}
