require("dotenv").config();

exports.checkEnvVars = () => {
  checkIfDBVarsAreSet();
  checkIfMandatoryEnvVarsAreSet();
};

function checkIfDBVarsAreSet() {
  if (
    process.env.DB_HOST == undefined ||
    process.env.DB_HOST == "" ||
    process.env.DB_PORT == undefined ||
    process.env.DB_PORT == "" ||
    process.env.DB_NAME == undefined ||
    process.env.DB_NAME == ""
  ) {
    console.log("DB_HOST, DB_PORT or DB_NAME not set");
  }

  if (
    process.env.DB_USER == undefined ||
    process.env.DB_USER == "" ||
    process.env.DB_PWD == undefined ||
    process.env.DB_PWD == ""
  ) {
    console.log("DB_USER or DB_PWD not set");
  }
}

function checkIfMandatoryEnvVarsAreSet() {
  if (
    process.env.FRONTEND_HOST == undefined ||
    process.env.FRONTEND_HOST == "" ||
    process.env.SECRET == undefined ||
    process.env.SECRET == "" ||
    process.env.API_URL == undefined ||
    process.env.API_URL == ""
  ) {
    console.log("FRONTEND_HOST, SECRET or API_URL not set");
  }
}
