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
        apexStepline: Boolean,
        componentType: String,
        componentDataType: String,
        componentName: String,
        componentDescription: String,
        componentIcon: String,
        componentMinimum: Number,
        componentMaximum: Number,
        componentUnit: String,
        aggrMethod: String,
        aggrPeriod: String,
        attrs: String,
        toDate: Date,
        fromDate: Date,
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
