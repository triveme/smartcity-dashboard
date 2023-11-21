import { Router } from "express";
import userController from "../controllers/user.controller";

const dashboardRouter: Router = Router();

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
dashboardRouter.get("/", userController.getDashboards.bind(userController));

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
dashboardRouter.get("/:url", userController.getDashboards.bind(userController));

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
dashboardRouter.post("/", userController.postDashboards.bind(userController));

export default dashboardRouter;
