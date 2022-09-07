import mongoose from "mongoose";

const Querydata = mongoose.model(
  "Querydata",
  new mongoose.Schema(
    {
      queryConfig: {
        intervalInMinutes: Number,
        fiwareService: String,
        entityId: [String],
        type: {
          type: String,
        },
        aggrMode: String,
        apexType: String,
        apexMaxValue: Number,
        apexMaxAlias: String,
        attribute: {
          keys: [String],
          aliases: [String],
        },
      },
      data: [],
      dataLabels: [],
      updateMsg: String,
    },
    {
      timestamps: true,
    }
  )
);

export { Querydata };
