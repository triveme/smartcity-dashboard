const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.role = require("./role.model");
db.dashboard = require("./dashboard.model");
db.querydata = require("./querydata.model");
db.poi = require("./");
db.ROLES = ["admin"];

module.exports = db;
