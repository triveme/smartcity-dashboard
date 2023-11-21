import * as dotenv from "dotenv";
import express, { Express } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import configApp from "./app/controllers/server.controller";
import { EnvVarsChecker } from "./app/utils/envVars.util";
import { DbUtil } from "./app/utils/database.util";

export class Server {
  private app: Express;
  private readonly port: number;

  constructor() {
    this.config();
    this.port = Number(process.env.PORT);
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupDatabase();
  }

  private config(): void {
    dotenv.config();
    EnvVarsChecker.checkEnvVars();
  }

  private setupMiddleware(): void {
    this.app.use(cors({ origin: process.env.FRONTEND_HOST }));
    this.app.use(bodyParser.json({ limit: "50mb" }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    configApp(this.app);
  }

  private setupDatabase(): void {
    DbUtil.setupDb();
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server is running on port ${this.port}`);
    });
  }
}
