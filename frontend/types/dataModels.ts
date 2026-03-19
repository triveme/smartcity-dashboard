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

export interface NewProject {
  title: string;
  description?: string | null;
  category?: string;
  status: string;
  cost?: number | null;
  district?: string | null;
  street_name?: string | null;
  location: Record<string, unknown>;
  line_locations?: Record<string, unknown>[] | null;
  contact_person: string;
  is_public?: boolean | null;
  start_date?: Date | null;
  end_date?: Date | null;
  tenantAbbreviation?: string | null;
}

export interface Project extends NewProject {
  id: string;
}
