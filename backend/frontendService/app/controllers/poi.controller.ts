import { QueryData } from "../models/querydata.model";
import querydataController from "./querydata.controller";

class PoiController {

  public async getPois(queryDataId: string) {
    try {
      // get all QD in the database
      const qd = await querydataController.findById(queryDataId);
      const pois = qd.data;
      return pois;
    } catch (err) {
      throw err;
    }
  }

  public async getFilteredPois(filters: string[], queryDataId: string) {
    try {
      const qd = await this.getPois(queryDataId);
      const filteredPois = qd!!.filter((poi) => {
        // Check if at least one string in the "types" array matches a filter string
        return poi.types.some((type: string) => filters.includes(type));
      });

      // Return the filtered array
      return filteredPois;

    } catch (err) {
      throw err;
    }
  }

}

export default new PoiController();