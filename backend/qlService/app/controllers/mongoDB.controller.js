import { mongoDB } from "../models/index.js";
const Querydata = mongoDB.querydata;

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

export { getQuerydata, updateQueryMsg, updateQuerydata };
