require("dotenv").config();
const axios = require("axios");

const client = axios.create({
  baseURL: `http://${process.env.QUANTUM_LEAP_URL}:8668`,
});

exports.getCurrentDataFromQuantumLeap = (
  queryConfig,
  callback,
  errCallback
) => {
  client
    .get(`v2/entities/${queryConfig.entityId}`, {
      params: {
        attrs: queryConfig.attrs,
        lastN: 1,
      },
      headers: {
        "Content-Type": "application/json",
        "Fiware-Service": queryConfig.fiwareService,
        "Fiware-ServicePath": "/",
      },
    })
    .then(function (response) {
      callback(response.data);
    })
    .catch(function (error) {
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
      },
    })
    .then(function (response) {
      // careful: With this req, the data is contained in an array called "attrs", not "attributes"
      callback(response.data);
    })
    .catch(function (error) {
      errCallback(error);
    });
};

exports.getHistoricalDataFromQuantumLeap = (
  queryConfig,
  callback,
  errCallback
) => {
  client
    .get(`v2/entities/${queryConfig.entityId}`, {
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
      callback(response.data);
    })
    .catch(function (error) {
      errCallback(error);
    });
};
