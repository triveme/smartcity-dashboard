import express from "express";
import { Express } from "express-serve-static-core";

export async function createServer(): Promise<Express> {
  const app = express();

  return app;
}
