const mongoDB = require("../models");
const Querydata = mongoDB.querydata;

exports.getQuerydata = (callback) => {
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
};

exports.updateQuerydata = (queryItem) => {
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
};

exports.updateQueryMsg = (queryID, queryMsg) => {
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
};
