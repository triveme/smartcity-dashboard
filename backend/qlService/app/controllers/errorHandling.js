import { updateQueryMsg } from "./mongoDB.controller.js";

function handleError(queryID, errString) {
  updateQueryMsg(
    queryID,
    errString ? errString : "Daten konnten nicht geladen werden"
  );
}

export { handleError };
