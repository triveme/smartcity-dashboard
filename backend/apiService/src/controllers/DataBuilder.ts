import moment from "moment";
import {
  IQueryConfig,
  isQueryConfigObject,
  QueryData,
} from "../models/QueryData";

class DataBuilder {
  public buildMulti(queryData: QueryData, response: any[]): any[] {
    let currentValues: any[] = [];
    // Block execution if broken datastructure
    if (
      response.length > 0 &&
      response[0].length > 0 &&
      "measurements" in response[0][0]
    )
      return currentValues;

    if (isQueryConfigObject(queryData.queryConfig)) {
      queryData.queryConfig.attribute.keys.forEach((key) => {
        let queriedValues: any[] = [];
        if (response && response.length > 0) {
          response.forEach((entityDataSet: any) => {
            entityDataSet.forEach((measurement: any) => {
              if (
                isQueryConfigObject(queryData.queryConfig) &&
                queryData.queryConfig.filterValues.length > 0
              ) {
                queriedValues.push(this.getData(measurement, queryData.queryConfig.filterAttribute.toString()));
              } else {
                queriedValues.push(this.getData(measurement, key));
              }
            });
          });

          if (queriedValues.length > 0) {
            if (isQueryConfigObject(queryData.queryConfig)) {
              currentValues.push(
                this.getAggregatedValue(queryData.queryConfig, queriedValues)
              );
            }
          }
        } else {
          console.log("Multi Current Value: response-data empty");
        }
      });
    }
    return currentValues;
  }

  public build(queryData: QueryData, response: any): any[] {
    let newData: any[] = [];

    // Block execution if broken datastructure
    if (response.length > 0 && "measurements" in response[0]) {
      console.log(`Broken response for query: ${queryData._id}`);
      console.log(response);
      return newData;
    }

    if (isQueryConfigObject(queryData.queryConfig)) {
      if (queryData.queryConfig.type == "value") {
        newData = this.buildValueData(queryData, response);
      } else if (queryData.queryConfig.type == "chart") {
        let newDataLabels: any[] = [];

        if (
          queryData.queryConfig.apexType === "line" ||
          queryData.queryConfig.apexType === "bar"
        ) {
          newData = this.buildLineAndBarData(queryData, response);
        } else if (queryData.queryConfig.apexType === "donut") {
          if (response.length > 1) {
            response.length = 1;
          }

          if (
            queryData.queryConfig.apexMaxAlias &&
            queryData.queryConfig.apexMaxAlias !== "" &&
            queryData.queryConfig.apexMaxValue
          ) {
            newData = this.buildDonutDataWithApexMax(queryData, response);

            newDataLabels = [...queryData.queryConfig.attribute.aliases];
            if (newData.length > newDataLabels.length) {
              newDataLabels.splice(0, 0, queryData.queryConfig.apexMaxAlias);
            }
          } else {
            newData = this.buildDonutData(queryData, response);
            newDataLabels = queryData.queryConfig.attribute.aliases;
          }
        } else {
          console.log(
            "Unknown chart type encountered in queryDataSaver.controller.js"
          );
          return newData;
        }
        queryData.dataLabels = newDataLabels;
      }
    }
    return newData;
  }

  public buildValueData(queryData: QueryData, response: any): any[] {
    let currentValues: any[] = [];
    if (isQueryConfigObject(queryData.queryConfig)) {
      queryData.queryConfig.attribute.keys.forEach((key) => {
        if (response.length > 0) {
          currentValues.push(this.getData(response[0], key));
        }
      });
    }
    return currentValues;
  }

  public buildLineAndBarData(queryData: QueryData, response: any): any[] {
    let newData: any[] = [];

    if (isQueryConfigObject(queryData.queryConfig)) {
      queryData.queryConfig.attribute.keys.forEach((key, index) => {
        let barData: any[] = [];
        response.forEach((data: any) => {
          if (
            isQueryConfigObject(queryData.queryConfig) &&
            queryData.queryConfig.filterValues.length > 0
          ) {
            if (data.id === queryData.queryConfig.filterValues[index]) {
              barData.push(this.getData(data, queryData.queryConfig.filterAttribute.toString()));
            }
          } else {
            barData.push(this.getData(data, key));
          }
        });
        if (isQueryConfigObject(queryData.queryConfig)) {
          newData.push({
            name: queryData.queryConfig.attribute.aliases[index],
            data: barData,
          });
        }
      });
    }

    return newData;
  }

  public buildDonutDataWithApexMax(queryData: QueryData, response: any): any[] {
    let currentValues: any[] = [];

    if (isQueryConfigObject(queryData.queryConfig)) {
      let numToMax = parseFloat(queryData.queryConfig.apexMaxValue);

      queryData.queryConfig.attribute.keys.forEach((key) => {
        response.forEach((dataSet: any) => {
          let data = this.getData(dataSet, key);
          numToMax -= data;

          currentValues.push(data);
        });
      });

      currentValues.splice(0, 0, numToMax);
    }

    return currentValues;
  }

  public buildDonutData(queryData: QueryData, response: any): any[] {
    let currentValues: any[] = [];

    if (isQueryConfigObject(queryData.queryConfig)) {
      queryData.queryConfig.attribute.keys.forEach((key) => {
        response.forEach((dataSet: any) => {
          currentValues.push(this.getData(dataSet, key));
        });
      });
    }
    return currentValues;
  }

  private getData(dataSet: any, key: string): number {
    let dataMap = new Map<string, string | number>(Object.entries(dataSet));
    let data = 0;

    if (dataMap.has(key)) {
      let value = dataMap.get(key);

      if (typeof value === "string") {
        data = parseFloat(value);
      } else if (typeof value === "number") {
        data = value;
      }
    } else {
      console.log("key not in dataMap: " + key);
      console.log(dataMap);
    }

    return data;
  }

  public getAggregatedValue(
    queryConfig: IQueryConfig,
    values: number[]
  ): number {
    var val = 0;
    switch (queryConfig.aggrMode) {
      case "avg":
        values.forEach((value) => {
          val += value;
        });

        val = val / values.length;
        break;
      case "sum":
        values.forEach((value) => {
          val += value;
        });
        break;
      case "min":
        val = Number.MAX_VALUE;

        values.forEach((value) => {
          let data = value;

          if (data < val) {
            val = data;
          }
        });
        break;
      case "max":
        val = Number.MIN_VALUE;

        values.forEach((value) => {
          let data = value;

          if (data > val) {
            val = data;
          }
        });
        break;
      default:
        values.forEach((value) => {
          val += value;
        });

        val = val / values.length;
        break;
    }

    return val;
  }

  public buildNewDateLabels(queryData: QueryData, response: any): string[] {
    let newDataLabels: string[] = [];

    if (isQueryConfigObject(queryData.queryConfig)) {
      let now = new Date();
      let dates: string[] = [];

      if (queryData.queryConfig.intervalInMinutes === 5) {
        queryData.queryConfig.fromDate = moment(now)
          .subtract(1, "days")
          .toDate();
        queryData.queryConfig.aggrPeriod = "hour";
      } else if (queryData.queryConfig.intervalInMinutes === 30) {
        queryData.queryConfig.fromDate = moment(now)
          .subtract(7, "days")
          .toDate();
        queryData.queryConfig.aggrPeriod = "day";
      } else {
        queryData.queryConfig.fromDate = moment(now)
          .subtract(30, "days")
          .toDate();
        queryData.queryConfig.aggrPeriod = "day";
      }
      queryData.queryConfig.aggrMethod = "avg";
      queryData.queryConfig.toDate = now;

      response.forEach((data: any) => {
        dates.push(data.timestamp);
      });

      newDataLabels = this.formattedDates(
        dates,
        queryData.queryConfig.aggrPeriod
      );
    }

    return newDataLabels;
  }

  // Need to check the best way to call this function
  // converts utc to local time and returns date strings in a more
  // human friendly way (depending on the chosen granularity)
  private formattedDates(dateArray: any[], granularity: string) {
    if (granularity === "day") {
      return dateArray.map((date) => {
        return moment.utc(date).local().format("DD.MM.");
      });
    } else if (granularity === "hour") {
      return dateArray.map((date) => {
        return moment.utc(date).local().format("HH:mm");
      });
    } else {
      return dateArray.map((date) => {
        return moment.utc(date).local().format("YYYY-MM-DDTHH:mm");
      });
    }
  }
}

export default new DataBuilder();
