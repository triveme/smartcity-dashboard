var express = require("express");
var dashboardRouter = express.Router();

const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

/**
 * @swagger
 * /api/dashboards:
 *   get:
 *     summary: Retrieve a list of all dashboards
 *     description: Retrieve a list of all dashboards from mongodb.
 *     responses:
 *       200:
 *         description: A list of dashboards.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
dashboardRouter.get("/", controller.getDashboards);

/**
 * @swagger
 * /api/dashboards/{url}:
 *   get:
 *     summary: Retrieve a a dashboard with url
 *     description: Retrieve a specific dashboard with it's given url.
 *     responses:
 *       200:
 *         description: A specific dashboard.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Dashboard not found.
 */
dashboardRouter.get("/:url", controller.getDashboards);

/**
 * @swagger
 * /api/dashboards:
 *   post:
 *     summary: Create or update a dashboard
 *     description: Send a dashboard json body to this endpoint. If it contains an id-field it will update the specific dashboard.
 *     responses:
 *       200:
 *         description: A list of all dashboards.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       500:
 *         description: Internal server error.
 */
dashboardRouter.post(
  "/",
  [authJwt.verifyToken, authJwt.isAdmin],
  controller.postDashboards
);

module.exports = dashboardRouter;
