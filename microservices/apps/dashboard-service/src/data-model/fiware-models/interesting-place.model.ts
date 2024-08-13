export class InterestingPlaceModel {
  name: string;
  types: string[];
  address: {
    addressLocality: string;
    postalCode: string;
    streetAddress: string;
  };
  image: string;
  imagePreview: string;
  creator: string;
  location: {
    type: string;
    coordinates: number[];
  };
  info: string;
  zoomprio: string;
}
