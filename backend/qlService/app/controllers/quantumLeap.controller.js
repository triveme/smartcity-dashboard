require("dotenv").config();
const axios = require("axios");

const client = axios.create({
  baseURL: `https://${process.env.QUANTUM_LEAP_URL}`,
});


exports.getTypes = (callback, errCallback) => {
  client
    .get(`v2/types`, {
      timeout:70000,
      headers: {
        // "Content-Type": "application/json",
        "Fiware-Service": "testfrank001",
        "Fiware-ServicePath": "/",
        "Authorization": "Bearer 486e0fa94ae938ab03a249362db5e6d4affd2b57",
        // "Accept":"*/*",
        // "Accept-Encoding":"gzip, deflate, br",
        // "Connection": "keep-alive",
        // "Host":`quantumleap.fiware-staging.kielregion.addix.io`
      },
    })
    .then(function (response) {
      callback(response.data);
    })
    .catch(function (error) {
      errCallback(error);
    });
};

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
        "Authorization": "Bearer 486e0fa94ae938ab03a249362db5e6d4affd2b57",
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
        "Authorization": "Bearer 486e0fa94ae938ab03a249362db5e6d4affd2b57",
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
        "Authorization": "Bearer 486e0fa94ae938ab03a249362db5e6d4affd2b57",
      },
    })
    .then(function (response) {
      callback(response.data);
    })
    .catch(function (error) {
      errCallback(error);
    });
};
