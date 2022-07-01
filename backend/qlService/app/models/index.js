import mongoose from "mongoose";
import { Querydata } from "./querydata.model.js";
mongoose.Promise = global.Promise;

const mongoDB = {};

mongoDB.mongoose = mongoose;

mongoDB.querydata = Querydata;

export { mongoDB };
