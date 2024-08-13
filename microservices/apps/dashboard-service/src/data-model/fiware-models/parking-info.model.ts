export class ParkingInfoModel {
  name: string;
  maxHeight: number;
  capacity: number;
  location: {
    type: string;
    coordinates: number[];
  };
  currentlyUsed: number;
  maxValue: number;
  type: string;
  address?: {
    id: string;
    street: string;
    streetnumber: string;
    zipcode: string;
    city: string;
    breitengrad: number;
    laengengrad: number;
    breitengradDisplayInternational: string;
    laengengradDisplayInternational: string;
    breitengradDisplay: string;
    laengengradDisplay: string;
  };
}
