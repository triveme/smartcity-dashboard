import { Router } from "express";
import dataService from "../services/data.service";

const wizardRouter: Router = Router();

/**
 * @swagger
 * /api/wizard/collections:
 *   get:
 *     summary: Retrieve a all collections
 *     description: Retrieve a list of all collections from rest api.
 *     responses:
 *       200:
 *         description: A list of all collections.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       500:
 *         description: Internal server error.
 */
wizardRouter.use("/collections", dataService.getCollections.bind(dataService));

/**
 * @swagger
 * /api/wizard/sources:
 *   get:
 *     summary: Retrieve a all sources
 *     description: Retrieve a list of all sources from rest api.
 *     responses:
 *       200:
 *         description: A list of all sources.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       500:
 *         description: Internal server error.
 *       400:
 *         description: Missing required parameters.
 */
wizardRouter.use("/sources", dataService.getSources.bind(dataService));

/**
 * @swagger
 * /api/wizard/attributes:
 *   get:
 *     summary: Retrieve a all attributes
 *     description: Retrieve a list of all attributes from rest api.
 *     responses:
 *       200:
 *         description: A list of all attributes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       500:
 *         description: Internal server error.
 *       400:
 *         description: Missing required parameters.
 */
wizardRouter.use("/attributes", dataService.getSourceAttributes.bind(dataService));

/**
 * @swagger
 * /api/wizard/sensors:
 *   get:
 *     summary: Retrieve a all sensors
 *     description: Retrieve a list of all sensors from rest api.
 *     responses:
 *       200:
 *         description: A list of all sensors.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       500:
 *         description: Internal server error.
 *       400:
 *         description: Missing required parameters.
 */
wizardRouter.use("/sensors", dataService.getSensors.bind(dataService));

export default wizardRouter;