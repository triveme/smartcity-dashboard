import { Dashboard, DashboardModel } from "../models/dashboard.model";
import dashboardService from "../services/dashboard.service";
import querydataController from "./querydata.controller";

class DashboardController {
  public async updateOneById(
    dashboardId: string,
    dataToUpdate: Dashboard
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      DashboardModel.updateOne(
        { _id: dashboardId },
        dataToUpdate,
        (err: Error | null, result: { matchedCount: number }) => {
          if (err) {
            reject(err);
            return;
          }
          if (!result?.matchedCount) {
            reject(`UPDATE: Dashboard not found`);
            return;
          }
          console.log(`Dashboard updated with QueryId`);
          resolve();
        }
      );
    });
  }

  public async findAll(): Promise<Dashboard[]> {
    return new Promise((resolve, reject) => {
      DashboardModel.find(
        {},
        (err: Error | null, dashboards: Dashboard[] | null) => {
          if (err) {
            reject(err);
            return;
          }
          if (!dashboards) {
            reject("no dashboards found in collection");
            return;
          }
          resolve(dashboards);
        }
      );
    });
  }

  public async deleteOneById(dashboardId: string, statusCallback: any): Promise<void> {
    try {
      const dashboard: Dashboard | null = await DashboardModel.findById(dashboardId);
      if (!dashboard) {
        statusCallback({
          status: 404,
          message: 'DELETE: Dashboard not found',
        });
        return;
      }

      // before deleting the whole dashboard, we first need to delete the queryData
      // get the list of QD Ids to delete
      const queryDataIdsToDelete = dashboardService.getQueryDataIds(dashboard);

      if(queryDataIdsToDelete){ 
      // Delete QueryData associated with the Dashboard
      console.log("QueryData being deleted: ", queryDataIdsToDelete)
      await querydataController.deleteMany(queryDataIdsToDelete);
      }

      // deletion of the Dashboard
      const result = await DashboardModel.deleteOne({ _id: dashboardId });
      if (result.deletedCount === 0) {
        statusCallback({
          status: 404,
          message: 'DELETE: Dashboard not found',
        });
      } else {
        statusCallback({ status: 200, message: 'Dashboard deleted' });
      }
    } catch (err) {
      statusCallback({ status: 500, message: err });
      throw err;
    }
  }

  public async addOne(
    dashboard: Dashboard,
    statusCallback: any
  ): Promise<Dashboard> {
    return new Promise((resolve, reject) => {
      const dashboardToAdd = new DashboardModel(dashboard);
      dashboardToAdd.save((err: Error | null, savedDashboard: Dashboard) => {
        if (err) {
          statusCallback({ status: 500, message: err });
          reject(err);
          return;
        }
        statusCallback({ status: 200, message: `Dashboard added` });
        resolve(savedDashboard);
      });
    });
  }

  public async updateOneAsync(
    dashboardId: string | undefined,
    dataToUpdate: Dashboard,
    authenticatedRoles: any,
    statusCallback: any
  ): Promise<void> {
    try {
      // find original dashboard
      const dashboard = await DashboardModel.findById(dashboardId);
  
      if (!dashboard) {
        statusCallback({
          status: 404,
          message: `UPDATE: Dashboard not found`,
        });
        throw new Error(`UPDATE: Dashboard not found`);
      }
  
      const writeRoles = dashboard.roles?.write;
      if (
        authenticatedRoles.includes("admin") &&
        writeRoles?.type?.some((role: any) =>
          authenticatedRoles.includes(role)
        )
      ) {
        statusCallback({ status: 403, message: `UPDATE: Not authorized` });
        throw new Error(`UPDATE: Not authorized`);
      }
  
      // Before updating the dashboard:

      // Compare new/old dashboard and check if any qd has been removed-
      if (dashboardService.hasQueryDataBeenRemoved(dashboard, dataToUpdate)) {
        // if so get the IDs of removed queryData
        const removedQueryDataIds = dashboardService.getDeletedQueryDataIds(dashboard, dataToUpdate);
        console.log("QueryData removed: ", removedQueryDataIds)
        // call the deleteMany endpoint with those IDs as the parameter
        await querydataController.deleteMany(removedQueryDataIds);
      }

      // Compare new/old dashboard and check if any qd has been updated-
      if (dashboardService.hasQueryDataBeenUpdated(dashboard, dataToUpdate)) {
        // if so call the function which ultimately leads to an update of QD in the db
        dashboardService.updateQueryDataInDb(dataToUpdate);
      }

      // Updating the dashboard: 
      const result = await DashboardModel.updateOne(
        { _id: dashboardId },
        dataToUpdate
      );
  
      if (!result.matchedCount) {
        statusCallback({
          status: 404,
          message: `UPDATE: Dashboard not found`,
        });
        throw new Error(`UPDATE: Dashboard not found`);
      }
  
      statusCallback({ status: 200, message: `Dashboard updated` });
    } catch (error) {
      console.error(error);
      statusCallback({ status: 500, message: error });
      throw error;
    }
  }
  
}

export default new DashboardController();
