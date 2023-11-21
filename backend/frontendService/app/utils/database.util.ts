import * as dotenv from 'dotenv';
import db from "../models";
import { MongoClientOptions } from "mongodb";

export class DbUtil {
  
  public static setupDb(): void {
    dotenv.config();

    const { DB_USER, DB_PWD, DB_HOST, DB_PORT, DB_NAME } = process.env;
    const loginString = DB_USER && DB_PWD ? `${DB_USER}:${DB_PWD}@` : '';

    db.mongoose
    .connect(
      `mongodb://${loginString}${DB_HOST}:${DB_PORT}/${DB_NAME}`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as MongoClientOptions
    )
    .then(() => {
      console.log('\x1b[32mSuccessfully connected to MongoDB.\x1b[0m'); // print log in text-color green
    })
    .catch((err: Error) => {
      console.error('\x1b[31mConnection error\x1b[0m', err); // print error in text-color red
      process.exit();
    });
  }
}