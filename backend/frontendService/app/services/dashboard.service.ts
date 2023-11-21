import _ from "lodash";
import dashboardController from "../controllers/dashboard.controller";
import querydataController from "../controllers/querydata.controller";
import {
  Dashboard,
  DashboardModel,
  Tab,
  TabModel,
  Widget,
} from "../models/dashboard.model";
import { QueryData } from "../models/querydata.model";

class DashboardService {
  public async getDashboardData(
    dashboardUrl: string,
    isAdmin: boolean | string
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      await this.fetchAllDashboardsFromDb(dashboardUrl, isAdmin).catch(
        (err: Error) => {
          console.log(err.message);
          return reject(500);
        }
      );
      resolve();
    });
  }

  public async createDashboard(dashboard: Dashboard): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (this.dashboardDataConfigIsValid(dashboard)) {
        await this.addDashboard(dashboard).catch((err: Error) => {
          console.log(err.message);
          return reject(500);
        });
        resolve();
      } else {
        console.log("Invalid dashboard config detected!");
        return reject(422);
      }
    });
  }

  public async updateDashboard(dashboard: Dashboard): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (this.dashboardDataConfigIsValid(dashboard)) {
        await this.executeUpdateDashboard(dashboard).catch((err: string) => {
          if (err === "UPDATE: Dashboard not found") {
            return reject(404);
          }
          console.log(err);
          return reject(err);
        });
        resolve();
      } else {
        console.log("Invalid dashboard config detected!");
        reject(422);
      }
    });
  }

  public async deleteDashboard(id: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      await this.deleteDashboardInDb(id).catch((err: string) => {
        if (err === "DELETE: Dashboard not found") {
          return reject(404);
        }
        return reject(500);
      });
      resolve();
    });
  }

  // helpers
  private fetchAllDashboardsFromDb(
    dashboardUrl: string,
    isAdmin: boolean | string
  ): Promise<Dashboard[] | void> {
    return new Promise((resolve, reject) => {
      DashboardModel.find({}, async (err: Error, dashboards: Dashboard[]) => {
        if (err) {
          return reject(err);
        }
        let dashboardsResponse = await this.getDashboardsResponseContent(
          dashboards,
          isAdmin,
          dashboardUrl
        ).catch((e: Error) => {
          console.log(e);
          return reject(e);
        });
        resolve(dashboardsResponse);
      }).sort({ index: 1 });
    });
  }

  private addDashboard(dashbaord: Dashboard): Promise<Dashboard[] | void> {
    return new Promise(async (resolve, reject) => {
      await this.addDashboardIntoDb(dashbaord, null).catch((err: Error) => {
        console.log(err);
        reject(err);
      });
      let dashboards = await dashboardController
        .findAll()
        .catch((err: Error) => {
          return reject(err);
        });
      resolve(dashboards);
    });
  }

  private executeUpdateDashboard(
    dashboard: Dashboard
  ): Promise<Dashboard | void> {
    return new Promise(async (resolve, reject) => {
      await this.updateDashboardInDb(dashboard, null).catch((err: Error) => {
        console.log(err);
        return reject(err);
      });
      resolve(dashboard);
    });
  }

  private deleteDashboardInDb(id: string) {
    return dashboardController.deleteOneById(id, null);
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
  private getDashboardsResponseContent(
    dashboards: Dashboard[],
    isAdmin: boolean | string,
    dashboardUrl: string | undefined
  ): Promise<Dashboard[]> {
    isAdmin =
      typeof isAdmin !== "undefined" && isAdmin === "true" ? true : false;
    if (isAdmin === false) dashboards = this.getVisibleDashboards(dashboards);
    if (!dashboardUrl) dashboardUrl = this.getFirstDashboardUrl(dashboards);

    let filteredDashboards;
    filteredDashboards = dashboards.map((currDashboard) => {
      const selectedDashboard = currDashboard.url === dashboardUrl;
      return this.getDashboardInformationToSend(
        currDashboard,
        selectedDashboard,
        isAdmin
      );
    });
    return this.fillApexDataWithQd(filteredDashboards);
  }

  private getDashboardInformationToSend(
    dashboard: Dashboard,
    withWidgets: boolean | string,
    withVisible: boolean | string
  ): Dashboard {
    let dashboardInformation: Dashboard = {
      _id: dashboard._id,
      name: dashboard.name,
      url: dashboard.url,
      icon: dashboard.icon,
      widgets: dashboard.widgets,
      visible: dashboard.visible,
    };
    if (withWidgets) {
      dashboardInformation = {
        ...dashboardInformation,
        widgets: dashboard.widgets,
      };
    }
    if (withVisible) {
      dashboardInformation = {
        ...dashboardInformation,
        visible: dashboard.visible,
      };
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
                      const tabs = await Promise.all(
                        panel.tabs.map(async (tab) => {
                          const dbTab = await TabModel.findById(tab.id)
                            .clone()
                            .catch((e: any) => console.log(e));
                          if (dbTab) {
                            if (dbTab.queryData && dbTab.queryData._id) {
                              const queryData = await querydataController
                                .findById(dbTab.queryData._id)
                                .catch((e: any) => console.log(e));
                              tab = this.mapTab(tab, dbTab, queryData);
                            }
                          }
                          return tab;
                        })
                      );
                      panel.tabs = tabs;
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

  private mapTab(tab: Tab, dbTab: Tab, queryData: QueryData | void): Tab {
    tab.type = dbTab.type;
    tab.name = dbTab.name;
    tab.apexType = dbTab.apexType;
    tab.text = dbTab.text;
    tab.apexMaxValue = dbTab.apexMaxValue;
    tab.apexMaxAlias = dbTab.apexMaxAlias;
    tab.apexMaxColor = dbTab.apexMaxColor;
    tab.apexSeries = dbTab.apexSeries;
    tab.donutToTotalLabel = dbTab.donutToTotalLabel;
    tab.timeframe = dbTab.timeframe;
    tab.attribute = dbTab.attribute;
    tab.decimals = dbTab.decimals;
    tab.aggrMode = dbTab.aggrMode;
    if (dbTab.type === "chart") {
      if (
        queryData &&
        queryData.queryConfig &&
        queryData.queryConfig.apexType &&
        queryData.data &&
        queryData.dataLabels
      ) {
        tab.apexSeries = queryData.data;
        if (queryData.queryConfig.apexType === "donut") {
          _.set(tab, "apexOptions.labels", queryData.dataLabels);
        } else if (
          queryData.queryConfig.apexType === "line" ||
          queryData.queryConfig.apexType === "bar"
        ) {
          _.set(tab, "apexOptions.xaxis.categories", queryData.dataLabels);
          _.set(tab, "apexOptions.xaxis.type", "category");
          _.set(tab, "apexOptions.xaxis.tickAmount", undefined);
          _.set(tab, "apexOptions.xaxis.labels.rotate", 0);
        } else {
          console.log(
            "Can't set chart labels for unkown chart type, please have a look at user.controller.js"
          );
        }
        if (typeof queryData.updateMsg !== "undefined") {
          _.set(tab, "queryUpdateMsg", queryData.updateMsg);
        }
      } else {
        console.log(
          "Querydata not found by id, please have a look at user.controller.js"
        );
      }
    } else if (tab.type === "value") {
      if (queryData && queryData.queryConfig && queryData.data) {
        tab.values = queryData.data;
      }
    }

    return tab;
  }

  /**
   * update specified dashboard (id) with content of dashboard
   * @param {dashboard to update + dashboardcontent} dashboard
   */
  private updateDashboardInDb(
    dashboard: Dashboard,
    saveStatus: any
  ): Promise<void> {
    dashboard.widgets = this.omitEmptyIds(dashboard.widgets);
    return dashboardController.updateOneAsync(
      dashboard._id,
      dashboard,
      dashboard.roles,
      saveStatus
    );
  }

  /**
   * add dashbaord to database
   * @param {dashboard to add} dashboard
   */
  private addDashboardIntoDb(
    dashboard: Dashboard,
    saveStatus: any
  ): Promise<Dashboard> {
    if (dashboard.widgets) {
      dashboard.widgets = this.omitEmptyIds(dashboard.widgets);
    }
    console.log("befor omit");
    console.log(dashboard);
    dashboard = _.omit(dashboard, ["_id"]);
    console.log("after omit");
    console.log(dashboard);
    return dashboardController.addOne(dashboard, saveStatus);
  }

  /**
   * omit empty _ids from widgets, panels & tabs
   */
  private omitEmptyIds(widgets: Widget[] | undefined) {
    if (widgets) {
      widgets = widgets.map((widget) => {
        widget.panels = widget.panels.map((panel) => {
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
      return widgets;
    }
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
        dashboard.widgets.forEach((widget) => {
          if (widget.panels) {
            widget.panels.forEach((panel) => {
              if (panel.tabs) {
                panel.tabs.forEach((tab) => {
                  if (tab.id) {
                    if (!this.isValidDataConfigString(tab.id)) {
                      valid = false;
                    }
                  }
                });
              }
            });
          }
        });
      }
      return valid;
    } catch (error) {
      console.log("Error checking data config validity:");
      console.log(error);
      return false;
    }
  }

  private async addQueries(
    dashboard: Dashboard,
    dataToAdd: any
  ): Promise<void> {
    if (dataToAdd.length <= 0) return new Promise((resolve) => resolve());
    const insertedQD = await querydataController
      .insertMany(dataToAdd)
      .catch((e: Error) => console.log(e));
    let newDashboard: Dashboard = this.getDashboardStructureWithQueryDataIds(
      dashboard,
      dataToAdd,
      insertedQD
    );

    if (newDashboard._id !== undefined) {
      return await dashboardController
        .updateOneById(newDashboard._id, newDashboard)
        .catch((e) => console.log(e));
    }
  }

  private getDashboardStructureWithQueryDataIds(
    dashboard: Dashboard,
    dataToAdd: any,
    addedQueryObjects: any
  ): Dashboard {
    for (let i = 0; i < dataToAdd.length; i++) {
      const [widgetIndex, panelIndex, tabIndex] = dataToAdd[i].parents;

      if (dashboard.widgets !== undefined) {
        dashboard.widgets[widgetIndex].panels[panelIndex].tabs[
          tabIndex
        ].queryData = { _id: addedQueryObjects[i]._id };
      }
    }
    return dashboard;
  }

  private async checkForDeletionOfQueryDataIds() {
    const dashboards: Dashboard[] = await dashboardController
      .findAll()
      .catch((e) => {
        console.log(e);
        return []; // Provide a fallback value in case of an error to ensure the correct type
      });
    let qdIds = await querydataController
      .findAllIds()
      .catch((e: Error) => console.log(e));

    if (qdIds) {
      qdIds = qdIds.map((idObject: any) => idObject._id.toString());
      const currentQueryDataIds = this.getAllQueryDataIds(dashboards);
      const querydataIdsToDelete = this.getIdsToDelete(
        currentQueryDataIds,
        qdIds
      );
      return querydataController
        .deleteMany(querydataIdsToDelete)
        .catch((e: Error) => console.log(e));
    }
  }

  //returns all elemtents of "allIds", "idsToKeep" does not contain
  private getIdsToDelete(idsToKeep: string[], allIds: string[]): string[] {
    return allIds.filter((id: string) => !idsToKeep.includes(id));
  }

  private getAllQueryDataIds(dashboards: Dashboard[]): string[] {
    let queryDataIds: string[] = [];
    dashboards.forEach((dashboard) => {
      if (dashboard.widgets) {
        dashboard.widgets.forEach((widget) => {
          if (widget.panels) {
            widget.panels.forEach((panel) => {
              if (panel.tabs) {
                panel.tabs.forEach((tab) => {
                  if (tab.queryData) {
                    if (tab.queryData._id) {
                      queryDataIds.push(tab.queryData._id.toString());
                    }
                  }
                });
              }
            });
          }
        });
      }
    });
    return queryDataIds;
  }

  private getVisibleDashboards(dashboards: Dashboard[]): Dashboard[] {
    return dashboards.filter(
      (dashboard: Dashboard) => dashboard.visible === true
    );
  }

  // function to retrieve the queryDataIds of a dashbaord
  public getQueryDataIds(dashboard: Dashboard): string[] {
    const queryDataIds: string[] = [];

    // Iterate through the dashboard's widgets, panels, and tabs to collect queryData IDs
    dashboard.widgets!!.forEach((widget) => {
      widget.panels.forEach((panel) => {
        panel.tabs.forEach((tab) => {
          if (tab.queryData?._id) {
            // for each tab, push the queryData_id to the array to be returned
            queryDataIds.push(tab.queryData._id.toString());
          }
        });
      });
    });

    return queryDataIds;
  }

  // boolean function to compare the queryDataIds of original & updated dashboards
  public hasQueryDataBeenRemoved(
    originalDashboard: Dashboard,
    updatedDashboard: Dashboard
  ): boolean {
    const originalQueryDataIds = this.getQueryDataIds(originalDashboard);
    const updatedQueryDataIds = this.getQueryDataIds(updatedDashboard);

    // Check if at least one of the original queryData IDs are missing in the updated dashboard
    return originalQueryDataIds.some((id) => !updatedQueryDataIds.includes(id));
  }

  // get function to retrieve an array of QDIds which have been removed from the dashboard
  public getDeletedQueryDataIds(
    originalDashboard: Dashboard,
    updatedDashboard: Dashboard
  ): string[] {
    const originalQueryDataIds = this.getQueryDataIds(originalDashboard);
    const updatedQueryDataIds = this.getQueryDataIds(updatedDashboard);

    // filter originalQueryDataIds by IDS that are NOT included in updatedQueryDataIds
    // this will give us a list of the deleted IDs
    const deletedQueryDataIds = originalQueryDataIds.filter(
      (id) => !updatedQueryDataIds.includes(id)
    );

    return deletedQueryDataIds;
  }

  // boolean function to check if an updated dashboard has changed queryData
  public hasQueryDataBeenUpdated(
    originalDashboard: Dashboard,
    updatedDashboard: Dashboard
  ): boolean {
    const originalDashboardTabs = originalDashboard.widgets!!.flatMap(
      (widget) => widget.panels.flatMap((panel) => panel.tabs)
    );

    const updatedDashboardTabs = updatedDashboard.widgets!!.flatMap((widget) =>
      widget.panels.flatMap((panel) => panel.tabs)
    );

    // compare the JSON objects of the two dashboards, if they are the same return false
    if (
      JSON.stringify(originalDashboardTabs) ===
      JSON.stringify(updatedDashboardTabs)
    ) {
      return false;
    }
    // return true if the tab objects differ
    return true;
  }

  // function which updates the records of QueryData collection when QD has been edited in the Dashboard
  public updateQueryDataInDb(dashboard: Dashboard) {
    // NOTE: QueryData fields are stored in the Dashboard under in the Tab object... NOT the Tab.queryData object
    // get array of Dashboard Tabs (which are QueryData objects)
    const dashboardTabs = dashboard.widgets!!.flatMap((widget) =>
      widget.panels.flatMap((panel) => panel.tabs)
    );

    dashboardTabs.forEach(async (dashboardTab) => {
      // in the dashboard collection, the queryDataId is the only thing stored under Tab.queryData
      const queryDataId = dashboardTab.queryData?._id;

      if (queryDataId) {
        // Partial because all fields of Dashboard.Tab might not match QueryData fields
        // new QueryData object where the queryConfig (or dataConnection fields) are assigned to the updated dashboardTab values
        const updateQueryData: Partial<QueryData> = {
          queryConfig: dashboardTab,
        };
        updateQueryData.queryConfig!.intervalInMinutes =
          this.getIntervalFromTimeframe(dashboardTab.timeframe!);

        try {
          // update the QueryData collection
          await querydataController.updateOneById(queryDataId, updateQueryData);
          console.log("QueryData updated with ID: ", queryDataId);
        } catch (error) {
          // Handle the error as needed
          console.error("Error updating QueryData with id: ", queryDataId);
          throw error;
        }
      }
    });
  }

  //HOTFIX
  private getIntervalFromTimeframe(timeframe: number): number {
    switch (timeframe) {
      case 5:
        return 5;
      case 30:
        return 30;
      case 90:
        return 90;
      default:
        return 120;
    }
  }
}

export default new DashboardService();
