const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = (app) => {
    app.use((req, res, next) => {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post("/api/dashboards", [authJwt.verifyToken, authJwt.isAdmin], controller.postDashboards);

    app.get("/api/dashboards/:url", controller.getDashboards);

    app.get("/api/dashboards", controller.getDashboards);
};
