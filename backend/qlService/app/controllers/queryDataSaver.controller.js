import { query, response } from "express";
import moment from "moment";
import { updateQuerydata } from "./mongoDB.controller.js";
import { getCurrentDataFromContextBroker } from "./quantumLeap.controller.js";

// converts utc to local time and returns date strings in a more
// human friendly way (depending on the chosen granularity)
function formattedDates(dateArray, granularity) {
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

function processMultiCurrentData(queryItem, queriedData) {
  let currentValues = [];
  // up to 2 shown values possible -> attribute.keys = [] maxLength 2
  queryItem.queryConfig.attribute.keys.forEach((key) => {
    let queriedValues = [];
    if (queriedData && queriedData.length > 1) {
      queriedData.forEach((entity) => {
        if (key in entity && "value" in entity[key]) {
          queriedValues.push(entity[key].value);
        } else {
          console.log("Multi Current Value: attribute name missing in reponse");
        }
      });

      if (queriedValues.length > 0) {
        currentValues.push(getAggregatedValue(queryItem, queriedValues));
      }
    } else {
      console.log("Multi Current Value: response-data empty");
    }
  });

  if (currentValues.length > 0) {
    queryItem.data = currentValues;
    queryItem.updateMsg = "";
    updateQuerydata(queryItem);
  } else {
    console.log("Multi Current Values: no values found");
  }
}

function processCurrentValueData(queryItem, queriedData) {
  let newData = [];
  let currentValues = [];

  queryItem.queryConfig.attribute.keys.forEach((key) => {
    if (key in queriedData && "value" in queriedData[key]) {
      currentValues.push(queriedData[key].value);
    } else {
      console.log(
        "Current Value: attribute name missing in response for: " +
          queryItem.queryConfig.attribute.keys
      );
      console.log(queryItem.queryConfig.attribute);
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
        queryItem.queryConfig.apexType === "bar" ||
        queryItem.queryConfig.apexType === "measurement"
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

function processMapData(queryItem, queryData) {
  console.log(`processing map data for queryItem ${queryItem._id}`);
  // Liste Long/Lat
  /**
   * 
    {
        longitude: 7.1250042768,
        latitude: 51.2501771092
    }
   */
  var dataEntries = [];
  if (
    queryData !== undefined &&
    queryData !== null &&
    queryData !== undefined &&
    queryData !== null
  ) {
    queryData.forEach((dataItem) => {
      var dataEntry = {
        longitude: dataItem.geometry.coordinates[0],
        latitude: dataItem.geometry.coordinates[1],
      };

      dataEntries.push(dataEntry);
    });
  }

  queryItem.data = dataEntries;
  queryItem.updateMsg = "";
  updateQuerydata(queryItem);
}

function processListData(queryItem, queryData) {
  /**
   * {
        name: "Kaltenbachtal",
        types: ["Grünanlagen und Wälder"],
        adress: "Wuppertal",
        image: "none",
        location: {
            longitude: 7.120197671,
            latitude: 51.1951799443
        },
    }
   */
  var dataType = queryItem.queryConfig.componentDataType;
  var dataEntries = [];

  if (
    queryData !== undefined &&
    queryData !== null &&
    Object.keys(queryData).length > 0
  ) {
    queryData.forEach((dataItem, index) => {
      var dataEntry = {
        location: {
          type: "point",
          coordinates: [
            dataItem.geometry.coordinates[1],
            dataItem.geometry.coordinates[0],
          ],
        },
      };

      var properties = dataItem.properties;

      if (dataType === "pois") {
        dataEntry.name = properties.HAUPTNAME;
        dataEntry.types = [properties.HAUPTTHEMA];
        dataEntry.address = buildAddressForPoi(properties);
        dataEntry.image = properties.URL_BILD;
        dataEntry.imagePreview = properties.PREVIEW_BILD;
        dataEntry.creator = properties.URHEBER;
        dataEntry.info = properties.INFO;
        dataEntry.zoomprio = properties.ZOOMPRIO;
      } else if (dataType === "bikes" || dataType === "cars") {
        dataEntry.name = properties.STANDORT;
        dataEntry.address = properties.ADRESSE;
        dataEntry.image = properties.URL;
        dataEntry.status = properties.STATUS;
        dataEntry.operator = properties.BETREIBER;
        dataEntry.times = properties.BETREIBER;
        dataEntry.parkingFees = properties.PARKGEB;
        dataEntry.amountSpaces = properties.ANZ_LADEPL;
        dataEntry.notes = properties.BEMERKUNG;
        dataEntry.additionalInfo = properties.ZUSATZINFO;

        if (dataType === "cars") {
          dataEntry.electricity = properties.STROM;
        }
      }
      dataEntries.push(dataEntry);
    });
  }

  queryItem.data = dataEntries;
  queryItem.updateMsg = "";
  updateQuerydata(queryItem);
}

function processUtilizationData(queryItem, queryData1, queryData2) {
  var counterA = 0;
  var counterB = 0;

  if (
    queryData1.body != null &&
    queryData1.body != undefined &&
    queryData1.body.size != 0
  ) {
    counterA = queryData1.body[0].data.counterA;
  }

  if (
    queryData2.body != null &&
    queryData2.body != undefined &&
    queryData2.body.size != 0
  ) {
    counterB = queryData2.body[0].data.counterB;
  }

  queryItem.data[0] = generateHistoricData();
  queryItem.data[1] = { currentUtilization: counterA - counterB };
  queryItem.dataLabels = generateHistoricDataLabels();

  updateQuerydata(queryItem);
}

function processParkingData(queryItem, queryData) {
  /**
   * {
        
     }
   */
  var dataEntries = [];

  if (
    queryData !== undefined &&
    queryData !== null &&
    Object.keys(queryData).length > 0
  ) {
    queryData.forEach((dataItem) => {
      try {
        var dataEntry = {};
        dataEntry.name = dataItem.name.value;
        dataEntry.address = dataItem.adresse;
        dataEntry.maxHeight = dataItem.zulaessigeEinfahrtshoeheInMeterDisplay;
        dataEntry.maxValue = dataItem.totalSpotNumber.value;
        dataEntry.currentlyUsed =
          dataItem.totalSpotNumber.value - dataItem.availableSpotNumber.value;
        dataEntry.availableSpotNumber = dataItem.availableSpotNumber.value;
        dataEntry.location = {
          type: "point",
          coordinates: [dataItem.location.value.coordinates],
        };
        dataEntry.capacity = dataItem.totalSpotNumber.value;
        dataEntry.type = dataItem.category.value;
        dataEntry.openingHours = dataItem.openingHours.value;
        dataEntries.push(dataEntry);
      } catch (error) {
        console.error(`Error handling parking item ${dataItem}: ${error}`);
      }
    });
  }

  queryItem.data = dataEntries;
  queryItem.updateMsg = "";
  updateQuerydata(queryItem);
}

function processSwimmingData(refZonesData, queryItem) {
  const data = [];

  function fetchData(id) {
    const queryConfig = {
      entityId: [id],
      attrs: {
        keys: ["currentCapacity", "maxCapacity", "loadFactor", "name"],
        aliases: ["currentCapacity", "maxCapacity", "loadFactor", "name"],
      },
      fiwareType: "OpenAirPoolZone",
      fiwareService: "wuppertal",
    };

    return new Promise((resolve, reject) => {
      getCurrentDataFromContextBroker(
        queryConfig,
        (queriedData) => {
          const zoneData = {
            id: queriedData.id,
            name: queriedData.name.value,
            capacityCurrent: queriedData.currentCapacity.value,
            capacityMaximum: queriedData.maxCapacity.value,
            occupancyRate: queriedData.loadFactor.value,
          };

          resolve(zoneData);
        },
        (errString) => {
          handleError(queryItem._id, errString);
          reject(errString);
        }
      );
    });
  }

  refZonesData.forEach((zone) => {
    const swimmingUtilization = {
      id: zone.id,
      name: zone.name.value,
      zones: [],
    };

    const fetchPromises = zone.refZones.value.map((id) => fetchData(id));

    Promise.all(fetchPromises)
      .then((zoneDataArray) => {
        swimmingUtilization.zones = zoneDataArray;
        data.push(swimmingUtilization);

        queryItem.data = data
        queryItem.updateMsg = "swimming pool data updated successfully!";
        updateQuerydata(queryItem)
      })
      .catch((err) => {
        console.error(err);
      });
  });
}

function generateHistoricData() {
  var data = new Map();

  var today = [];
  for (let i = 0; i < 48; i++) {
    today.push(0);
  }

  var week = [];
  for (let i = 0; i < 7; i++) {
    week.push(0);
  }

  var month = [];
  for (let i = 0; i < 31; i++) {
    month.push(0);
  }
  data.set("today", today);
  data.set("week", week);
  data.set("month", month);

  return data;
}

function generateHistoricDataLabels() {
  var dataLabels = new Map();
  let currentTime = new Date().getTime();
  let twentyFourHoursInMilliseconds = 24 * 60 * 60 * 1000;

  var today = [];
  var yesterday = new Date(currentTime - twentyFourHoursInMilliseconds);
  yesterday.setMinutes(0);
  for (let i = 0; i < 48; i++) {
    today.push(moment(yesterday).format("HH:mm"));

    var time = yesterday.getTime();
    let thirtyMinutesInMilliseconds = 30 * 60 * 1000;
    yesterday.setTime(time + thirtyMinutesInMilliseconds);
  }

  var week = [];
  var lastWeek = new Date(currentTime - 7 * twentyFourHoursInMilliseconds);
  for (let i = 0; i < 7; i++) {
    week.push(moment(lastWeek).format("dddd"));

    var time = lastWeek.getTime();
    lastWeek.setTime(time + twentyFourHoursInMilliseconds);
  }

  var month = [];
  var lastMonth = new Date(currentTime - 31 * twentyFourHoursInMilliseconds);
  for (let i = 0; i < 31; i++) {
    month.push(moment(lastMonth).format("DD.MM.YYYY"));

    var time = lastMonth.getTime();
    lastMonth.setTime(time + twentyFourHoursInMilliseconds);
  }

  dataLabels.set("today", today);
  dataLabels.set("week", week);
  dataLabels.set("month", month);

  return dataLabels;
}

function buildAddressForPoi(properties) {
  var address = "";

  if (properties.STRASSE !== null && properties.STRASSE !== "") {
    address += properties.STRASSE;
  }
  if (properties.PLZ !== null && properties.PLZ !== "") {
    if (address.length !== 0) {
      address += ", ";
    }
    address += properties.PLZ;
  }
  if (properties.STADT !== null && properties.STADT !== "") {
    if (address.length !== 0) {
      address += ", ";
    }
    address += properties.STADT;
  }

  return address;
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
  processMapData,
  processListData,
  processUtilizationData,
  processParkingData,
  processSwimmingData
};
