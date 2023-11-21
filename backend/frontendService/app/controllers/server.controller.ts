import { NextFunction, Request, Response, Express } from "express";
import apiRouter from "../routers/api.router";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "../utils/swaggerSetup.util";

export default function configureApp(app: Express): void {
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"      
    );
    next();
  });

  app.use("/api", apiRouter);

  if(process.env.ENVIRONMENT == "development") {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec as Record<string, unknown>));
  }
}
