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

function processCurrentData(queryItem, queriedData) {
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
        queryItem.queryConfig.attribute.keys.forEach((key, index) => {
          numToMax -=
            queriedData[queryItem.queryConfig.attribute.keys[index]].value;
          currentValues.push(
            queriedData[queryItem.queryConfig.attribute.keys[index]].value
          );
        });
        currentValues.splice(0, 0, numToMax);
        newData = currentValues;
        newDataLabels = [...queryItem.queryConfig.attribute.aliases];
        if (newData.length > newDataLabels.length) {
          newDataLabels.splice(0, 0, queryItem.queryConfig.apexMaxAlias);
        }
      } else {
        let currentValues = [];
        queryItem.queryConfig.attribute.keys.forEach((key, index) => {
          currentValues.push(
            queriedData[queryItem.queryConfig.attribute.keys[index]].value
          );
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
    ((queriedData.attributes && queriedData.attributes.length > 0) ||
      (queriedData.attrs && queriedData.attrs.length > 0))
  ) {
    let newData = [];
    if (queryItem.queryConfig.type === "value") {
      let currentValues = [];
      if (queryItem.queryConfig.lastN && queryItem.queryConfig.lastN > 1) {
        // up to 2 shown values possible -> attribute.keys = [] maxLength 2
        queryItem.queryConfig.attribute.keys.forEach((key) => {
          queriedData.attrs.forEach((attribute) => {
            if (key === attribute.attrName) {
              currentValues.push(getAggregatedValue(queryItem, attribute));
            }
          });
        });
      } else {
        // necessary, as ql doesn't seem to retrieve the attrs in the order specified
        queryItem.queryConfig.attribute.keys.forEach((key) => {
          queriedData.attributes.forEach((attribute) => {
            if (key === attribute.attrName) {
              currentValues.push(attribute.values[0]);
            }
          });
        });
      }
      newData = currentValues;
    } else if (queryItem.queryConfig.type === "chart") {
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

function getAggregatedValue(queryItem, attribute) {
  let val = 0;
  switch (queryItem.queryConfig.aggrMode) {
    case "avg":
      attribute.types[0].entities.forEach((entity) => {
        val = val + parseFloat(entity.values[entity.values.length - 1]);
      });
      val = val / queryItem.queryConfig.entityId.length;
      break;
    case "sum":
      attribute.types[0].entities.forEach((entity) => {
        val = val + parseFloat(entity.values[entity.values.length - 1]);
      });
      break;
    case "min":
      val = Number.MAX_VALUE;
      attribute.types[0].entities.forEach((entity) => {
        if (parseFloat(entity.values[0]) < val) {
          val = parseFloat(entity.values[entity.values.length - 1]);
        }
      });
      break;
    case "max":
      val = Number.MIN_VALUE;
      attribute.types[0].entities.forEach((entity) => {
        if (parseFloat(entity.values[0]) > val) {
          val = parseFloat(entity.values[entity.values.length - 1]);
        }
      });
      break;
    default:
      attribute.types[0].entities.forEach((entity) => {
        val = val + parseFloat(entity.values[entity.values.length - 1]);
      });
      val = val / queryItem.queryConfig.entityId.length;
      break;
  }
  return val;
}

export { processHistoricalData as processQueriedData, processCurrentData };
