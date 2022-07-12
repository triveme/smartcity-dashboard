const mongoDbController = require("./mongoDB.controller");

exports.handleError = (queryID) => {
  mongoDbController.updateQueryMsg(
    queryID,
    "Daten konnten nicht geladen werden"
  );
};
