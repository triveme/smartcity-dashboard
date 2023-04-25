import {
  isQueryConfigObject,
  QueryData,
  QueryDataModel,
} from "../models/QueryData";
import dataBuilder from "./DataBuilder";

class SaveController {
  public processRestResponse(queryData: QueryData, response: any): void {
    if (isQueryConfigObject(queryData.queryConfig)) {
      if (response) {
        let data = dataBuilder.build(queryData, response);
        let updateMsg = "";
        let newDataLabels: string[] = [];

        if (
          isQueryConfigObject(queryData.queryConfig) &&
          (queryData.queryConfig.apexType === "line" ||
            queryData.queryConfig.apexType === "bar")
        ) {
          newDataLabels = dataBuilder.buildNewDateLabels(queryData, response);
        }

        this.updateQueryData(queryData, data, updateMsg, newDataLabels);
      }
    }
  }

  public processMultiRestResponse(queryData: QueryData, response: any[]) {
    if (response && response.length > 0) {
      let data = dataBuilder.buildMulti(queryData, response);
      let updateMsg = "";
      this.updateQueryData(queryData, data, updateMsg);
    }
  }

  public updateQueryData(
    queryData: QueryData,
    data: any[],
    updateMsg: string,
    newDataLabels: string[] = []
  ): void {
    QueryDataModel.findOne({ _id: queryData._id }).then((databaseObject) => {
      if (databaseObject) {
        databaseObject.data = data;
        databaseObject.updateMsg = updateMsg;

        if (newDataLabels.length > 0) {
          databaseObject.dataLabels = newDataLabels;
        }

        databaseObject.save();
      }
    });
  }
}

export default new SaveController();
