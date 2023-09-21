const mongoose = require("mongoose");

const Querydata = mongoose.model(
  "Querydata",
  new mongoose.Schema(
    {
      queryConfig: {
        intervalInMinutes: Number,
        fiwareService: String,
        fiwareType: String,
        entityId: [String],
        type: {
          type: String,
        },
        aggrMode: String,
        apexType: String,
        apexMaxValue: Number,
        apexMaxAlias: String,
        apexStepline: Boolean,
        componentType: String,
        componentDataType: String,
        componentName: String,
        componentDescription: String,
        componentIcon: String,
        componentMinimum: Number,
        componentMaximum: Number,
        componentUnit: String,
        filterProperty: String,
        filterAttribute: String,
        filterValues: [String],
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
