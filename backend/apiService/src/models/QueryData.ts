import moment from "moment";
import { InferSchemaType, model, Query, Schema, Types } from "mongoose";

interface IQueryConfig {
  type: string;
  intervalInMinutes: number;
  aggrMode: string;
  apexType: string;
  apexMaxValue: string;
  apexMaxAlias: string;
  fiwareService: string;
  fromDate: Date;
  aggrMethod: string;
  toDate: Date;
  aggrPeriod: string;
  lastN: number;
  filterProperty: String;
  filterAttribute: String;
  filterValues: [String];
  entityId: [string];
  attribute: {
    keys: [string];
    aliases: [string];
  };
}

const queryData = new Schema({
  _id: {
    type: Types.ObjectId,
    required: true,
    auto: true,
  },
  queryConfig: {
    type: {
      type: String,
    },
    intervalInMinutes: Number,
    aggrMode: String,
    apexType: String,
    apexMaxValue: Number,
    apexMaxAlias: String,
    fiwareService: String,
    filterProperty: String,
    filterAttribute: String,
    filterValues: [String],
    entityId: [String],
    attribute: {
      keys: [String],
      aliases: [String],
    },
  },
  data: [],
  dataLabels: [],
  updateMsg: String,
  createdAt: Date,
  updatedAt: Date,
});

type QueryData = InferSchemaType<typeof queryData>;

const QueryDataModel = model<QueryData>("QueryData", queryData);

const isQueryConfigObject = (obj: unknown): obj is IQueryConfig => {
  // It can be assumed that the object is of the QueryConfig type if it has the property intervalInMinutes.
  return (
    (obj as IQueryConfig).intervalInMinutes !== undefined &&
    typeof (obj as IQueryConfig).intervalInMinutes === "number"
  );
};

export { QueryData, QueryDataModel, IQueryConfig, isQueryConfigObject };
