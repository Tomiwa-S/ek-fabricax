export const isProduction:boolean = process.env.NEXT_PUBLIC_IS_PROD === 'true';
export const isP = process.env.NEXT_PUBLIC_IS_PROD;
export const cookieName: string = 'ek-fabrica000';
export const apiBaseURL: string = 
    isProduction ? 'https://api.datacite.org' : 'https://api.test.datacite.org';

export const mdsBaseURL: string = 
    isProduction ?  'https://mds.datacite.org':  'https://mds.test.datacite.org';

// export const secretJWTKey = process.env.SECRET_KEY as string;
export const secretJWTKey = 'unknown';
