const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const mongoDB = {};

mongoDB.mongoose = mongoose;

mongoDB.dashboard = require("./dashboard.model");
mongoDB.querydata = require("./querydata.model");

module.exports = mongoDB;