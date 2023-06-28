import mongoose from "mongoose";

const Parking = mongoose.model(
  "Parking",
  new mongoose.Schema(
    {
      features: [
        {
          type: { type: String },
          geometry: {
            type: { type: String },
            coordinates: [String],
          },
          properties: {
            NAME: String,
            STANDORT: String,
            ADRESSE: String,          //adresse
            HOEHE: String,            //zulaessigeEinfahrtshoeheInMeterDisplay
            ANZ_PARKPLAETZE: String,  //kapazitaet
            ANZ_FREI: String,         //kapazitaetFrei
            STATUS: String,           //statusDisplay
            TYPE: String,
          },
        },
      ],
    },
    {
      timestamps: true,
    }
  )
);

export { Parking };

// name: string,
// streetname: string,
// streetnumber: string,
// zipcode: number,
// city: string,
// maxHeight: number,
// capacity: ParkingCapacity[]
// location: MarkerPosition;
// currentlyUsed: number,
// maxValue: number