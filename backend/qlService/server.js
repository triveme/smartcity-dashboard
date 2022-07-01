import express from "express";
import mongoose from "mongoose";
import { runSchedule } from "./app/controllers/schedule.controller.js";
import "dotenv/config";
const app = express();
const port = 8081;

//connect to MongoDB
mongoose
  .connect(
    `mongodb://${process.env.DB_USER}:${process.env.DB_PWD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
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

// set port, listen for requests
const PORT = process.env.PORT || port;
app.listen(port, () => {
  console.log(`Server is running on port ${PORT}.`);
});

runSchedule();
