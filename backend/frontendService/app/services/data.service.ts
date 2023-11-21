import axios from "axios";
import fs from "fs";
import path from "node:path";
import https, { Agent } from "node:https";
import { Request, Response } from "express";

class DataService {
  private httpsAgent: Agent;

  public constructor() {
    this.httpsAgent = new Agent();
    this.getHttpsAgent();
  }

  public async getCollections(req: Request, res: Response): Promise<void> {
    if (!(await this.checkApiUrl(res))) {
      return;
    }
  
    let url: string = `${process.env.API_URL}/collections`;

    await this.handleResponse(url, res);
  }

  public async getSensors(req: Request, res: Response): Promise<void> {
    if (!(await this.checkApiUrl(res))) {
      return;
    }
  
    if (!req.query.source || !req.query.collection) {
      res.status(400).send({ message: "Missing source or collection parameter" });
      return;
    }
  
    let filter: string = "";
  
    if (req.query.attribute !== undefined && req.query.attribute !== "") {
      filter = `?${req.query.attribute}`;
    }
  
    let url: string = `${process.env.API_URL}/collections/${req.query.collection}/${req.query.source}/entities${filter}`;

    this.handleResponse(url, res);
  }

  public async getSources(req: Request, res: Response): Promise<void> {
    if (!(await this.checkApiUrl(res))) {
      return;
    }
  
    if (!req.query.collection) {
      res.status(400).send({ message: "Missing collection parameter" });
      return;
    }
  
    let url: string = `${process.env.API_URL}/collections/${req.query.collection}`;

    this.handleResponse(url, res);
  }

  public async getSourceAttributes(req: Request, res: Response): Promise<void> {
    if (!(await this.checkApiUrl(res))) {
      return;
    }
  
    if (!req.query.source || !req.query.collection) {
      res.status(400).send({ message: "Missing source or collection parameter" });
      return;
    }
  
    let url: string = `${process.env.API_URL}/collections/${req.query.collection}/${req.query.source}/dictionary`;

    try {
      const response = await axios.get(url, { httpsAgent: this.httpsAgent });
      console.log(response.data);
      res.status(200).send(Object.keys(response.data));
    } catch(err: any) {
      console.log("tried to connect to url: " + url);
      console.log(err);
      res.status(500).send({ message: err.message });
    }
  }

  private async getHttpsAgent(): Promise<void> {
    if(this.httpsAgent) {
      return;
    }

    let httpsAgentConfig = {};

    if (
      process.env.API_CERTIFICATE_PASSWORD !== undefined &&
      process.env.API_CERTIFICATE_PASSWORD !== ""
    ) {
      const certificate = await this.getCertificate();
      httpsAgentConfig = {
        pfx: certificate,
        passphrase: process.env.API_CERTIFICATE_PASSWORD,
      };
    }
    
    this.httpsAgent = new https.Agent(httpsAgentConfig);
  }

  private async getCertificate(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        resolve(
          fs.readFileSync(path.join(__dirname, "..", "..", "api_certificate.p12"))
        );
      } catch (err) {
        reject(err);
      }
    });
  }  

  private async checkApiUrl(res: Response): Promise<boolean> {
    if (process.env.API_URL === undefined || process.env.API_URL === "") {
      console.log("\x1b[31mAPI_URL not set\x1b[0m");
      res.status(500).send({ message: "Internal error when fetching data" });
      return false;
    }
    return true;
  }

  private async handleResponse(url: string, res: Response): Promise<void> {
    try {
      const response = await axios.get(url, { httpsAgent: this.httpsAgent });
      console.log(response.data);
      res.status(200).send(response.data);
    } catch(err: any) {
      console.log("tried to connect to url: " + url);
      console.log(err);
      res.status(500).send({ message: err.message });
    }
  }
}

export default new DataService();