const db = require("../models/");
var Dashboard = db.dashboard;
const _ = require("lodash");
const qdController = require("../controllers/querydata.controller");
const dashbController = require("../controllers/dashboard.controller");
const queryConfigIsEqual = require("../controllers/querydata.js/queryConfigEquality");
const Tab = db.tab;

exports.getDashboardData = (dashboardUrl, isAdmin) => {
  return new Promise(async (resolve, reject) => {
    let dashboards = await fetchAllDashboardsFromDb(
      dashboardUrl,
      isAdmin
    ).catch((err) => {
      console.log(err.message);
      return reject(500);
    });
    resolve(dashboards);
  });
};

exports.createDashboard = async (dashboard) => {
  return new Promise(async (resolve, reject) => {
    if (dashboardDataConfigIsValid(dashboard)) {
      await addDashboard(dashboard).catch((e) => {
        console.log(e.message);
        return reject(500);
      });
      resolve();
    } else {
      console.log("Invalid dashboard config detected!");
      return reject(422);
    }
  });
};

exports.updateDashboard = async (dashboard) => {
  return new Promise(async (resolve, reject) => {
    if (dashboardDataConfigIsValid(dashboard)) {
      await executeUpdateDashboard(dashboard).catch((e) => {
        if (e === "UPDATE: Dashboard not found") {
          return reject(404);
        }
        console.log(e);
        return reject(e);
      });
      resolve();
    } else {
      console.log("Invalid dashboard config detected!");
      reject(422);
    }
  });
};

exports.deleteDashboard = async (id) => {
  return new Promise(async (resolve, reject) => {
    let dashboard = await deleteDashboardInDb(id).catch((err) => {
      if (err == "DELETE: Dashboard not found") {
        return reject(404);
      }
      return reject(500);
    });
    resolve(dashboard);
  });
};

function fetchAllDashboardsFromDb(dashboardUrl, isAdmin) {
  return new Promise((resolve, reject) => {
    Dashboard.find({}, async (err, dashboards) => {
      if (err) {
        return reject(err);
      }
      let dashboardsResponse = await getDashboardsResponseContent(
        dashboards,
        isAdmin,
        dashboardUrl
      ).catch((e) => {
        console.log(e);
        return reject(e);
      });
      resolve(dashboardsResponse);
    }).sort({ index: 1 });
  });
}

function addDashboard(dashboard) {
  return new Promise(async (resolve, reject) => {
    await addDashboardIntoDb(dashboard).catch((e) => {
      console.log(e);
      reject(e);
    });
    let dashboards = await dashbController.findAll().catch((e) => {
      return reject(e);
    });
    resolve(dashboards);
  });
}

function executeUpdateDashboard(dashboard) {
  return new Promise(async (resolve, reject) => {
    await updateDashboardInDb(dashboard).catch((e) => {
      console.log(e);
      return reject(e);
    });
    resolve(dashboard);
  });
}

function deleteDashboardInDb(id) {
  return dashbController.deleteOneById(id);
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
function getDashboardsResponseContent(dashboards, isAdmin, dashboardUrl) {
  isAdmin = typeof isAdmin !== "undefined" && isAdmin === "true" ? true : false;
  if (isAdmin === false) dashboards = getVisibleDashboards(dashboards);
  if (!dashboardUrl) dashboardUrl = getFirstDashboardUrl(dashboards);

  let filteredDashboards;
  filteredDashboards = dashboards.map((currDashboard) => {
    const selectedDashboard = currDashboard.url === dashboardUrl;
    return getDashboardInformationToSend(
      currDashboard,
      selectedDashboard,
      isAdmin
    );
  });
  return fillApexDataWithQd(filteredDashboards);
}

function getDashboardInformationToSend(dashboard, withWidgets, withVisible) {
  let dashboardInformation = {
    _id: dashboard._id,
    name: dashboard.name,
    url: dashboard.url,
    icon: dashboard.icon,
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

function getFirstDashboardUrl(dashboards) {
  if (dashboards.length > 0) {
    return dashboards[0].url;
  } else {
    console.log("dashboards array empty");
  }
}

async function fillApexDataWithQd(dashboards) {
  await Promise.all(
    dashboards.map(async (dashboard) => {
      if (dashboard.widgets) {
        await Promise.all(
          dashboard.widgets.map(async (widget) => {
            if (widget.panels) {
              await Promise.all(
                widget.panels.map(async (panel) => {
                  if (panel.tabs) {
                    let tabs = [];
                    await Promise.all(
                      panel.tabs.map(async (tab) => {
                        const dbTab = await Tab.findById(tab.id)
                          .clone()
                          .catch((e) => console.log(e));
                        if (dbTab) {
                          if (dbTab.queryData && dbTab.queryData.id) {
                            await qdController
                              .findById(dbTab.queryData.id)
                              .catch((e) => console.log(e))
                              .then((queryData) => {
                                tab = mapTab(tab, dbTab, queryData);
                              });
                          }
                        } else {
                          tab = null;
                        }
                        return tab;
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
  return new Promise((resolve) => {
    resolve(dashboards);
  });
}

function mapTab(tab, dbTab, queryData) {
  tab.type = dbTab.type;
  tab.name = dbTab.name;
  tab.apexType = dbTab.apexType;
  tab.text = dbTab.text;
  tab.apexMaxValue = dbTab.apexMaxValue;
  tab.apexMaxAlias = dbTab.apexMaxAlias;
  tab.apexStepline = dbTab.apexStepline;
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
function updateDashboardInDb(dashboard, saveStatus) {
  dashboard.widgets = omitEmptyIds(dashboard.widgets);
  return dashbController.updateOneAsync(dashboard._id, dashboard, saveStatus);
}

/**
 * add dashbaord to database
 * @param {dashboard to add} dashboard
 */
function addDashboardIntoDb(dashboard, saveStatus) {
  if (dashboard.widgets) {
    dashboard.widgets = omitEmptyIds(dashboard.widgets);
  }
  dashboard = _.omit(dashboard, ["_id"]);
  return dashbController.addOne(dashboard, saveStatus);
}

/**
 * omit empty _ids from widgets, panels & tabs
 */
function omitEmptyIds(widgets) {
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
const re = new RegExp("^[A-Za-z0-9:_-]+$");
function isValidDataConfigString(str) {
  return re.test(str);
}

function dashboardDataConfigIsValid(dashboard) {
  try {
    let valid = true;
    if (dashboard.widgets) {
      dashboard.widgets.forEach((widget) => {
        if (widget.panels) {
          widget.panels.forEach((panel) => {
            if (panel.tabs) {
              panel.tabs.forEach((tab) => {
                if (tab.id) {
                  if (!isValidDataConfigString(tab.id)) {
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

function getIntervalFromTimeframe(timeframe) {
  switch (timeframe) {
    case 0:
      return 5;
    case 1:
      return 30;
    case 2:
      return 120;
    default:
      return 120;
  }
}

async function addQueries(dashboard, dataToAdd) {
  if (dataToAdd.length <= 0) return new Promise((resolve) => resolve());
  const insertedQD = await qdController
    .insertMany(dataToAdd)
    .catch((e) => console.log(e));
  let newDashboard = getDashboardStructureWithQueryDataIds(
    dashboard,
    dataToAdd,
    insertedQD
  );
  return await dashbController
    .updateOneById(newDashboard._id, newDashboard)
    .catch((e) => console.log(e));
}

function getDashboardStructureWithQueryDataIds(
  dashboard,
  dataToAdd,
  addedQueryObjects
) {
  for (let i = 0; i < dataToAdd.length; i++) {
    const [widgetIndex, panelIndex, tabIndex] = dataToAdd[i].parents;
    dashboard.widgets[widgetIndex].panels[panelIndex].tabs[tabIndex].queryData =
      { id: addedQueryObjects[i]._id };
  }
  return dashboard;
}

async function checkForDeletionOfQueryDataIds() {
  const dashboards = await dashbController
    .findAll()
    .catch((e) => console.log(e));
  let qdIds = await qdController.findAllIds().catch((e) => console.log(e));
  qdIds = qdIds.map((idObject) => idObject._id.toString());
  const currentQueryDataIds = getAllQueryDataIds(dashboards);
  const querydataIdsToDelete = getIdsToDelete(currentQueryDataIds, qdIds);
  return qdController
    .deleteMany(querydataIdsToDelete)
    .catch((e) => console.log(e));
}

//returns all elemtents of "allIds", "idsToKeep" does not contain
function getIdsToDelete(idsToKeep, allIds) {
  return allIds.filter((id) => !idsToKeep.includes(id));
}

function getAllQueryDataIds(dashboards) {
  let queryDataIds = [];
  dashboards.forEach((dashboard) => {
    if (dashboard.widgets) {
      dashboard.widgets.forEach((widget) => {
        if (widget.panels) {
          widget.panels.forEach((panel) => {
            if (panel.tabs) {
              panel.tabs.forEach((tab) => {
                if (tab.queryData) {
                  if (tab.queryData.id) {
                    queryDataIds.push(tab.queryData.id.toString());
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

function getVisibleDashboards(dashboards) {
  return dashboards.filter((dashboard) => dashboard.visible === true);
}
