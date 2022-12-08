import { CronJob } from "cron";
import "dotenv/config";
import env from "env-var";
import {
  QueryData,
  QueryDataModel,
  IQueryConfig,
  isQueryConfigObject,
} from "../models/QueryData";
import moment from "moment";
import RestController from "./RestController";
import SaveController from "./SaveController";
import ErrorController from "./ErrorController";
import { AxiosResponse } from "axios";
import DataBuilder from "./DataBuilder";
class ScheduleController {
  private now: Date = new Date();

  public runSchedule(): void {
    this.checkIfMandatoryEnvVarsAreSet();
    const cronSchedule = env.get("SCHEDULE").required().asString();

    // Default is 15 seconds
    new CronJob(`${cronSchedule}`, async () => {
      console.log("Starting update for querydatas");
      QueryDataModel.find({}).then((queryDatas) => {
        this.now = new Date();
        queryDatas.forEach((queryData) => {
          console.log(`Updating querydata ${queryData._id}`);
          if (isQueryConfigObject(queryData.queryConfig)) {
            this.updateQueryDataObject(queryData, queryData.queryConfig);
          } else {
            ErrorController.handleError(
              new Error("No query config object found"),
              queryData._id
            );
            return;
          }
        });
      });
    }).start();
  }

  private updateQueryDataObject(
    queryData: QueryData,
    queryConfig: IQueryConfig
  ): void {
    // current values need to be updated always

    if (queryConfig.type == "value") {
      this.handleValues(queryData, queryConfig);
    } else if (queryConfig.type == "chart") {
      this.handleCharts(queryData, queryConfig);
    } else {
      ErrorController.handleWarning(
        `Unknown or empty data type: ${queryConfig.type}`,
        queryData._id
      );
    }
  }

  private handleValues(queryData: QueryData, queryConfig: IQueryConfig) {
    if (
      queryConfig.fiwareService &&
      queryConfig.entityId.length < 2 &&
      queryConfig.attribute
    ) {
      if (queryConfig.filterValues.length > 0) {
        var data: any[] = [];
        queryConfig.filterValues.forEach((filterValue) => {
          RestController.getCurrentData(queryConfig, filterValue.toString())
            .then(function (response) {
              data.push(response.data);
              SaveController.processMultiRestResponse(queryData, data);
            })
            .catch((err) => ErrorController.handleError(err, queryData._id));
        });
      } else {
        RestController.getCurrentData(queryConfig)
          .then((response) =>
            SaveController.processRestResponse(queryData, response.data)
          )
          .catch((err) => ErrorController.handleError(err, queryData._id));
      }
    } else {
      RestController.getMultiCurrentData(queryConfig)
        .then((data) =>
          SaveController.processMultiRestResponse(queryData, data)
        )
        .catch((err) => ErrorController.handleError(err, queryData._id));
    }
  }

  private handleCharts(queryData: QueryData, queryConfig: IQueryConfig): void {
    // donut charts display current values, update always
    if (queryConfig.apexType == "donut") {
      RestController.getCurrentData(queryConfig)
        .then((response) => {
          SaveController.processRestResponse(
            queryData,
            response.data.reverse()
          );
        })
        .catch((err) => ErrorController.handleError(err, queryData._id));
    }
    // line charts display historical values, update only if the data is empty or the interval has passed
    else if (
      (queryData.data != undefined && queryData.data.length < 1) ||
      (queryData.updatedAt != undefined &&
        moment(new Date(queryData.updatedAt))
          .add(queryConfig.intervalInMinutes, "m")
          .toDate() < this.now)
    ) {
      queryConfig = this.populateQueryConfigForHistoricalData(queryConfig);
      if (queryConfig.filterValues.length > 0) {
        let data: any[] = [];
        let promises = [];
        for (let i = 0; i < queryConfig.filterValues.length; i++) {
          let filterValue = queryConfig.filterValues[i];
          promises.push(
            RestController.getHistoricalData(
              queryConfig,
              filterValue.toString()
            ).then(response => {
              data = data.concat(response.data.reverse())
            })
            .catch((err) => {
              ErrorController.handleError(err, queryData._id);
              return err;
            })
          );          
        }

        Promise.all(promises).then(() => {
          SaveController.processRestResponse(queryData, data);
        });
      } else {
        RestController.getHistoricalData(queryConfig)
          .then((response) => {
            var responseReverse = response.data.reverse();
            SaveController.processRestResponse(queryData, responseReverse);
          })
          .catch((err) => ErrorController.handleError(err, queryData._id));
      }
    }
  }

  private populateQueryConfigForHistoricalData(
    queryConfig: IQueryConfig
  ): IQueryConfig {
    // data is outdated, get updated data from quantumLeap
    if (queryConfig.intervalInMinutes === 5) {
      queryConfig.fromDate = moment(this.now).subtract(1, "days").toDate();
      queryConfig.aggrPeriod = "hour";
    } else if (queryConfig.intervalInMinutes === 30) {
      queryConfig.fromDate = moment(this.now).subtract(7, "days").toDate();
      queryConfig.aggrPeriod = "day";
    } else {
      queryConfig.fromDate = moment(this.now).subtract(30, "days").toDate();
      queryConfig.aggrPeriod = "day";
    }
    queryConfig.aggrMethod = "avg";
    queryConfig.toDate = this.now;

    return queryConfig;
  }

  private checkIfMandatoryEnvVarsAreSet() {
    if (
      env.get("PORT").asString() == undefined ||
      env.get("PORT").asString() == ""
    ) {
      console.log("PORT is not set");
    }
    if (
      env.get("API_URL").asString() == undefined ||
      env.get("API_URL").asString() == ""
    ) {
      console.log("API_URL is not set");
    }
    if (
      env.get("SCHEDULE").asString() == undefined ||
      env.get("SCHEDULE").asString() == ""
    ) {
      console.log("SCHEDULE is not set");
    }
  }
}

export default new ScheduleController();
