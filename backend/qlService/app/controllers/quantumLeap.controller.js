require("dotenv").config();
const axios = require("axios");
const util = require("util");

const client = axios.create({
  baseURL: `https://${process.env.QUANTUM_LEAP_URL}`,
});

exports.getCurrentDataFromQuantumLeap = (
  queryConfig,
  callback,
  errCallback
) => {
  client
    .get(`v2/types/${queryConfig.entityId}`, {
      params: {
        attrs: queryConfig.attrs,
        lastN: 1,
      },
      headers: {
        "Content-Type": "application/json",
        "Fiware-Service": queryConfig.fiwareService,
        "Fiware-ServicePath": "/",
        Authorization: "Bearer 4ec3963d763ff17b63370eceea8996e3c03334ff",
      },
    })
    .then(function (response) {
      console.log("Current");
      console.log(
        util.inspect(response.data, false, null, true /* enable colors */)
      );
      if (
        response.data &&
        response.data.entities &&
        response.data.entities.length > 0
      ) {
        callback(response.data.entities[0]);
      } else {
        callback(response.data);
      }
    })
    .catch(function (error) {
      console.log("err");
      console.log(error);
      errCallback(error);
    });
};

exports.getMultiCurrentDataFromQuantumLeap = (
  queryConfig,
  callback,
  errCallback
) => {
  client
    .get(`v2/attrs`, {
      params: {
        id: queryConfig.id,
        attrs: queryConfig.attrs,
        lastN: queryConfig.lastN,
      },
      headers: {
        "Content-Type": "application/json",
        "Fiware-Service": queryConfig.fiwareService,
        "Fiware-ServicePath": "/",
        Authorization: "Bearer 4ec3963d763ff17b63370eceea8996e3c03334ff",
      },
    })
    .then(function (response) {
      // careful: With this req, the data is contained in an array called "attrs", not "attributes"
      console.log("multi");
      console.log(response);
      callback(response.data);
    })
    .catch(function (error) {
      console.log("err");
      console.log(error);
      errCallback(error);
    });
};

exports.getHistoricalDataFromQuantumLeap = (
  queryConfig,
  callback,
  errCallback
) => {
  client
    .get(`v2/types/${queryConfig.entityId}`, {
      params: {
        fromDate: queryConfig.fromDate,
        toDate: queryConfig.toDate,
        attrs: queryConfig.attrs,
        aggrMethod: queryConfig.aggrMethod,
        aggrPeriod: queryConfig.aggrPeriod,
      },
      headers: {
        "Content-Type": "application/json",
        "Fiware-Service": queryConfig.fiwareService,
        "Fiware-ServicePath": "/",
      },
    })
    .then(function (response) {
      if (
        response.data &&
        response.data.entities &&
        response.data.entities.length > 0
      ) {
        callback(response.data.entities[0]);
      } else {
        callback(response.data);
      }
    })
    .catch(function (error) {
      console.log("err");
      console.log(error);
      errCallback(error);
    });
};
