import axios, { AxiosResponse } from "axios";
import { IQueryConfig } from "../models/QueryData";
import "dotenv/config";
import env from "env-var";
import moment from "moment";
import { Agent } from "https";
import * as fs from "fs";
import * as path from "path";

class RestController {
  private apiUrl: string;
  private httpsAgent: Agent;

  constructor() {
    this.apiUrl = (env.get("API_URL").asString() ?? "") + "/collections/";
    let agentConfig = {};

    if (
      process.env.API_CERTIFICATE_PASSWORD &&
      process.env.API_CERTIFICATE_PASSWORD !== ""
    ) {
      agentConfig = {
        pfx: fs.readFileSync(
          path.join(__dirname, "..", "..", "api_certificate.p12")
        ),
        passphrase: process.env.API_CERTIFICATE_PASSWORD,
      };
    }

    this.httpsAgent = new Agent(agentConfig);
  }

  public getMultiSensorDictionary(
    queryConfig: IQueryConfig
  ): Promise<AxiosResponse[]> {
    return new Promise((resolve, reject) => {
      let responses: AxiosResponse[] = [];
      queryConfig.entityId.forEach((entityId) => {
        this.getSensorDictionary(queryConfig.fiwareService, entityId)
          .then((response: AxiosResponse) => responses.push(response.data))
          .catch((error) => reject(error));
      });

      resolve(responses);
    });
  }

  public getSensorDictionary(
    fiwareService: string,
    entityId: string
  ): Promise<AxiosResponse> {
    return axios.get(
      this.buildQueryStringForSensorDictionary(fiwareService, entityId),
      {
        headers: {
          Accept: "application/json",
        },
        httpsAgent: this.httpsAgent,
      }
    );
  }

  public getCurrentData(
    queryConfig: IQueryConfig,
    filterValue: string = ""
  ): Promise<AxiosResponse> {
    return new Promise((resolve, reject) => {
      axios
        .get(
          this.buildQueryStringForCurrentData(
            queryConfig,
            queryConfig.entityId[0],
            1,
            filterValue
          ),
          {
            headers: {
              Accept: "application/json",
            },
            httpsAgent: this.httpsAgent,
          }
        )
        .then((response) => {
          response.data.length = 1;
          resolve(response);
        })
        .catch((error) => reject(error));
    });
  }

  public getHistoricalData(
    queryConfig: IQueryConfig,
    filterValue: string = ""
  ): Promise<AxiosResponse> {
    return axios.get(
      this.buildQueryStringForHistoricalData(queryConfig, filterValue),
      {
        headers: {
          Accept: "application/json",
        },
        httpsAgent: this.httpsAgent,
      }
    );
  }

  public getMultiCurrentData(
    queryConfig: IQueryConfig,
    filterValue = ""
  ): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let restResponses: any[] = [];

      queryConfig.entityId.forEach((entityId) => {
        axios
          .get(
            this.buildQueryStringForCurrentData(
              queryConfig,
              entityId,
              100,
              filterValue
            ),
            {
              headers: {
                Accept: "application/json",
              },
              httpsAgent: this.httpsAgent,
            }
          )
          .then((response) => restResponses.push(response.data))
          .catch((error) => reject(error));
      });

      resolve(restResponses);
    });
  }

  private buildQueryStringForSensorDictionary(
    fiwareService: string,
    entityId: string
  ): string {
    return this.apiUrl + `${fiwareService}/${entityId}/dictionary`;
  }

  private buildQueryStringForCurrentData(
    queryConfig: IQueryConfig,
    entityId: string,
    limit: number = 1,
    filterValue: string = ""
  ): string {
    var url = new URL(
      this.apiUrl + `${queryConfig.fiwareService}/${entityId}/data/`
    );

    url.searchParams.append("limit", limit.toString());
    if (filterValue !== "") {
      url.searchParams.append("filtervalues", filterValue);

      if (queryConfig.filterProperty !== "") {
        url.searchParams.append(
          "filterproperty",
          queryConfig.filterProperty.toString()
        );
      }
    }
    console.log(url.toString());
    return url.toString();
  }

  private buildQueryStringForHistoricalData(
    queryConfig: IQueryConfig,
    filterValue: string = ""
  ): string {
    let startTimestamp = queryConfig.fromDate;
    let endTimestamp = queryConfig.toDate;

    var url = new URL(
      this.apiUrl +
        `${queryConfig.fiwareService}/${queryConfig.entityId[0]}/data/`
    );

    url.searchParams.append("fromDate", startTimestamp.toISOString());
    url.searchParams.append("toDate", endTimestamp.toISOString());

    if (filterValue !== "") {
      url.searchParams.append("filtervalues", filterValue);

      if (queryConfig.filterProperty !== "") {
        url.searchParams.append(
          "filterproperty",
          queryConfig.filterProperty.toString()
        );
      }
    }
    console.log(url.toString());
    return url.toString();
  }
}

export default new RestController();
