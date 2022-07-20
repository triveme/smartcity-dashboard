import "dotenv/config";
import axios from "axios";
import util from "util";

const qlClient = axios.create({
  baseURL: `${process.env.QUANTUM_LEAP_URL}`,
});

const cbClient = axios.create({
  baseURL: `${process.env.CONTEXT_BROKER_URL}`,
});

function getCurrentDataFromContextBroker(queryConfig, callback, errCallback) {
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
        Authorization: `Bearer ${process.env.TOKEN}`,
      },
    })
    .then(function (response) {
      // console.log("Current");
      // console.log(
      //   util.inspect(response.data, false, null, true /* enable colors */)
      // );
      callback(response.data);
    })
    .catch(function (error) {
      console.log("err");
      console.log(error);
      errCallback(error);
    });
}

function getMultiCurrentDataFromContextBroker(
  queryConfig,
  callback,
  errCallback
) {
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
        Authorization: `Bearer ${process.env.TOKEN}`,
      },
    })
    .then(function (response) {
      // careful: With this req, the data is contained in an array called "attrs", not "attributes"
      // console.log("multi");
      // console.log(response);
      callback(response.data);
    })
    .catch(function (error) {
      console.log("err");
      console.log(error);
      errCallback(error);
    });
}

function getHistoricalDataFromQuantumLeap(queryConfig, callback, errCallback) {
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
        Authorization: `Bearer ${process.env.TOKEN}`,
      },
    })
    .then(function (response) {
      callback(response.data);
    })
    .catch(function (error) {
      // console.log("err");
      // console.log(error);
      errCallback(error);
    });
}

export {
  getCurrentDataFromContextBroker,
  getMultiCurrentDataFromContextBroker,
  getHistoricalDataFromQuantumLeap,
};
