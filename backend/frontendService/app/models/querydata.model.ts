import { InferSchemaType, Schema, model, Types } from "mongoose";

interface IQueryConfig {
  intervalInMinutes?: number;
  fiwareService?: string;
  fiwareType?: string;
  entityId?: string[];
  type?: string;
  aggrMode?: string;
  apexType?: string;
  apexMaxValue?: number;
  apexMaxAlias?: string;
  componentType?: string;
  componentDataType?: string;
  componentName?: string;
  componentDescription?: string;
  componentIcon?: string;
  componentMinimum?: number;
  componentMaximum?: number;
  componentUnit?: string;
  filterProperty?: string;
  filterAttribute?: string;
  filterValues?: string[];
  attribute?: {
    keys: string[];
    aliases: string[];
  };
  [key: string]: any;
}

interface IQueryData {
  _id?: string;
  parents?: any[];
  queryConfig?: IQueryConfig;
  data?: any[];
  dataLabels?: string[];
  updateMsg?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const queryConfigSchema: Schema<IQueryConfig> = new Schema({
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
});

const queryDataSchema: Schema<IQueryData> = new Schema(
  {
    _id: {
      type: Types.ObjectId,
      required: true,
      auto: true,
    },
    parents: [],
    queryConfig: queryConfigSchema,
    data: [],
    dataLabels: [],
    updateMsg: String,
  },
  {
    timestamps: true,
  }
);

type QueryData = InferSchemaType<typeof queryDataSchema>;
type QueryConfig = InferSchemaType<typeof queryConfigSchema>;

const QueryDataModel = model<QueryData>("QueryData", queryDataSchema);

export { IQueryData, IQueryConfig, QueryData, QueryDataModel, QueryConfig };
