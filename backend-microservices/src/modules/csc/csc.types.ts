// src/modules/csc/csc.types.ts

export type CscApiResponse = {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
  phonecode: string;
  capital: string;
  currency: string;
  native: string | null;
  region: string;
  region_id: number;
  subregion: string;
  subregion_id: number;
  timezones: Array<{
    zoneName: string;
    gmtOffset: number;
    gmtOffsetName: string;
    abbreviation: string;
    tzName: string;
  }>;
  latitude: string;
  longitude: string;
  emoji: string;
};
