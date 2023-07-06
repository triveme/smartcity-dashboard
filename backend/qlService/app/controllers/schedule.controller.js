import cron from "node-cron";
import moment from "moment";
import { getQuerydata } from "./mongoDB.controller.js";
import {
  getCurrentDataFromContextBroker,
  getMultiCurrentDataFromContextBroker,
  getHistoricalDataFromQuantumLeap,
  getCurrentMapDataFromContextBroker,
} from "./quantumLeap.controller.js";
import {
  processHistoricalData,
  processCurrentDonutData,
  processCurrentValueData,
  processMultiCurrentData,
  processMapData,
} from "./queryDataSaver.controller.js";
import { handleError } from "./errorHandling.js";
import {
  checkIfTokenNeedsToUpdate,
  updateToken,
} from "./authenticationController.js";

function updateTokenIfNecessary() {
  if (checkIfTokenNeedsToUpdate()) {
    updateToken();
  }
}

// runs every 15 seconds
function runSchedule() {
  cron.schedule("*/15 * * * * *", () => {
    updateTokenIfNecessary();

    getQuerydata((querydata) => {
      const now = new Date();
      querydata.map(async (queryItem) => {
        // current values, update them always
        // TO DO: get current values from context broker
        if (queryItem.queryConfig.type === "value") {
          queryItem.queryConfig.attrs =
            queryItem.queryConfig.attribute.keys.join(",");
          // value(s) of one entity
          if (queryItem.queryConfig.entityId.length < 2) {
            queryItem.queryConfig.entityId = queryItem.queryConfig.entityId[0];
            getCurrentDataFromContextBroker(
              queryItem.queryConfig,
              (queriedData) => {
                processCurrentValueData(queryItem, queriedData);
              },
              (errString) => {
                handleError(queryItem._id, errString);
              }
            );
          }
          // value(s) of multiple entities
          else {
            queryItem.queryConfig.lastN = 100;
            queryItem.queryConfig.id = queryItem.queryConfig.entityId.join(",");
            getMultiCurrentDataFromContextBroker(
              queryItem.queryConfig,
              (queriedData) => {
                processMultiCurrentData(queryItem, queriedData);
              },
              (errString) => {
                handleError(queryItem._id, errString);
              }
            );
          }
        } else if (queryItem.queryConfig.type === "chart") {
          queryItem.queryConfig.entityId = queryItem.queryConfig.entityId[0];
          queryItem.queryConfig.attrs =
            queryItem.queryConfig.attribute.keys.join(",");
          // donut charts display the current values, update them always
          // TO DO: get current values from context broker
          if (queryItem.queryConfig.apexType === "donut") {
            getCurrentDataFromContextBroker(
              queryItem.queryConfig,
              (queriedData) => {
                processCurrentDonutData(queryItem, queriedData, null);
              },
              (errString) => {
                handleError(queryItem._id, errString);
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
            getHistoricalDataFromQuantumLeap(
              queryItem.queryConfig,
              (queriedData) => {
                processHistoricalData(
                  queryItem,
                  queriedData,
                  queryItem.queryConfig.aggrPeriod
                );
              },
              (errString) => {
                handleError(queryItem._id, errString);
              }
            );
          }
        } else if (queryItem.queryConfig.type == "component") {
          getCurrentMapDataFromContextBroker(
            queryItem.queryConfig,
            (queriedData) => {
              processMapData(queryItem, queriedData);
            },
            (errString) => {
              handleError(queryItem._id, errString);
            }
          );
        } else {
          console.log(
            "Unknown tab type encountered in schedule.controller.js: "
          );
          console.log(queryItem);
        }
      });
    });
  });
}

export { runSchedule };
