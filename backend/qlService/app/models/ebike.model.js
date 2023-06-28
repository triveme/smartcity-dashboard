import mongoose from "mongoose";

const EBike = mongoose.model(
  "EBike",
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
            STANDORT: String,
            STATUS: String,
            ADRESSE: String,
            BETREIBER: String,
            ZEITEN: String,
            LADEKOSTEN: String,
            ANZ_LADEPL: String,
            BEMERKUNG: String,
            ZUSATZINFO: String,
            URL: String,
          },
        },
      ],
    },
    {
      timestamps: true,
    }
  )
);

export { EBike };
