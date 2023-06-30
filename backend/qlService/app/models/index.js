import mongoose from "mongoose";
import { Querydata } from "./querydata.model.js";
import { Poi } from "./poi.model.js";
import { EBike } from "./ebike.model.js";
import { ECar } from "./ecar.model.js";
import { Parking } from "./parking.model.js";

mongoose.Promise = global.Promise;

const mongoDB = {};

mongoDB.mongoose = mongoose;

mongoDB.querydata = Querydata;
mongoDB.poi = Poi;
mongoDB.ebike = EBike;
mongoDB.ecar = ECar;
mongoDB.parking = Parking;

export { mongoDB };
