import { updateQueryMsg } from "./mongoDB.controller.js";

function handleError(queryID) {
  updateQueryMsg(queryID, "Daten konnten nicht geladen werden");
}

export { handleError };
