// test class for Wuppertal queryData... may be removed in production
export class ChargingStationModel {
  id: string;
  type: string;
  additionalInfo: {
    type: string;
    value: string;
    metadata: object;
    address: {
      type: string;
      value: {
        streetAddress: string;
        addressLocality: string;
        addressCountry: string;
      };
      metadata: object;
    };
    allowedVehicleType: {
      type: string;
      value: string;
      metadata: object;
    };
    capacity: {
      type: string;
      value: number;
      metadata: object;
    };
    currentType: {
      type: string;
      value: string;
      metadata: object;
    };
    description: {
      type: string;
      value: string;
      metadata: object;
    };
    imageURL: {
      type: string;
      value: string;
      metadata: object;
    };
    location: {
      type: string;
      value: {
        type: string;
        coordinates: number[];
      };
      metadata: object;
    };
    name: {
      type: string;
      value: string;
      metadata: object;
    };
    openingHours: {
      type: string;
      value: string;
      metadata: object;
    };
    socketType: {
      type: string;
      value: string;
      metadata: object;
    };
    status: {
      type: string;
      value: string;
      metadata: object;
    };
  };
}
