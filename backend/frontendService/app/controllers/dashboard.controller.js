const db = require("../models");
const Dashboard = db.dashboard;

exports.updateOneById = (dashboardId, dataToUpdate) => {
  return new Promise((resolve, reject) => {
    Dashboard.updateOne({ _id: dashboardId }, dataToUpdate, (err, result) => {
      if (err) {
        reject(err);
      }
      if (!result.matchedCount) {
        reject(`UPDATE: Dashboard not found`);
      }
      console.log(`Dashboard updated with QueryId`);
      resolve();
    });
  });
};

exports.findAll = (callback) => {
  return new Promise((resolve, reject) => {
    Dashboard.find({}, (err, dashboards) => {
      if (err) {
        reject(err);
        return;
      }
      if (!dashboards) {
        reject("no dashboards found in collection");
        return;
      }
      resolve(dashboards);
    });
  });
};

exports.deleteOneById = (dashboardId, statusCallback) => {
  return new Promise((resolve, reject) => {
    Dashboard.deleteOne({ _id: dashboardId }, (err, result) => {
      if (err) {
        statusCallback({ status: 500, message: err });
        reject(err);
        return;
      }
      if (!result.deletedCount) {
        statusCallback({ status: 404, message: `DELETE: Dashboard not found` });
        reject(`DELETE: Dashboard not found`);
        return;
      }
      statusCallback({ status: 200, message: `Dashboard deleted` });
      resolve();
    });
  });
};

exports.addOne = (dashboard, statusCallback) => {
  return new Promise((resolve, reject) => {
    const dashboardToAdd = new Dashboard(dashboard);
    dashboardToAdd.save((err, dashboard) => {
      if (err) {
        statusCallback({ status: 500, message: err });
        reject(err);
        return;
      }
      statusCallback({ status: 200, message: `Dashboard added` });
      resolve(dashboard);
    });
  });
};

exports.updateOneAsync = (dashbId, dashbDataToUpdate, statusCallback) => {
  return new Promise((resolve, reject) => {
    Dashboard.updateOne({ _id: dashbId }, dashbDataToUpdate, (err, result) => {
      if (err) {
        statusCallback({ status: 500, message: err });
        reject(err);
        return;
      }
      if (!result.matchedCount) {
        statusCallback({ status: 404, message: `UPDATE: Dashboard not found` });
        reject(`UPDATE: Dashboard not found`);
        return;
      }
      statusCallback({ status: 200, message: `Dashboard updated` });
      resolve();
    });
  });
};
