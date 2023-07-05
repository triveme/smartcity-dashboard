import "dotenv/config";
import axios from "axios";
import { accessToken } from "./authenticationController.js";

const qlClient = axios.create({
  baseURL: `${process.env.QUANTUM_LEAP_URL}`,
});

const cbClient = axios.create({
  baseURL: `${process.env.CONTEXT_BROKER_URL}`,
});

function getCurrentDataFromContextBroker(queryConfig, callback, errCallback) {
  cbClient
    .get(`v2/entities/${queryConfig.entityId}`, {
      params: {
        attrs: queryConfig.attrs,
      },
      headers: {
        "Fiware-Service": queryConfig.fiwareService,
        "Fiware-ServicePath": process.env.FIWARE_SERVICE_PATH,
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then(function (response) {
      callback(response.data);
    })
    .catch(function (error) {
      let errString = handleErrorMessage(error);
      errCallback(errString);
    });
}

function getCurrentMapDataFromContextBroker(
  queryConfig,
  callback,
  errCallback
) {
  cbClient
    .get(`v2/entities?id=${queryConfig.entityId}`, {
      params: {
        attrs: queryConfig.attrs,
      },
      headers: {
        "Fiware-Service": queryConfig.fiwareService,
        "Fiware-ServicePath": process.env.FIWARE_SERVICE_PATH,
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then(function (response) {
      callback(response.data);
    })
    .catch(function (error) {
      let errString = handleErrorMessage(error);
      errCallback(errString);
    });
}

function getMultiCurrentDataFromContextBroker(
  queryConfig,
  callback,
  errCallback
) {
  cbClient
    .get(`v2/entities`, {
      params: {
        id: queryConfig.id,
        attrs: queryConfig.attrs,
      },
      headers: {
        "Fiware-Service": queryConfig.fiwareService,
        "Fiware-ServicePath": process.env.FIWARE_SERVICE_PATH,
        Authorization: `Bearer ${accessToken}`,
      },
    })

    .then(function (response) {
      // careful: With this req, the data is contained in an array called "attrs", not "attributes"
      callback(response.data);
    })
    .catch(function (error) {
      let errString = handleErrorMessage(error);
      errCallback(errString);
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
        "Fiware-ServicePath": process.env.FIWARE_SERVICE_PATH,
        Authorization: `Bearer ${accessToken}`,
      },
    })
    .then(function (response) {
      callback(response.data);
    })
    .catch(function (error) {
      let errString = handleErrorMessage(error);
      errCallback(errString);
    });
}

function handleErrorMessage(error) {
  let errString = "";
  if (!error.response || !error.request) {
    console.log(error);
  } else {
    if (error.response && error.response.status && error.response.statusText) {
      console.log(
        `${error.response.status} ${error.response.statusText} -----------------------------------------------------------------------------------`
      );
    }
    if (error.request && error.request.path) {
      console.log(`${error.request.path}`);
    }

    if (
      error.response &&
      error.response.data &&
      error.response.data.description &&
      error.response.data.error
    ) {
      errString = `${error.response.data.error}: ${error.response.data.description}`;
      console.log(errString);
    }
  }

  return errString;
}

export {
  getCurrentDataFromContextBroker,
  getCurrentMapDataFromContextBroker,
  getMultiCurrentDataFromContextBroker,
  getHistoricalDataFromQuantumLeap,
};
