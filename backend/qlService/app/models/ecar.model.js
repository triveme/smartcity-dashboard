import mongoose from "mongoose";

const ECar = mongoose.model(
  "ECar",
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
            PARKGEB: String,
            ANZ_LADEPL: String,
            STROM: String,
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

export { ECar };
