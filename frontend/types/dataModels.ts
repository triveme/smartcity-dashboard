export type InterestingPlace = {
  id: string;
  name: string;
  types: string[];
  address: string;
  image: string;
  imagePreview: string;
  creator: string;
  location: LocationType;
  info: string;
  zoomprio: string;
  contactName?: string;
  contactPhone?: string;
  participants?: string;
  supporter?: string;
  email?: string;
  website?: string;
  description?: string;
};

export type LocationType = {
  type: string;
  coordinates: number[];
};

export type AddressModel = {
  addressLocality: string;
  postalCode: string;
  streetAddress: string;
};
