const { authJwt } = require("../middlewares");
const apiRouter = require("../routers/api.router");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("../utils/swaggerSetup.util");
const dotenv = require("dotenv/config");

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.use("/api", apiRouter);

  if (process.env.ENVIRONMENT == "development") {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }
};
