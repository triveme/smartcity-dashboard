var express = require("express");
var apiRouter = express.Router();
var dashboardRouter = require("./dashboard.router");
var authRouter = require("./auth.router");
var wizardRouter = require("./wizard.router");

apiRouter.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});
apiRouter.use("/dashboards", dashboardRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/wizard", wizardRouter);

module.exports = apiRouter;
