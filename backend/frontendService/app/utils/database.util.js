require("dotenv").config();
const db = require("../models");

exports.setupDb = () => {
  var loginString = "";
  if (
    process.env.DB_USER &&
    process.env.DB_USER != "" &&
    process.env.DB_PWD &&
    process.env.DB_PWD != ""
  ) {
    loginString = `${process.env.DB_USER}:${process.env.DB_PWD}@`;
  }

  db.mongoose
    .connect(
      `mongodb://${loginString}${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    .then(() => {
      console.log("Successfully connect to MongoDB.");
    })
    .catch((err) => {
      console.error("Connection error", err);
      process.exit();
    });
};
