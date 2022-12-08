import { connectMongoDB } from "./db/Mongoose";
import "dotenv/config";
import env from "env-var";
import { createServer } from "./utils/Server";
import schedule from "./controllers/ScheduleController";
const port = env.get("PORT").required().asPortNumber();

connectMongoDB()
  .then(() => createServer())
  .then((server) => server.listen(port))
  .then(() => console.log(`Server listening on port ${port}`))
  .then(() => schedule.runSchedule())
  .catch((err) => console.log(err));
