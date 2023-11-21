import mongoose from "mongoose";

const Poi = mongoose.model(
  "Poi",
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
            HAUPTNAME: String,
            NAMEN: String,
            STRASSE: String,
            STADT: String,
            PLZ: String,
            TELEFON: String,
            FAX: String,
            EMAIL: String,
            URL: String,
            ART_INFO: String,
            INFO: String,
            HAUPTTHEMA: String,
            THEMEN: String,
            URL_BILD: String,
            WEB_BILD: String,
            PREVIEW_BILD: String,
            URHEBER: String,
            KEYURL: String,
            WARTUNG: String,
            ZOOMPRIO: String,
          },
        },
      ],
    },
    {
      timestamps: true,
    }
  )
);

export { Poi };
