const mongoose = require("mongoose");

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

module.exports = Querydata;
