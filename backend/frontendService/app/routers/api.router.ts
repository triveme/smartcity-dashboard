import { NextFunction, Request, Response, Router } from "express";
import dashboardRouter from "./dashboard.router";
import authRouter from "./auth.router";
import wizardRouter from "./wizard.router";
import poiRouter from "./poi.router";

const apiRouter: Router = Router();

apiRouter.use((req: Request, res: Response, next: NextFunction) => {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"    
  );
  next();
});

apiRouter.use("/dashboards", dashboardRouter);
apiRouter.use("/poi", poiRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/wizard", wizardRouter);

export default apiRouter;