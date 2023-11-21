import { Request, Response } from "express";
import {
  Dashboard,
  DashboardModel,
  IDashboard,
  Widget,
} from "../models/dashboard.model";
import _ from "lodash";
import dashboardController from "./dashboard.controller";
import querydataController from "./querydata.controller";
import { QueryConfig, QueryData } from "../models/querydata.model";
import { getAuthenticatedRolesFromRequest } from "../middlewares/auth";
let status = [String];

class UserController {
  /**
   * add, update, delete dashboards
   * @param {request} req
   * @param {response} res
   */
  public async postDashboards(req: Request, res: Response): Promise<void> {
    console.log(`incoming ${req.method}-request on ${req.url}`);
    console.log(req.body);
    await this.createUpdateDelete(req, res, this.updateStatus);
  }

  private async createUpdateDelete(
    req: Request,
    res: Response,
    fun: any
  ): Promise<void> {
    status = [];

    await Promise.all(
      req.body.map(async (dashboard: Dashboard) => {
        if (dashboard._id) {
          // dashboard id already exists => update/delete
          if (Object.keys(dashboard).length === 1) {
            // delete a dashboard
            try {
              if (
                (await getAuthenticatedRolesFromRequest(req)).includes("admin")
              ) {
                await dashboardController
                  .deleteOneById(dashboard._id, fun)
                  .catch((e) => {
                    console.log(e);
                  });
              } else {
                res.status(403).send({
                  message: "Only admins are allowed to delete dashboards.",
                });
              }
            } catch (e) {
              console.log(e);
            }
          } else {
            // update the dashboard
            if (this.dashboardDataConfigIsValid(dashboard)) {
              try {
                await this.updateDashboard(
                  dashboard,
                  await getAuthenticatedRolesFromRequest(req),
                  fun
                );
                await this.addAndUpdateQd(dashboard);
              } catch (e) {
                console.log(e);
              }
            } else {
              console.log("Illegal data config detected, aborting.");
            }
          }
        } else {
          // dashboard id doesn't exist => create a new one
          if ((await getAuthenticatedRolesFromRequest(req)).includes("admin")) {
            if (this.dashboardDataConfigIsValid(dashboard)) {
              await this.addDashboard(dashboard, fun)
                .catch((e: Error) => {
                  console.error(e);
                })
                .then(async (result: any) => await this.addAndUpdateQd(result));
            } else {
              res.status(403).send({
                message: "Only admins are allowed to create dashboards.",
              });
            }
          } else {
            console.log("Illegal data config detected, aborting.");
          }
        }
      })
    );
    // const statusDeletedQD = await this.checkForDeletionOfQueryDataIds();
    // console.log(statusDeletedQD);
    this.sendDashboards("", req, res);
    console.log(status);
  }

  private updateStatus(newStatus: StringConstructor): void {
    status.push(newStatus);
  }

  /**
   * send whole dashboard data of requested dashboard
   * + name, url, icon of other dashboards
   * @param {request} req
   * @param {response} res
   */
  public getDashboards = (req: Request, res: Response): void => {
    this.sendDashboards(req.params.url, req, res);
  };

  /**
   * send response with dashboards
   * and detailed structure from specified dashboard
   * @param {url of dashboard to show} dashboardUrl
   * @param {response} res
   */
  private async sendDashboards(
    dashboardUrl: string,
    req: Request,
    res: Response
  ): Promise<void> {
    const authenticatedRoles = await getAuthenticatedRolesFromRequest(req);
    const isAdmin = authenticatedRoles.includes("admin");

    const query = isAdmin
      ? {}
      : {
          $or: [
            { visible: true },
            {
              $or: [
                { "roles.write": { $in: authenticatedRoles } },
                { "roles.read": { $in: authenticatedRoles } },
              ],
            },
          ],
        };

    DashboardModel.find(query, (err: Error, dashboards: IDashboard[]) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }
      if (!dashboards) {
        res.status(404).send({ message: "No Dashboards found" });
        return;
      }
      this.getDashboardsResponseContent(dashboards, dashboardUrl).then(
        (newDashboards) => {
          res.status(200).send(newDashboards);
        }
      );
    }).sort({ index: 1 });
  }

  /**
   * filters dashboards content
   * only return children for specified dashboard (url) / or index 0 if url not specified
   * only return visible dashboards if request-user isn't admin
   * @param {dashboards to filter} dashboards
   * @param {url of dashboard with full information} dashboardUrl
   * @param {boolean, if request-user is signed in} isAdmin
   * @returns
   */
  private async getDashboardsResponseContent(
    dashboards: Dashboard[],
    dashboardUrl: string | undefined
  ): Promise<Dashboard[]> {
    if (!dashboardUrl) dashboardUrl = this.getFirstDashboardUrl(dashboards);
    let filteredDashboards;
    filteredDashboards = dashboards.map((currDashboard) => {
      const selectedDashboard = currDashboard.url === dashboardUrl;
      return this.getDashboardInformationToSend(
        currDashboard,
        selectedDashboard
      );
    });
    return this.fillApexDataWithQd(filteredDashboards);
  }

  private getDashboardInformationToSend(
    dashboard: Dashboard,
    withWidgets: boolean
  ): Dashboard {
    let dashboardInformation: Dashboard = {
      _id: dashboard._id,
      name: dashboard.name,
      url: dashboard.url,
      icon: dashboard.icon,
      visible: dashboard.visible,
      roles: dashboard.roles,
    };
    if (withWidgets) {
      dashboardInformation.widgets = dashboard.widgets;
    }
    return dashboardInformation;
  }

  private getFirstDashboardUrl(dashboards: Dashboard[]): string | undefined {
    if (dashboards.length > 0) {
      return dashboards[0].url;
    } else {
      console.log("dashboards array empty");
      return undefined;
    }
  }

  private async fillApexDataWithQd(
    dashboards: Dashboard[]
  ): Promise<Dashboard[]> {
    await Promise.all(
      dashboards.map(async (dashboard) => {
        if (dashboard.widgets) {
          await Promise.all(
            dashboard.widgets.map(async (widget) => {
              if (widget.panels) {
                await Promise.all(
                  widget.panels.map(async (panel) => {
                    if (panel.tabs) {
                      await Promise.all(
                        panel.tabs.map(async (tab) => {
                          if (tab.queryData && tab.queryData._id) {
                            try {
                              const result = await querydataController.findById(
                                tab.queryData._id
                              );
                              if (tab.type === "chart") {
                                if (
                                  result &&
                                  result.queryConfig &&
                                  result.queryConfig.apexType &&
                                  result.data &&
                                  result.dataLabels
                                ) {
                                  tab.apexSeries = result.data;
                                  if (result.queryConfig.apexType === "donut") {
                                    _.set(
                                      tab,
                                      "apexOptions.labels",
                                      result.dataLabels
                                    );
                                  } else if (
                                    result.queryConfig.apexType === "line" ||
                                    result.queryConfig.apexType === "bar" ||
                                    result.queryConfig.apexType ===
                                      "measurement"
                                  ) {
                                    _.set(
                                      tab,
                                      "apexOptions.xaxis.categories",
                                      result.dataLabels
                                    );
                                    _.set(
                                      tab,
                                      "apexOptions.xaxis.type",
                                      "category"
                                    );
                                    _.set(
                                      tab,
                                      "apexOptions.xaxis.tickAmount",
                                      undefined
                                    );
                                    _.set(
                                      tab,
                                      "apexOptions.xaxis.labels.rotate",
                                      0
                                    );
                                  } else {
                                    console.log(
                                      "Can't set chart labels for unknown chart type, please have a look at user.controller.js"
                                    );
                                  }
                                  if (typeof result.updateMsg !== "undefined") {
                                    _.set(
                                      tab,
                                      "queryUpdateMsg",
                                      result.updateMsg
                                    );
                                  }
                                } else {
                                  console.log(
                                    "Querydata not found by id, please have a look at user.controller.js"
                                  );
                                }
                              } else if (tab.type === "value") {
                                if (
                                  result &&
                                  result.queryConfig &&
                                  result.data
                                ) {
                                  tab.values = result.data;
                                }
                              } else if (tab.type === "component") {
                                if (
                                  tab.componentType === "utilization" &&
                                  result.data !== undefined &&
                                  result.data !== null
                                ) {
                                  tab.apexSeries = result.data[0];
                                  _.set(
                                    tab,
                                    "apexOptions.xaxis.categories",
                                    result.dataLabels
                                  );
                                  tab.componentData = result.data[1];
                                } else {
                                  tab.componentData = result.data;
                                }
                              }
                            } catch (e) {
                              console.log(e);
                            }
                          }
                        })
                      );
                    }
                  })
                );
              }
            })
          );
        }
      })
    );
    return dashboards;
  }

  /**
   * update specified dashboard (id) with content of dashboard
   * @param {dashboard to update + dashboardcontent} dashboard
   */
  private async updateDashboard(
    dashboard: Dashboard,
    authenticatedRoles: any,
    saveStatus: any
  ): Promise<void> {
    dashboard.widgets = this.omitEmptyIds(dashboard.widgets!);
    return await dashboardController.updateOneAsync(
      dashboard._id,
      dashboard,
      authenticatedRoles,
      saveStatus
    );
  }

  /**
   * add dashbaord to database
   * @param {dashboard to add} dashboard
   */
  private async addDashboard(
    dashboard: Dashboard | _.Omit<any, "_id">,
    saveStatus: any
  ): Promise<Dashboard> {
    if (dashboard.widgets) {
      dashboard.widgets = this.omitEmptyIds(dashboard.widgets);
    }
    dashboard = _.omit(dashboard, ["_id"]);
    return dashboardController.addOne(dashboard, saveStatus);
  }

  /**
   * omit empty _ids from widgets, panels & tabs
   */
  private omitEmptyIds(widgets: Widget[]): Widget[] {
    if (widgets) {
      widgets = widgets.map((widget) => {
        widget.panels = widget.panels.map((panel) => {
          panel.tabs = panel.tabs.map((tab) => {
            if ("_id" in tab && !tab._id) {
              return _.omit(tab, ["_id"]);
            } else {
              return tab;
            }
          });
          if ("_id" in panel && !panel._id) {
            return _.omit(panel, ["_id"]);
          } else {
            return panel;
          }
        });
        if ("_id" in widget && !widget._id) {
          return _.omit(widget, ["_id"]);
        } else {
          return widget;
        }
      });
    }
    return widgets;
  }

  // make sure there are no illegal characters in the strings used for the querydata
  private isValidDataConfigString(str: string): boolean {
    const re = new RegExp("^[A-Za-z0-9:_-]+$");
    return re.test(str);
  }

  private dashboardDataConfigIsValid(dashboard: Dashboard): boolean {
    try {
      let valid = true;

      if (dashboard.widgets) {
        for (const widget of dashboard.widgets) {
          for (const panel of widget.panels) {
            for (const tab of panel.tabs) {
              if (
                tab.fiwareService &&
                !this.isValidDataConfigString(tab.fiwareService)
              ) {
                valid = false;
              }

              if (tab.entityId) {
                for (const eId of tab.entityId) {
                  if (!this.isValidDataConfigString(eId)) {
                    valid = false;
                  }
                }
              }

              if (tab.attribute && tab.attribute.keys) {
                for (const key of tab.attribute.keys) {
                  if (!this.isValidDataConfigString(key)) {
                    valid = false;
                  }
                }
              }
            }
          }
        }
      }

      return valid;
    } catch (error) {
      console.log("Error checking data config validity:");
      console.log(error);
      return false;
    }
  }

  private async addAndUpdateQd(dashboard: Dashboard): Promise<void> {
    const { dataToAdd, dataToUpdate } = this.getQdToAddAndUpdate(dashboard);

    await Promise.all([
      this.addQueries(dashboard, dataToAdd),
      this.updateQd(dataToUpdate),
    ]);
    return new Promise((resolve) => resolve());
    // return dashboard;
  }

  private isEqualQueryConfig(
    config1: QueryConfig,
    config2: QueryConfig
  ): boolean {
    const keys1 = Object.keys(config1);
    const keys2 = Object.keys(config2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (!keys2.includes(key)) {
        return false;
      }

      const value1 = config1[key];
      const value2 = config2[key];

      if (Array.isArray(value1)) {
        if (
          !Array.isArray(value2) ||
          value1.length !== value2.length ||
          !value1.every((v, i) => v === value2[i])
        ) {
          return false;
        }
      } else if (typeof value1 === "object" && value1 !== null) {
        if (!this.isEqualQueryConfig(value1, value2)) {
          return false;
        }
      } else if (value1 !== value2) {
        return false;
      }
    }

    return true;
  }

  private async updateQd(dataToUpdate: QueryData[]): Promise<void> {
    Promise.all(
      dataToUpdate.map(async (updateQd: QueryData) => {
        try {
          const savedQd: QueryData = await querydataController.findById(
            updateQd._id || ""
          );

          if (
            savedQd.queryConfig !== undefined &&
            savedQd._id !== undefined &&
            updateQd.queryConfig !== undefined &&
            !this.isEqualQueryConfig(savedQd?.queryConfig, updateQd.queryConfig)
          ) {
            await querydataController.updateOneById(savedQd._id, {
              _id: updateQd._id,
              queryConfig: updateQd.queryConfig,
              data: [],
              dataLabels: [],
            });
          }
        } catch (error) {
          console.log(error);
        }
      })
    );
  }

  private getQdToAddAndUpdate(dashboard: Dashboard) {
    const dataToUpdate: QueryData[] = [];
    const dataToAdd: QueryData[] = [];
    if (dashboard.widgets) {
      dashboard.widgets.forEach((widget, widgetIndex) => {
        if (widget.panels) {
          widget.panels.forEach((panel, panelIndex) => {
            if (panel.tabs) {
              panel.tabs.forEach((tab, tabIndex) => {
                if (
                  tab.fiwareService &&
                  tab.fiwareType &&
                  tab.entityId &&
                  tab.attribute &&
                  tab.attribute.keys &&
                  tab.attribute.aliases &&
                  tab.apexType &&
                  tab.type
                ) {
                  let queryData: QueryData = {
                    _id: tab.id || undefined,
                    parents: [widgetIndex, panelIndex, tabIndex],
                    queryConfig: {
                      type: tab.type,
                      componentType: tab.componentType,
                      componentDataType: tab.componentDataType,
                      fiwareService: tab.fiwareService,
                      fiwareType: tab.fiwareType,
                      entityId: tab.entityId,
                      filterProperty: tab.filterProperty || "",
                      filterValues: tab.filterValues || [],
                      filterAttribute: tab.filterAttribute || "",
                      attribute: {
                        keys: tab.attribute.keys,
                        aliases: tab.attribute.aliases,
                      },
                      aggrMode: tab.aggrMode || "single",
                      apexType: tab.apexType,
                      apexMaxValue: tab.apexMaxValue || undefined,
                      apexMaxAlias: tab.apexMaxAlias || undefined,
                      intervalInMinutes: this.getIntervalFromTimeframe(
                        tab.timeframe || -1
                      ),
                    },
                  };
                  if (tab.queryData && tab.queryData._id) {
                    queryData = { ...tab.queryData };
                    dataToUpdate.push(queryData);
                  } else {
                    dataToAdd.push(queryData);
                  }
                } else if (tab.componentType) {
                  let queryData: QueryData = {
                    parents: [widgetIndex, panelIndex, tabIndex],
                    queryConfig: {
                      type: tab.type,
                      componentType: tab.componentType,
                      componentDataType: tab.componentDataType,
                      fiwareService: tab.fiwareService,
                      fiwareType: tab.fiwareType,
                      entityId: tab.entityId,
                      attribute: {
                        keys: tab.attribute!!.keys,
                        aliases: tab.attribute!!.aliases,
                      },
                      componentOptions: tab.componentOptions,
                      intervalInMinutes: this.getIntervalFromTimeframe(
                        tab.timeframe || -1
                      ),
                    },
                  };
                  if (tab.queryData && tab.queryData._id) {
                    queryData = { ...tab.queryData };
                    dataToUpdate.push(queryData);
                  } else {
                    dataToAdd.push(queryData);
                  }
                }
              });
            }
          });
        }
      });
    }
    return { dataToAdd, dataToUpdate };
  }

  private getIntervalFromTimeframe(timeframe: number): number {
    switch (timeframe) {
      case 5:
        return 5;
      case 30:
        return 30;
      case 90:
        return 900;
      default:
        return 120;
    }
  }

  private async addQueries(
    dashboard: Dashboard,
    dataToAdd: QueryData[]
  ): Promise<void> {
    if (dataToAdd.length === 0) {
      return;
    }

    try {
      const insertedQD = await querydataController.insertMany(dataToAdd);
      const newDashboard = this.getDashboardStructureWithQueryDataIds(
        dashboard,
        dataToAdd,
        insertedQD
      );
      await dashboardController.updateOneById(
        newDashboard._id || "",
        newDashboard
      );
    } catch (error) {
      console.log(error);
    }
  }

  private getDashboardStructureWithQueryDataIds(
    dashboard: Dashboard,
    dataToAdd: QueryData[] | any,
    addedQueryObjects: QueryData[]
  ): Dashboard {
    for (let i = 0; i < dataToAdd.length; i++) {
      const { parents } = dataToAdd[i];
      if (dashboard.widgets && parents.length === 3) {
        const [widgetIndex, panelIndex, tabIndex] = parents;
        if (
          dashboard.widgets[widgetIndex] &&
          dashboard.widgets[widgetIndex].panels[panelIndex] &&
          dashboard.widgets[widgetIndex].panels[panelIndex].tabs[tabIndex]
        ) {
          dashboard.widgets[widgetIndex].panels[panelIndex].tabs[
            tabIndex
          ].queryData = {
            _id: addedQueryObjects[i]._id,
          };
        }
      }
    }
    return dashboard;
  }

  private async checkForDeletionOfQueryDataIds(): Promise<void> {
    try {
      const dashboards = await dashboardController.findAll();
      const qdIds = await querydataController.findAllIds();

      const currentQueryDataIds = this.getAllQueryDataIds(dashboards);
      const querydataIdsToDelete = this.getIdsToDelete(
        currentQueryDataIds,
        qdIds
      );

      await querydataController.deleteMany(querydataIdsToDelete);
    } catch (error) {
      console.log(error);
    }
  }

  //returns all elemtents of "allIds", "idsToKeep" does not contain
  private getIdsToDelete(idsToKeep: string[], allIds: string[]): string[] {
    return allIds.filter((id: string) => !idsToKeep.includes(id));
  }

  private getAllQueryDataIds(dashboards: Dashboard[]): string[] {
    const queryDataIds: string[] = [];
    for (const dashboard of dashboards) {
      if (dashboard.widgets) {
        for (const widget of dashboard.widgets) {
          if (widget.panels) {
            for (const panel of widget.panels) {
              if (panel.tabs) {
                for (const tab of panel.tabs) {
                  if (tab.queryData && tab.queryData._id) {
                    queryDataIds.push(tab.queryData._id.toString());
                  }
                }
              }
            }
          }
        }
      }
    }
    return queryDataIds;
  }
}

export default new UserController();
