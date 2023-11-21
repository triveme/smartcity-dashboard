import { Router, Request, Response } from "express";
import poiController from "../controllers/poi.controller";

const poiRouter = Router();

/**
 * @swagger
 * /api/poi/{queryDataId}:
 *   get:
 *     summary: Retrieve and filter a list of pois
 *     description: Retrieve and filter a list of pois from mongodb.
 *     parameters:
 *       - in: path
 *         name: queryDataId
 *         required: true
 *         description: The ID used for querying data.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of pois.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 */
poiRouter.get("/:queryDataId", async (req: Request, res: Response) => {
  try {
    // converting query.filter param to string
    const filtersParam = req.query.filter as string;
    const queryDataIdParam = req.params.queryDataId;
    if (!filtersParam) {
      // If no filter parame is provided in the query, get all POIs
      const pois = await poiController.getPois(queryDataIdParam);
      res.send(pois);
    } else {
      // Split the filter parameter into an array of strings
      const filters = filtersParam.split(",");

      // Use the filters when invoking the filterPois method
      const filteredPois = await poiController.getFilteredPois(filters, queryDataIdParam);
      res.send(filteredPois);
    }
  } catch (err) {
    res.status(500).send({ error: "An error occurred while processing your request to the GET /poi endpoint." });
  }
});

export default poiRouter;