export type CreatorType = 'Personal' | 'Organizational' | 'Unknown';

export class NameIdentifier  {
    schemeUri= "https://orcid.org";
    nameIdentifier = "";
    nameIdentifierScheme= "ORCID";
    addId(url:string){
      this.nameIdentifier=url;
    }
}

export class PublisherClass{
  
    name = "DataCite";
    publisherIdentifier="";
    publisherIdentifierScheme="ROR";
    schemeUri= "https://ror.org/";
    addROR(ror:string){
      this.publisherIdentifier=ror;
    }

}

export interface Creator {
  nameIdentifiers: NameIdentifier[];
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
  doi?: string;
  state?: string;
  event?: string;
  url?: string;
  creators?: Creator[];
  titles?: Title[];
  publisher?: PublisherClass;
  publisherRorId?: string;
  publicationYear: string;
  resourceTypeGeneral?: string;
  resourceType?: string;
  subjects?: string[];
  contributors?: string[];
  dates?: string[];
  relatedIdentifiers?: string[];
  descriptions?: string[];
  geolocations?: string[];
  language?: string;
  alternateIdentifiers?: string[];
  rights?: string[];
  sizes?: string[];
  formats?: string[];
  version?: string;
  fundingReferences?: string[];
  relatedItems?: string[];
}

export interface DOIData {
  data: {
    type: 'dois';
    attributes: DOIAttributes;
  };
}
