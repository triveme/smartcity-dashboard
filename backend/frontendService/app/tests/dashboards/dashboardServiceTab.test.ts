var rewire = require("rewire");
const DBManager = require("../testUtils/db.util");
const dashboardService = require("../../services/dashboard.service");
const tabService = require("../../services/tab.service");
const db = require("../../models/");
const { reject } = require("lodash");
const Dashboard = db.dashboard;
const Tab = db.tab;
const Querydata = db.querydata;
const dbman = new DBManager();

afterAll(() => dbman.stop());
beforeAll(() => dbman.start());
afterEach(() => dbman.cleanup());
beforeEach(() => {
  this.dashboardData = getDashboardData();
  this.tabData = getTabData();
});

describe("Dashboard fetching with tabs", () => {
  it("fetches dashboards with their bar chart data", async () => {
    let tab = await createTab(this.tabData);

    this.dashboardData.widgets[0].panels[0].tabs.push({
      id: tab._id.toString(),
    });

    let dashboard = new Dashboard(this.dashboardData);
    dashboard = await dashboard.save();
    let dashboards = await dashboardService.getDashboardData();

    expect(dashboards.length).toBe(1);
    expect(dashboards[0].widgets[0].panels[0].tabs.length).toBe(1);
    expect(dashboards[0].widgets[0].panels[0].tabs[0].id).toEqual(
      tab._id.toString()
    );
    expectLineAndBarTabs(dashboards[0].widgets[0].panels[0].tabs[0], tab);
  });

  it("fetches dashboards with their line chart data", async () => {
    this.tabData.apexType = "line";
    let tab = await createTab(this.tabData);

    this.dashboardData.widgets[0].panels[0].tabs.push({
      id: tab._id.toString(),
    });

    let dashboard = new Dashboard(this.dashboardData);
    dashboard = await dashboard.save();
    let dashboards = await dashboardService.getDashboardData();

    expect(dashboards.length).toBe(1);
    expect(dashboards[0].widgets[0].panels[0].tabs.length).toBe(1);
    expect(dashboards[0].widgets[0].panels[0].tabs[0].id).toEqual(
      tab._id.toString()
    );
    expectLineAndBarTabs(dashboards[0].widgets[0].panels[0].tabs[0], tab);
  });

  it("fetches dashboards with their donut chart data", async () => {
    this.tabData.apexType = "donut";
    let tab = await createTab(this.tabData);

    this.dashboardData.widgets[0].panels[0].tabs.push({
      id: tab._id.toString(),
    });

    let dashboard = new Dashboard(this.dashboardData);
    dashboard = await dashboard.save();
    let dashboards = await dashboardService.getDashboardData();
    console.log(dashboards[0].widgets[0].panels[0].tabs);

    expect(dashboards.length).toBe(1);
    expect(dashboards[0].widgets[0].panels[0].tabs.length).toBe(1);
    expect(dashboards[0].widgets[0].panels[0].tabs[0].id).toEqual(
      tab._id.toString()
    );
    expectTabBasic(dashboards[0].widgets[0].panels[0].tabs[0], tab);
    expect(
      dashboards[0].widgets[0].panels[0].tabs[0].apexOptions.labels
    ).toEqual([]);
  });
});

// Currently broken, don't know why
// it("fetches dashboards with their values data", async () => {
//   this.tabData.type = "value";
//   let tab = await createTab(this.tabData);
//   let dbTab = await Tab.findById(tab._id);
//   let queryData = await Querydata.findById(dbTab.querydata.id);

//   this.dashboardData.widgets[0].panels[0].tabs.push({
//     id: tab._id.toString(),
//   });

//   let dashboard = new Dashboard(this.dashboardData);
//   dashboard = await dashboard.save();
//   let dashboards = await dashboardService.getDashboardData();

//   expect(dashboards.length).toBe(1);
//   expect(dashboards[0].widgets[0].panels[0].tabs.length).toBe(1);
//   expect(dashboards[0].widgets[0].panels[0].tabs[0].id).toEqual(
//     tab._id.toString()
//   );
//   expectTabBasic(dashboards[0].widgets[0].panels[0].tabs[0], tab);
//   expect(dashboards[0].widgets[0].panels[0].tabs[0].values).toEqual(queryData);
// });

function expectTabBasic(actualTab, expectedTab) {
  expect(actualTab.name).toEqual(expectedTab.name);
  expect(actualTab.type).toEqual(expectedTab.type);
  expect(actualTab.text).toEqual(expectedTab.text);
}

function expectLineAndBarTabs(actualTab, expectedTab) {
  expectTabBasic(actualTab, expectedTab);
  expect(actualTab.apexType).toEqual(expectedTab.apexType);
  expect(actualTab.apexOptions.xaxis.categories).toEqual([]);
  expect(actualTab.apexOptions.xaxis.type).toEqual("category");
  expect(actualTab.apexOptions.xaxis.tickAmount).toEqual(undefined);
  expect(actualTab.apexOptions.xaxis.labels.rotate).toEqual(0);
}

async function createTab(tabData) {
  return await tabService.saveNewTabQueryDataComboToDb(tabData);
}

function getDashboardData() {
  return {
    name: "Test Dashboard",
    url: "test-dashboard",
    icon: "dashboard",
    visible: true,
    widgets: [
      {
        name: "Klima",
        panels: [
          {
            name: "Temperatur",
            width: 6,
            height: 300,
            tabs: [],
          },
        ],
      },
    ],
  };
}

function getTabData() {
  return {
    name: "TestTab",
    type: "chart",
    text: "",
    apexType: "bar",
    apexOptions: {
      grid: {
        borderColor: "#2f3a4e",
      },
      yaxis: {
        forceNiceScale: true,
        title: {
          text: "Anzahl der Besucher",
        },
      },
      dataLabels: {
        enabled: false,
      },
      fill: {
        opacity: 1,
      },
      chart: {
        toolbar: {
          show: false,
        },
        background: "#152437",
      },
      theme: {
        mode: "dark",
        palette: "palette4",
      },
      colors: ["#0587bb", "#ff9f00"],
      legend: {
        position: "top",
        markers: {
          radius: 5,
        },
      },
      xaxis: {
        convertedCatToNumeric: false,
        type: "category",
        categories: [
          "24.01.",
          "25.01.",
          "26.01.",
          "27.01.",
          "28.01.",
          "29.01.",
          "30.01.",
        ],
        labels: {
          rotate: 0,
        },
        tickAmount: 13,
      },
    },
    apexSeries: [
      {
        name: "Besucher",
        data: [51, 62, 63, 74, 65, 86, 97],
      },
    ],
    apexMaxValue: 100,
    apexMaxAlias: "Maximale Besucher",
    apexMaxColor: "#04beaf",
    timeframe: 0,
    fiwareService: "akasjdlsd",
    entityId: ["skdjalsdj"],
    attribute: {
      keys: ["Besucher"],
      aliases: ["Besucher"],
    },
    values: [],
    decimals: 0,
    aggrMode: "single",
  };
}
