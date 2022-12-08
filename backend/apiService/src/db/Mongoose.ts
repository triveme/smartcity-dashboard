import "dotenv/config";
import env from "env-var";
import mongoose, { connect } from "mongoose";

export function connectMongoDB(): Promise<typeof mongoose> {
  checkIfDbEnvVarsAreSet();

  const mongoDBHost = env.get("DB_HOST").required().asString();
  const mongoDBPort = env.get("DB_PORT").required().asString();
  const mongoDBUser = env.get("DB_USER").asString();
  const mongoDBPass = env.get("DB_PWD").asString();
  const mongoDBName = env.get("DB_NAME").required().asString();

  const userInfoNeeded =
    mongoDBUser != undefined &&
    mongoDBUser != "" &&
    mongoDBPass != undefined &&
    mongoDBPass != "";

  const userInfo = userInfoNeeded ? `${mongoDBUser}:${mongoDBPass}@` : "";
  console.log(
    "trying to connect to mongodb with following url: ",
    `mongodb://${mongoDBUser}:*pass*@${mongoDBHost}:${mongoDBPort}/${mongoDBName}`
  );

  return connect(
    `mongodb://${userInfo}${mongoDBHost}:${mongoDBPort}/${mongoDBName}`
  );
}

function checkIfDbEnvVarsAreSet() {
  if (
    env.get("DB_HOST").asString() == undefined ||
    env.get("DB_HOST").asString() == ""
  ) {
    console.log("DB_HOST is not set");
  }
  if (
    env.get("DB_PORT").asString() == undefined ||
    env.get("DB_PORT").asString() == ""
  ) {
    console.log("DB_PORT is not set");
  }
  if (
    env.get("DB_NAME").asString() == undefined ||
    env.get("DB_NAME").asString() == ""
  ) {
    console.log("DB_NAME is not set");
  }
  if (
    env.get("DB_USER").asString() == undefined ||
    env.get("DB_USER").asString() == ""
  ) {
    console.log("DB_USER is not set");
  }
  if (
    env.get("DB_PWD").asString() == undefined ||
    env.get("DB_PWD").asString() == ""
  ) {
    console.log("DB_PWD is not set");
  }
}
