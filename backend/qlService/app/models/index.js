const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const mongoDB = {};

mongoDB.mongoose = mongoose;

mongoDB.querydata = require("./querydata.model");

module.exports = mongoDB;
