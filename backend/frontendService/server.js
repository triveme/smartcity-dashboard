require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./app/models");

const app = express();
app.disable("x-powered-by");

var corsOptions = {
  origin: process.env.FRONTEND_HOST,
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

var loginString = "";
if (process.env.DB_USER && process.env.DB_PASS) {
  loginString = `${process.env.DB_USER}:${process.env.DB_PASS}@`;
}

//connect to MongoDB
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

//routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
