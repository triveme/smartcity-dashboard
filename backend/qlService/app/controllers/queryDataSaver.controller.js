import { response } from "express";
import moment from "moment";
import { updateQuerydata } from "./mongoDB.controller.js";

// converts utc to local time and returns date strings in a more
// human friendly way (depending on the chosen granularity)
function formattedDates(dateArray, granularity) {
  if (granularity === "day") {
    return dateArray.map((date) => {
      return moment.utc(date).local().format("DD.MM");
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

function processMultiCurrentData(queryItem, queriedData) {
  let currentValues = [];
  // up to 2 shown values possible -> attribute.keys = [] maxLength 2
  let queriedValues = [];
  if (queriedData && queriedData.length > 1) {
    queriedData.forEach((entity) => {
      if (
        queryItem.queryConfig.attribute.keys[0] in entity &&
        "value" in entity[queryItem.queryConfig.attribute.keys[0]]
      ) {
        queriedValues.push(
          entity[queryItem.queryConfig.attribute.keys[0]].value
        );
      } else {
        console.log("Multi Current Value: attribute name missing in reponse");
      }
    });
  } else {
    console.log("Multi Current Value: response-data empty");
  }

  if (queriedValues.length > 0) {
    currentValues.push(getAggregatedValue(queryItem, queriedValues));
    queryItem.data = currentValues;
    queryItem.updateMsg = "";
    updateQuerydata(queryItem);
  } else {
    console.log("");
  }
}

function processCurrentValueData(queryItem, queriedData) {
  let newData = [];
  let currentValues = [];

  // one Entity
  // up to two values -> & attribute.keys
  // necessary, as ql doesn't seem to retrieve the attributess in the order specified
  queryItem.queryConfig.attribute.keys.forEach((key) => {
    if (key in queriedData && "value" in queriedData[key]) {
      currentValues.push(queriedData[key].value);
    } else {
      console.log("Current Value: attribute name missing in response");
    }
  });

  newData = currentValues;
  queryItem.data = newData;
  queryItem.updateMsg = "";
  updateQuerydata(queryItem);
}

function processCurrentDonutData(queryItem, queriedData) {
  // context-Broker-response: different structure
  if (
    queryItem.queryConfig.attribute.keys[0] in queriedData &&
    "value" in queriedData[queryItem.queryConfig.attribute.keys[0]]
  ) {
    let newData = [];
    // Donut-Chart:
    if (
      queryItem.queryConfig.type === "chart" &&
      queryItem.queryConfig.apexType === "donut"
    ) {
      let newDataLabels = [];
      // if manual maxValue is set:
      // calculate difference to maxValue & add to data
      if (
        queryItem.queryConfig.apexMaxAlias &&
        queryItem.queryConfig.apexMaxAlias !== "" &&
        queryItem.queryConfig.apexMaxValue
      ) {
        let currentValues = [];
        let numToMax = queryItem.queryConfig.apexMaxValue;
        queryItem.queryConfig.attribute.keys.forEach((key) => {
          numToMax -= queriedData[key].value;
          currentValues.push(queriedData[key].value);
        });
        currentValues.splice(0, 0, numToMax);
        newData = currentValues;
        newDataLabels = [...queryItem.queryConfig.attribute.aliases];
        if (newData.length > newDataLabels.length) {
          newDataLabels.splice(0, 0, queryItem.queryConfig.apexMaxAlias);
        }
      } else {
        let currentValues = [];
        queryItem.queryConfig.attribute.keys.forEach((key) => {
          currentValues.push(queriedData[key].value);
        });
        newData = currentValues;
        newDataLabels = queryItem.queryConfig.attribute.aliases;
      }
      queryItem.dataLabels = newDataLabels;
      queryItem.data = newData;
      queryItem.updateMsg = "";
      updateQuerydata(queryItem);
    }
  }
}

// runs every 15 seconds
//queryItem = mongoDB
//queriedData = response from QL / ContextBroker
function processHistoricalData(queryItem, queriedData, dateGranularity) {
  if (
    queriedData &&
    //attributes bei /entities - attrs bei /attrs
    queriedData.attributes &&
    queriedData.attributes.length > 0
  ) {
    let newData = [];
    if (queryItem.queryConfig.type === "chart") {
      let newDataLabels = [];
      if (
        queryItem.queryConfig.apexType === "line" ||
        queryItem.queryConfig.apexType === "bar"
      ) {
        queriedData.attributes.forEach((attribute) => {
          queryItem.queryConfig.attribute.keys.forEach((key, index) => {
            if (attribute.attrName === key) {
              newData.push({
                // set the alias as label
                name: queryItem.queryConfig.attribute.aliases[index],
                data: attribute.values,
              });
            }
          });
        });
        // use the Date for the labeling of the axis grid
        // --> quantumLeap saves the dates in the 'index' array,
        // which corresponds to the attribute arrays
        newDataLabels = formattedDates(queriedData.index, dateGranularity);
      } else {
        console.log(
          "Unknown chart type encountered in queryDataSaver.controller.js"
        );
        return;
      }
      queryItem.dataLabels = newDataLabels;
    }
    queryItem.data = newData;
    queryItem.updateMsg = "";
    updateQuerydata(queryItem);
  }
}

function getAggregatedValue(queryItem, queriedValues) {
  let val = 0;
  switch (queryItem.queryConfig.aggrMode) {
    case "avg":
      queriedValues.forEach((value) => {
        val = val + value;
      });
      val = val / queriedValues.length;
      break;
    case "sum":
      queriedValues.forEach((value) => {
        val = val + value;
      });
      break;
    case "min":
      val = Math.min(...queriedValues);
      break;
    case "max":
      val = Math.max(...queriedValues);
      break;
    default:
      queriedValues.forEach((value) => {
        val = val + value;
      });
      val = val / queriedValues.length;
      break;
  }
  return val;
}

export {
  processHistoricalData,
  processCurrentDonutData,
  processCurrentValueData,
  processMultiCurrentData,
};
