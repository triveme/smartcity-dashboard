require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbUtil = require("./app/utils/database.util");
const envVarsUtil = require("./app/utils/envVars.util");
const bodyParser = require("body-parser");

envVarsUtil.checkEnvVars();

const app = express();

var corsOptions = {
  // origin: process.env.FRONTEND_HOST,
  origin: ["http://dashboard:3000", "http://dashboard.smartcity-eichenzell.de"],
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "50mb" }));
// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

dbUtil.setupDb();

//routes
require("./app/controllers/server.controller")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
