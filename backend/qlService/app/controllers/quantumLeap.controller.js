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
  // Define the base Axios configuration
  const axiosConfig = {
    headers: {
      "Fiware-Service": queryConfig.fiwareService,
      "Fiware-ServicePath": "/",
      Authorization: `Bearer ${accessToken}`,
    },
  };

  // Check if queryConfig.attrs has a length greater than 0
  if (queryConfig.attrs && queryConfig.attrs.length > 0) {
    axiosConfig.params = {
      attrs: queryConfig.attrs,
      type: queryConfig.fiwareType,
      limit: 1,
    };
  } else {
    axiosConfig.params = {
      type: queryConfig.fiwareType,
    };
  }

  cbClient
    .get(`v2/entities/${queryConfig.entityId}`, axiosConfig)
    .then(function (response) {
      callback(response.data);
    })
    .catch(function (error) {
      console.error("Error while processing getCurrentDataFromContextBroker");
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
        type: queryConfig.fiwareType,
      },
      headers: {
        "Fiware-Service": queryConfig.fiwareService,
        "Fiware-ServicePath": "/",
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
        type: queryConfig.fiwareType,
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
      console.log(error.response.data);
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
  getMultiCurrentDataFromContextBroker,
  getHistoricalDataFromQuantumLeap,
};
