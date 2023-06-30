import { EBike } from "../models/ebike.model.js";
import { ECar } from "../models/ecar.model.js";
import { Parking } from "../models/parking.model.js";
import { mongoDB } from "../models/index.js";
const Querydata = mongoDB.querydata;
const Poi = mongoDB.poi;

function getQuerydata(callback) {
  Querydata.find({}, (err, querydata) => {
    if (err) {
      console.log({ status: 500, message: err });
      return;
    }
    if (!querydata) {
      console.log({ status: 404, message: "No Querydata found" });
      return;
    }
    callback(querydata);
  });
}

function updateQuerydata(queryItem) {
  return new Promise((resolve, reject) => {
    Querydata.updateOne({ _id: queryItem._id }, queryItem, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      if (!result.matchedCount) {
        reject("Didn't find item in Querydata");
        return;
      }
      resolve();
    });
  });
}

function updateQueryMsg(queryID, queryMsg) {
  return new Promise((resolve, reject) => {
    Querydata.updateOne(
      { _id: queryID },
      { updateMsg: queryMsg },
      (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        if (!result.matchedCount) {
          reject("Didn't find item in Querydata");
          return;
        }
        resolve();
      }
    );
  });
}

async function getPoi() {
  return await Poi.findOne({}, {}, { sort: { created_at: -1 } }).exec();
}

function insertPoi(poiItem) {
  return new Promise((resolve, reject) => {
    Poi.create(poiItem, (err) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function updatePoi(poiDb, poiItem) {
  return new Promise((resolve, reject) => {
    Poi.updateOne({ _id: poiDb._id }, poiItem, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      if (!result.matchedCount) {
        reject("Didn't find item in poi");
        return;
      }
      resolve();
    });
  });
}

async function getEBike() {
  return await EBike.findOne({}, {}, { sort: { created_at: -1 } }).exec();
}

function insertEBike(ebikeItem) {
  return new Promise((resolve, reject) => {
    EBike.create(ebikeItem, (err) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function updateEBike(ebikeDb, ebikeItem) {
  return new Promise((resolve, reject) => {
    EBike.updateOne({ _id: ebikeDb._id }, ebikeItem, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      if (!result.matchedCount) {
        reject("Didn't find item in poi");
        return;
      }
      resolve();
    });
  });
}

async function getECar() {
  return await ECar.findOne({}, {}, { sort: { created_at: -1 } }).exec();
}

function insertECar(ecarItem) {
  return new Promise((resolve, reject) => {
    ECar.create(ecarItem, (err) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function updateECar(ecarDb, ecarItem) {
  return new Promise((resolve, reject) => {
    ECar.updateOne({ _id: ecarDb._id }, ecarItem, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      if (!result.matchedCount) {
        reject("Didn't find item in poi");
        return;
      }
      resolve();
    });
  });
}

async function getParking() {
  return await Parking.findOne({}, {}, { sort: { created_at: -1 } }).exec();
}

function insertParking(parkingItem) {
  return new Promise((resolve, reject) => {
    Parking.create(parkingItem, (err) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      resolve();
    });
  });
}

function updateParking(parkingDb, parkingItem) {
  return new Promise((resolve, reject) => {
    Parking.updateOne({ _id: parkingDb._id }, parkingItem, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      if (!result.matchedCount) {
        reject("Didn't find parking item");
        return;
      }
      resolve();
    });
  });
}

export {
  getQuerydata,
  updateQueryMsg,
  updateQuerydata,
  getPoi,
  updatePoi,
  insertPoi,
  getEBike,
  insertEBike,
  updateEBike,
  getECar,
  insertECar,
  updateECar,
  getParking,
  insertParking,
  updateParking
};
