import moment from "moment";
import {
  getPoi,
  updatePoi,
  insertPoi,
  getEBike,
  insertEBike,
  updateEBike,
  getECar,
  insertECar,
  updateECar,
  getParking,
  insertParking,
  updateParking,
} from "./mongoDB.controller.js";
import { loadFromRest } from "./restApi.controller.js";

async function loadData(dataType) {
  var data = {};

  if (dataType == "pois") {
    var poiDb = await getPoi();

    data = await updateDb(dataType, poiDb, insertPoi, updatePoi);
  } else if (dataType == "bikes") {
    var ebikeDb = await getEBike();

    data = await updateDb(dataType, ebikeDb, insertEBike, updateEBike);
  } else if (dataType == "cars") {
    var ecarDb = await getECar();

    data = await updateDb(dataType, ecarDb, insertECar, updateECar);
  } else if (dataType == "zooutilization") {
    var ecarDb = await getECar();

    data = await updateDb(dataType, ecarDb, insertECar, updateECar);
  } else if (dataType == "parking") {
    var parkingDb = await getParking();
    data = await updateDb(dataType, parkingDb, insertParking, updateParking);
  } else {
    console.error("ERROR: Unknown/Empty dataType in loadData: " + dataType);
  }

  return data;
}

async function updateDb(dataType, dataDb, insertDb, updateDb) {
  if (dataDb === undefined || dataDb === null || getDbDiffHours(dataDb) >= 24) {
    var dataRest = await loadFromRest(dataType).catch((err) =>
      console.error(err)
    );

    try {
      if (dataRest !== undefined) {
        if (dataType === "parking") {
          let temp = dataRest;
          dataRest = {
            features: temp,
          };
        }
        console.log(
          `Fetched ${dataType} data with length of ${dataRest.features.length}`
        );
        if (dataDb === undefined || dataDb === null) {
          insertDb(dataRest).catch((err) => console.error(err));
        } else {
          updateDb(dataDb, dataRest).catch((err) => console.error(err));
        }

        return dataRest.features;
      }
    } catch (error) {
      console.error(`ERROR in updateDB with ${dataType}: ${error}`);
    }
  } else {
    return dataDb.features;
  }
}

function getDbDiffHours(dbItem) {
  if (dbItem !== undefined) {
    return moment().diff(moment(dbItem.updatedAt), "hours", true);
  }
  return 24.1;
}

export { loadData };
