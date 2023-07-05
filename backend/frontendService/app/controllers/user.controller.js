const db = require("../models/");
const Dashboard = db.dashboard;
const _ = require("lodash");
const qdController = require("./querydata.controller");
const dashbController = require("./dashboard.controller");
const queryConfigIsEqual = require("./querydata.js/queryConfigEquality");
let status = [];

/**
 * add, update, delete dashboards
 * @param {request} req
 * @param {response} res
 */
exports.postDashboards = (req, res) => {
  console.log(`incoming ${req.method}-request on ${req.url}`);
  createUpdateDelete(req, res, updateStatus);
};

const createUpdateDelete = async (req, res, fun) => {
  console.log(`incoming ${req.method}-request on ${req.url}`);
  status = [];
  await Promise.all(
    req.body.map(async (dashboard) => {
      if (dashboard._id) {
        if (Object.keys(dashboard).length === 1) {
          await dashbController.deleteOneById(dashboard._id, fun).catch((e) => {
            console.log(e);
          });
        } else {
          if (dashboardDataConfigIsValid(dashboard)) {
            await updateDashboard(dashboard, fun)
              .catch((e) => {
                console.log(e);
              })
              .then(await addAndUpdateQd(dashboard));
          } else {
            console.log("Illegal data config detected, aborting.");
          }
        }
      } else {
        if (dashboardDataConfigIsValid(dashboard)) {
          await addDashboard(dashboard, fun)
            .catch((e) => {
              console.log(e);
            })
            .then(async (result) => await addAndUpdateQd(result));
        } else {
          console.log("Illegal data config detected, aborting.");
        }
      }
    })
  );
  const statusDeletedQD = await checkForDeletionOfQueryDataIds();
  console.log(statusDeletedQD);
  sendDashboards("", "true", res);
  console.log(status);
};

function updateStatus(newStatus) {
  status.push(newStatus);
}

/**
 * send whole dashboard data of requested dashboard
 * + name, url, icon of other dashboards
 * @param {request} req
 * @param {response} res
 */
exports.getDashboards = (req, res) => {
  sendDashboards(req.params.url, req.get("Is-Admin"), res);
};

/**
 * send response with dashboards
 * and detailed structure from specified dashboard
 * @param {url of dashboard to show} dashboardUrl
 * @param {response} res
 */
function sendDashboards(dashboardUrl, isAdmin, res) {
  Dashboard.find({}, (err, dashboards) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }
    if (!dashboards) {
      res.status(404).send({ message: "No Dashboards found" });
      return;
    }
    getDashboardsResponseContent(dashboards, isAdmin, dashboardUrl).then(
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
                    await Promise.all(
                      panel.tabs.map(async (tab) => {
                        if (tab.queryData) {
                          if (tab.queryData.id) {
                            await qdController
                              .findById(tab.queryData.id)
                              .catch((e) => console.log(e))
                              .then((result) => {
                                if (tab.type === "chart") {
                                  if (
                                    result &&
                                    result.queryConfig &&
                                    result.queryConfig.apexType &&
                                    result.data &&
                                    result.dataLabels
                                  ) {
                                    tab.apexSeries = result.data;
                                    if (
                                      result.queryConfig.apexType === "donut"
                                    ) {
                                      _.set(
                                        tab,
                                        "apexOptions.labels",
                                        result.dataLabels
                                      );
                                    } else if (
                                      result.queryConfig.apexType === "line" ||
                                      result.queryConfig.apexType === "bar"
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
                                        "Can't set chart labels for unkown chart type, please have a look at user.controller.js"
                                      );
                                    }
                                    if (
                                      typeof result.updateMsg !== "undefined"
                                    ) {
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
                                  if (tab.componentType === "utilization") {
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
                              });
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
  return new Promise((resolve) => {
    resolve(dashboards);
  });
}

/**
 * update specified dashboard (id) with content of dashboard
 * @param {dashboard to update + dashboardcontent} dashboard
 */
function updateDashboard(dashboard, saveStatus) {
  dashboard.widgets = omitEmptyIds(dashboard.widgets);
  return dashbController.updateOneAsync(dashboard._id, dashboard, saveStatus);
}

/**
 * add dashbaord to database
 * @param {dashboard to add} dashboard
 */
function addDashboard(dashboard, saveStatus) {
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
    if (dashboard.widgets && dashboard.panels && dashboard.tabs) {
      dashboard.widgets.forEach((widget) => {
        widget.panels.forEach((panel) => {
          panel.tabs.forEach((tab) => {
            if (tab.fiwareService) {
              if (!isValidDataConfigString(tab.fiwareService)) {
                valid = false;
              }
            }
            if (tab.entityId) {
              tab.entityId.forEach((eId) => {
                if (!isValidDataConfigString(eId)) {
                  valid = false;
                }
              });
            }
            if (tab.attribute && tab.attribute.keys) {
              tab.attribute.keys.forEach((key) => {
                if (!isValidDataConfigString(key)) {
                  valid = false;
                }
              });
            }
          });
        });
      });
    }
    return valid;
  } catch (error) {
    console.log("Error checking data config validity:");
    console.log(error);
    return false;
  }
}

async function addAndUpdateQd(dashboard) {
  const { dataToAdd, dataToUpdate } = getQdToAddAndUpdate(dashboard);
  await Promise.all([addQueries(dashboard, dataToAdd), updateQd(dataToUpdate)]);
  return new Promise((resolve) => resolve());
}

async function updateQd(dataToUpdate) {
  return Promise.all(
    dataToUpdate.map(async (updateQd) => {
      const savedQd = await qdController
        .findById(updateQd.queryData.id)
        .catch((e) => console.log(e));
      if (
        !queryConfigIsEqual.isEqual(savedQd.queryConfig, updateQd.queryConfig)
      ) {
        console.log(updateQd.queryConfig);
        await qdController
          .updateOneById(savedQd._id, {
            queryConfig: updateQd.queryConfig,
            data: [],
            dataLabels: [],
          })
          .catch((e) => {
            console.log(e);
          });
      }
    })
  );
}

function getQdToAddAndUpdate(dashboard) {
  let dataToUpdate = [];
  let dataToAdd = [];
  if (dashboard.widgets) {
    dashboard.widgets.forEach((widget, widgetIndex) => {
      if (widget.panels) {
        widget.panels.forEach((panel, panelIndex) => {
          if (panel.tabs) {
            panel.tabs.forEach((tab, tabIndex) => {
              if (
                tab.fiwareService &&
                tab.entityId &&
                tab.attribute &&
                tab.attribute.keys &&
                tab.attribute.aliases &&
                tab.apexType &&
                tab.type
              ) {
                let queryData = {
                  parents: [widgetIndex, panelIndex, tabIndex],
                  queryConfig: {
                    type: tab.type,
                    fiwareService: tab.fiwareService,
                    entityId: tab.entityId,
                    filterProperty: tab.filterProperty
                      ? tab.filterProperty
                      : "",
                    filterValues: tab.filterValues ? tab.filterValues : [],
                    filterAttribute: tab.filterAttribute
                      ? tab.filterAttribute
                      : "",
                    attribute: {
                      keys: tab.attribute.keys,
                      aliases: tab.attribute.aliases,
                    },
                    aggrMode: tab.aggrMode ? tab.aggrMode : "single",
                    apexType: tab.apexType,
                    apexMaxValue: tab.apexMaxValue
                      ? tab.apexMaxValue
                      : undefined,
                    apexMaxAlias: tab.apexMaxAlias
                      ? tab.apexMaxAlias
                      : undefined,
                    intervalInMinutes: getIntervalFromTimeframe(tab.timeframe),
                    componentType: tab.componentType
                      ? tab.componentType
                      : undefined,
                    componentDataType: tab.componentDataType
                      ? tab.componentDataType
                      : undefined,
                  },
                };
                if (tab.queryData) {
                  if (tab.queryData.id) {
                    queryData = { ...queryData, queryData: tab.queryData };
                    dataToUpdate.push(queryData);
                  } else {
                    dataToAdd.push(queryData);
                  }
                } else {
                  dataToAdd.push(queryData);
                }
              } else if (tab.componentType) {
                let queryData = {
                  parents: [widgetIndex, panelIndex, tabIndex],
                  queryConfig: {
                    componentType: tab.componentType,
                    componentDataType: tab.componentDataType,
                    intervalInMinutes: getIntervalFromTimeframe(tab.timeframe),
                  },
                };
                if (tab.queryData) {
                  if (tab.queryData.id) {
                    queryData = { ...queryData, queryData: tab.queryData };
                    dataToUpdate.push(queryData);
                  } else {
                    dataToAdd.push(queryData);
                  }
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
