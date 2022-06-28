require("dotenv").config();
const axios = require("axios");
const util = require("util");

const qlClient = axios.create({
  baseURL: `https://${process.env.QUANTUM_LEAP_URL}`,
});

const cbClient = axios.create({
  baseURL: `https://${process.env.CONTEXT_BROKER_URL}`,
});

exports.getCurrentDataFromContextBroker = (
  queryConfig,
  callback,
  errCallback
) => {
  qlClient
    .get(`v2/entities/${queryConfig.entityId}`, {
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
      callback(response.data);
    })
    .catch(function (error) {
      console.log("err");
      console.log(error);
      errCallback(error);
    });
};

exports.getMultiCurrentDataFromContextBroker = (
  queryConfig,
  callback,
  errCallback
) => {
  qlClient
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
  qlClient
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
        Authorization: "Bearer 4ec3963d763ff17b63370eceea8996e3c03334ff",
      },
    })
    .then(function (response) {
      callback(response.data);
    })
    .catch(function (error) {
      console.log("err");
      console.log(error);
      errCallback(error);
    });
};
