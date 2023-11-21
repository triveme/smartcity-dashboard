import mongoose from "mongoose";
import { IUser } from "./user.model";
import { IRole } from "./role.model";
import { IDashboard } from "./dashboard.model";
import { IQueryData } from "./querydata.model";
mongoose.Promise = global.Promise;

interface IDB {
    mongoose: mongoose.Mongoose,
    user: mongoose.Model<IUser>,
    role: mongoose.Model<IRole>,
    dashboard: mongoose.Model<IDashboard>,
    querydata: mongoose.Model<IQueryData>,
    ROLES: string[],
}

const db: IDB = {
    mongoose,
    user: require("./user.model"),
    role: require("./role.model"),
    dashboard: require("./dashboard.model"),
    querydata: require("./querydata.model"),
    ROLES: ["admin"],
}

export default db;