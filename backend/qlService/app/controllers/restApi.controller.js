import axios from "axios";
import https from "https";
import { generatePoiJson } from "./poiJson.js";

async function loadFromRest(dataType) {
  var response;

  var restUrl = "";
  if (dataType == "pois") {
    // restUrl = process.env.POI_URL;
    return generatePoiJson();
  } else if (dataType == "bikes") {
    restUrl = process.env.EBIKE_URL;
  } else if (dataType == "cars") {
    restUrl = process.env.ECAR_URL;
  } else if (dataType == "zooutilization1") {
    restUrl = process.env.APES_ENTRY;
  } else if (dataType == "zooutilization2") {
    restUrl = process.env.APES_EXIT;
  } else if (dataType == "parking") {
    restUrl = process.env.PARKING_URL;
  } else if (dataType == "swimming") {
    restUrl = process.env.SWIMMING_URL;
  }

  if (dataType !== "parking" && dataType !== "swimming") {
    response = await axios.get(restUrl).catch((err) => {
      console.error(err);
    });
  } else {
    //Hacky way of ignoring SSL needed for wuppertal server
    response = await axios
      .get(restUrl, {
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      })
      .catch((err) => {
        console.error(err);
      });
  }

  if (response != undefined) {
    return response.data;
  }

  console.log("no response found");
  return;
}

export { loadFromRest };
