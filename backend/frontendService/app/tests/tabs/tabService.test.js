var rewire = require("rewire");
const db = require("../../models");
const Tab = db.tab;
const DBManager = require("../testUtils/db.util");
const tabService = require("../../services/tab.service");
const dbman = new DBManager();

afterAll(() => dbman.stop());
beforeAll(() => dbman.start());
afterEach(() => dbman.cleanup());
beforeEach(() => (this.tabData = getTabData()));

describe("fetching test", () => {
  it("fetches all tabs", async () => {
    var tab = new Tab(this.tabData);
    var tab = await tab.save();

    var tabArray = await tabService.getAllTabs();

    expect(tabArray).toBeDefined();
    expect(tabArray.length).toEqual(1);
    expect(tabArray[0]._id).toEqual(tab._id);
    expect(tabArray[0].name).toEqual(tab.name);
    expect(tabArray[0].type).toEqual(tab.type);
    expect(tabArray[0].apexType).toEqual(tab.apexType);
    expect(tabArray[0].apexOptions).toEqual(tab.apexOptions);
    expect(tabArray[0].apexSeries).toEqual(tab.apexSeries);
  });

  it("fetches a single tab", async () => {
    var tab = new Tab(this.tabData);
    var tab = await tab.save();

    var tabResponse = await tabService.getTab(tab._id);

    expect(tabResponse).toBeDefined();
    expect(tabResponse.name).toEqual(tab.name);
    expect(tabResponse.type).toEqual(tab.type);
    expect(tabResponse.apexType).toEqual(tab.apexType);
    expect(tabResponse.apexOptions).toEqual(tab.apexOptions);
    expect(tabResponse.apexSeries).toEqual(tab.apexSeries);
  });

  it("fails on not found with 404", async () => {
    var dbTab = new Tab(this.tabData);
    dbTab = await dbTab.save();

    let id = dbTab._id;

    await dbTab.remove();
    expect(tabService.getTab(id)).rejects.toEqual(404);
  });

  it("fetching all fails with 500", async () => {
    const mockTabService = rewire("../../services/tab.service");
    mockTabService.__set__("Tab", {
      find: (obj, cb) => {
        cb("test error");
      },
    });
    expect(async () => await mockTabService.getAllTabs()).rejects.toEqual(500);
  });

  it("fetching one fails with 500", async () => {
    const mockTabService = rewire("../../services/tab.service");

    let tab = new Tab(this.tabData);
    tab = await tab.save();

    mockTabService.__set__("Tab", {
      findById: (obj, cb) => {
        cb("test error");
      },
    });
    expect(async () => await mockTabService.getTab(tab._id)).rejects.toEqual(
      500
    );
  });
});

describe("creation test", () => {
  it("creates a new tab", async () => {
    var tab = await tabService.saveNewTabQueryDataComboToDb(this.tabData);

    expect(tab).toBeDefined();
    expect(tab.name).toEqual(this.tabData.name);
    expect(tab.type).toEqual(this.tabData.type);
    expect(tab.apexType).toEqual(this.tabData.apexType);
    expect(tab.apexOptions).toEqual(this.tabData.apexOptions);
    expect(tab.apexSeries).toEqual(this.tabData.apexSeries);
  });

  it("fails on invalid with 422", async () => {
    this.tabData.fiwareService = "A{-_";

    expect(
      tabService.saveNewTabQueryDataComboToDb(this.tabData)
    ).rejects.toEqual(422);
  });

  it("tab creation fails with 500", async () => {
    const mockTabService = rewire("../../services/tab.service");

    mockTabService.__set__("Tab", {
      save: (cb) => {
        cb("test error");
      },
    });
    expect(
      async () =>
        await mockTabService.saveNewTabQueryDataComboToDb(this.tabData)
    ).rejects.toEqual(500);
  });
});

describe("update test", () => {
  it("update a tab", async () => {
    var dbTab = new Tab(this.tabData);
    dbTab = await dbTab.save();

    this.tabData.name = "Update Test Tab";
    var tab = await tabService.updateTab(dbTab._id, this.tabData);

    expect(tab).toBeDefined();
    expect(tab.name).toEqual("Update Test Tab");
    expect(tab.type).toEqual(dbTab.type);
    expect(tab.apexType).toEqual(dbTab.apexType);
    expect(tab.apexOptions).toEqual(dbTab.apexOptions);
    expect(tab.apexSeries).toEqual(dbTab.apexSeries);
  });

  it("fails on invalid with 422", async () => {
    var dbTab = new Tab(this.tabData);
    dbTab = await dbTab.save();

    this.tabData.fiwareService = "A{-_";

    expect(tabService.updateTab(dbTab._id, this.tabData)).rejects.toEqual(422);
  });

  it("fails on not found with 404", async () => {
    var dbTab = new Tab(this.tabData);
    dbTab = await dbTab.save();

    let id = dbTab._id;

    await dbTab.remove();
    expect(tabService.updateTab(id, this.tabData)).rejects.toEqual(404);
  });
});

describe("deletion test", () => {
  it("delete a tab", async () => {
    var dbTab = new Tab(this.tabData);
    dbTab = await dbTab.save();

    await tabService.deleteTab(dbTab._id);
    expect(tabService.getTab(dbTab._id)).rejects.toEqual(404);
  });

  it("fails on not found with 404", async () => {
    var dbTab = new Tab(this.tabData);
    dbTab = await dbTab.save();

    let id = dbTab._id;

    await dbTab.remove();
    expect(tabService.deleteTab(id)).rejects.toEqual(404);
  });
});

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
