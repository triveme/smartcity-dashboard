import { Types } from "mongoose";

class ErrorController {
  public handleError(error: Error, queryItemId: unknown): void {
    if (typeof queryItemId === "object") {
      let value = queryItemId as Types.ObjectId;
      console.error(`Error when processing queryItemId: ${queryItemId}`);
    }

    console.error(error.message);
  }

  public handleWarning(warning: string, queryItemId: unknown): void {
    if (typeof queryItemId === "object") {
      let value = queryItemId as Types.ObjectId;
      console.warn(`Warning when processing queryItemId: ${queryItemId}`);
    }

    console.warn(warning);
  }
}

export default new ErrorController();
