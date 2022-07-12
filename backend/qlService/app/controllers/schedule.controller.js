const cron = require("node-cron");
const moment = require("moment");
const mongoDbController = require("./mongoDB.controller");
const quantumLeapController = require("./quantumLeap.controller");
const queryDataSaverController = require("./queryDataSaver.controller");
const errorHandling = require("./errorHandling");

// runs every 15 seconds
exports.runSchedule = cron.schedule("*/15 * * * * *", () => {
  mongoDbController.getQuerydata((querydata) => {
    const now = new Date();
    querydata.map((queryItem) => {
      // current values, update them always
      if (queryItem.queryConfig.type === "value") {
        queryItem.queryConfig.attrs =
          queryItem.queryConfig.attribute.keys.join(",");
        // value(s) of one entity
        if (queryItem.queryConfig.entityId.length < 2) {
          queryItem.queryConfig.entityId = queryItem.queryConfig.entityId[0];
          quantumLeapController.getCurrentDataFromQuantumLeap(
            queryItem.queryConfig,
            (queriedData) => {
              queryDataSaverController.processQueriedData(
                queryItem,
                queriedData,
                null
              );
            },
            (err) => {
              errorHandling.handleError(queryItem._id);
            }
          );
        }
        // value(s) of multiple entities
        else {
          queryItem.queryConfig.lastN = 100;
          queryItem.queryConfig.id = queryItem.queryConfig.entityId.join(",");
          quantumLeapController.getMultiCurrentDataFromQuantumLeap(
            queryItem.queryConfig,
            (queriedData) => {
              queryDataSaverController.processQueriedData(
                queryItem,
                queriedData,
                null
              );
            },
            (err) => {
              errorHandling.handleError(queryItem._id);
            }
          );
        }
      } else if (queryItem.queryConfig.type === "chart") {
        queryItem.queryConfig.entityId = queryItem.queryConfig.entityId[0];
        queryItem.queryConfig.attrs =
          queryItem.queryConfig.attribute.keys.join(",");
        // donut charts display the current values, update them always
        if (queryItem.queryConfig.apexType === "donut") {
          quantumLeapController.getCurrentDataFromQuantumLeap(
            queryItem.queryConfig,
            (queriedData) => {
              queryDataSaverController.processQueriedData(
                queryItem,
                queriedData,
                null
              );
            },
            (err) => {
              errorHandling.handleError(queryItem._id);
            }
          );
        }
        // other chart types display historical data and don't need to
        // be updated every cycle
        else if (
          queryItem.data.length < 1 ||
          moment(new Date(queryItem.updatedAt))
            .add(queryItem.queryConfig.intervalInMinutes, "m")
            .toDate() < now
        ) {
          // data is outdated, get updated data from quantumLeap
          if (queryItem.queryConfig.intervalInMinutes === 5) {
            queryItem.queryConfig.fromDate = moment(now)
              .subtract(1, "days")
              .toDate();
            queryItem.queryConfig.aggrPeriod = "hour";
          } else if (queryItem.queryConfig.intervalInMinutes === 30) {
            queryItem.queryConfig.fromDate = moment(now)
              .subtract(7, "days")
              .toDate();
            queryItem.queryConfig.aggrPeriod = "day";
          } else {
            queryItem.queryConfig.fromDate = moment(now)
              .subtract(30, "days")
              .toDate();
            queryItem.queryConfig.aggrPeriod = "day";
          }
          queryItem.queryConfig.aggrMethod = "avg";
          queryItem.queryConfig.toDate = now;
          quantumLeapController.getHistoricalDataFromQuantumLeap(
            queryItem.queryConfig,
            (queriedData) => {
              queryDataSaverController.processQueriedData(
                queryItem,
                queriedData,
                queryItem.queryConfig.aggrPeriod
              );
            },
            (err) => {
              errorHandling.handleError(queryItem._id);
            }
          );
        }
      } else {
        console.log("Unknown tab type encountered in schedule.controller.js");
      }
    });
  });
});
