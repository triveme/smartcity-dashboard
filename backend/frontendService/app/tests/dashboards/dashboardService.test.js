var rewire = require("rewire");
const DBManager = require("../testUtils/db.util");
const dashboardService = require("../../services/dashboard.service");
const db = require("../../models/");
const { reject } = require("lodash");
const Dashboard = db.dashboard;
const dbman = new DBManager();

afterAll(() => dbman.stop());
beforeAll(() => dbman.start());
afterEach(() => dbman.cleanup());
beforeEach(() => (this.dashboardData = getDashboardData()));

describe("fetching dashboards", () => {
  it("returns dashboard for user with full information", async () => {
    let dash = new Dashboard(this.dashboardData);
    dash = await dash.save();

    let dashboards = await dashboardService.getDashboardData();

    expect(dashboards.length).toBe(1);
    expectDashboardDeep(true, dashboards[0], dash);
    expect(dashboards[0]).toEqual(
      expect.not.objectContaining({ visible: expect.any(Boolean) })
    );
  });

  it("returns only first dashboard for user with full information if no url is provided", async () => {
    let dash = new Dashboard(this.dashboardData);
    dash = await dash.save();

    this.dashboardData.name = "TestDash2";
    this.dashboardData.url = "test-dashboard-2";
    let dashTwo = new Dashboard(this.dashboardData);
    dashTwo = await dashTwo.save();

    let dashboards = await dashboardService.getDashboardData();

    expect(dashboards.length).toBe(2);

    expectDashboardDeep(true, dashboards[0], dash);
    expect(dashboards[0]).toEqual(
      expect.not.objectContaining({ visible: expect.any(Boolean) })
    );

    expectDashboardBasic(dashboards[1], dashTwo);
    expect(dashboards[1]).toEqual(
      expect.not.objectContaining({ visible: expect.any(Boolean) })
    );
    expect(dashboards[1]).toEqual(
      expect.not.objectContaining({ widgets: expect.any(Array) })
    );
  });

  it("only sends the current dashboard with full data for users", async () => {
    let dashOne = new Dashboard(this.dashboardData);
    dashOne = await dashOne.save();

    this.dashboardData.name = "TestDash2";
    this.dashboardData.url = "test-dashboard-2";
    let dashTwo = new Dashboard(this.dashboardData);
    dashTwo = await dashTwo.save();

    let dashboards = await dashboardService.getDashboardData(
      "test-dashboard",
      false
    );

    expect(dashboards.length).toBe(2);
    expectDashboardBasic(dashboards[0], dashOne);
    expect(dashboards[0]).toEqual(
      expect.not.objectContaining({ visible: expect.any(Boolean) })
    );
    expect(dashboards[0]).toEqual(
      expect.objectContaining({ widgets: expect.any(Array) })
    );

    expectDashboardBasic(dashboards[1], dashTwo);
    expect(dashboards[1]).toEqual(
      expect.not.objectContaining({ visible: expect.any(Boolean) })
    );
    expect(dashboards[1]).toEqual(
      expect.not.objectContaining({ widgets: expect.any(Array) })
    );
  });

  it("returns dashboard for admin with full information", async () => {
    let dash = new Dashboard(this.dashboardData);
    dash = await dash.save();

    let dashboards = await dashboardService.getDashboardData("", "true");

    expect(dashboards.length).toBe(1);

    expectDashboardDeep(true, dashboards[0], dash);
    expect(dashboards[0]).toEqual(expect.objectContaining({ visible: true }));
  });

  it("returns only first dashboard for admin with full information if no url is provided", async () => {
    let dash = new Dashboard(this.dashboardData);
    dash = await dash.save();

    this.dashboardData.name = "TestDash2";
    this.dashboardData.url = "test-dashboard-2";
    let dashTwo = new Dashboard(this.dashboardData);
    dashTwo = await dashTwo.save();

    let dashboards = await dashboardService.getDashboardData("", "true");

    expect(dashboards.length).toBe(2);
    expectDashboardBasic(dashboards[0], dash);
    expect(dashboards[0]).toEqual(expect.objectContaining({ visible: true }));

    expectDashboardBasic(dashboards[1], dashTwo);
    expect(dashboards[1]).toEqual(expect.objectContaining({ visible: true }));
    expect(dashboards[1]).toEqual(
      expect.not.objectContaining({ widgets: expect.any(Array) })
    );
  });

  it("only sends the current dashboard with full data for admin", async () => {
    let dashOne = new Dashboard(this.dashboardData);
    dashOne = await dashOne.save();

    this.dashboardData.name = "TestDash2";
    this.dashboardData.url = "test-dashboard-2";
    let dashTwo = new Dashboard(this.dashboardData);
    dashTwo = await dashTwo.save();

    let dashboards = await dashboardService.getDashboardData(
      "test-dashboard",
      "true"
    );

    expect(dashboards.length).toBe(2);
    expectDashboardBasic(dashboards[0], dashOne);
    expect(dashboards[0]).toEqual(expect.objectContaining({ visible: true }));
    expect(dashboards[0]).toEqual(
      expect.objectContaining({ widgets: expect.any(Array) })
    );

    expectDashboardBasic(dashboards[1], dashTwo);
    expect(dashboards[1]).toEqual(expect.objectContaining({ visible: true }));
    expect(dashboards[1]).toEqual(
      expect.not.objectContaining({ widgets: expect.any(Array) })
    );
  });

  it("returns 500 if an error occurs", async () => {
    const mockDashboardService = rewire("../../services/dashboard.service");
    mockDashboardService.__set__("Dashboard", () => {
      find: (obj, cb) => {
        cb(new Error("test error"));
      };
    });
    expect(mockDashboardService.getDashboardData()).rejects.toEqual(500);
  });
});

describe("creating dashboards", () => {
  it("creates a dashboard", async () => {
    await dashboardService.createDashboard(this.dashboardData, () => {});
    let dash = await Dashboard.findOne({}, {}, { sort: { created_at: -1 } });
    expectDashboardDeep(false, dash, this.dashboardData);
  });

  it("fails creation with invalid dashboard config and code 422", async () => {
    this.dashboardData.widgets[0].panels[0].tabs[0].id = "A{)?*";
    expect(
      dashboardService.createDashboard(this.dashboardData, () => {})
    ).rejects.toEqual(422);
  });

  it("fails creation with error and code 500", async () => {
    const mockDashboardService = rewire("../../services/dashboard.service");
    mockDashboardService.__set__("addDashboard", () => {
      return new Promise(reject, () => reject(new Error("test error")));
    });
    expect(
      mockDashboardService.createDashboard(this.dashboardData, () => {})
    ).rejects.toEqual(500);
  });
});

describe("updating dashboards", () => {
  it("updates a dashboard", async () => {
    let dash = new Dashboard(this.dashboardData);
    dash = await dash.save();

    this.dashboardData._id = dash._id;
    this.dashboardData.name = "TestDash2";
    this.dashboardData.url = "test-dashboard-2";

    await dashboardService.updateDashboard(this.dashboardData, () => {});

    let dbDash = await Dashboard.findOne({}, {}, { sort: { created_at: -1 } });

    expectDashboardDeep(false, dbDash, this.dashboardData);
  });

  it("fails update with invalid dashboard config and code 422", async () => {
    this.dashboardData.widgets[0].panels[0].tabs[0].id = "A{)?*";
    expect(
      dashboardService.updateDashboard(this.dashboardData, () => {})
    ).rejects.toEqual(422);
  });

  it("fails update with error and code 500", async () => {
    const mockDashboardService = rewire("../../services/dashboard.service");
    mockDashboardService.__set__("updateDashboardInDb", () => {
      return new Promise(reject, () => reject(new Error("test error")));
    });
    expect(
      mockDashboardService.updateDashboard(this.dashboardData, () => {})
    ).rejects.toEqual(500);
  });

  it("fails update with not found and code 404", async () => {
    this.dashboardData._id = "5e8f8f8f8f8f8f8f8f8f8f8f";
    expect(
      dashboardService.updateDashboard(this.dashboardData, () => {})
    ).rejects.toEqual(404);
  });
});

describe("deleting dashboards", () => {
  it("deletes a dashboard", async () => {
    let dash = new Dashboard(this.dashboardData);
    dash = await dash.save();

    await dashboardService.deleteDashboard({ _id: dash._id }, () => {});

    expect(await Dashboard.findById(dash._id)).toBe(null);
  });

  it("fails delete with error and code 500", async () => {
    const mockDashboardService = rewire("../../services/dashboard.service");
    mockDashboardService.__set__("deleteDashboardInDb", () => {
      return new Promise(reject, () => reject(new Error("test error")));
    });
    expect(
      mockDashboardService.deleteDashboard(this.dashboardData, () => {})
    ).rejects.toEqual(500);
  });

  it("fails delete with not found and code 404", async () => {
    this.dashboardData._id = "5e8f8f8f8f8f8f8f8f8f8f8f";
    expect(
      dashboardService.deleteDashboard(this.dashboardData, () => {})
    ).rejects.toEqual(404);
  });
});

function expectDashboardBasicWithId(expectingDashboard, actualDashboard) {
  expect(actualDashboard).toEqual(
    expect.objectContaining({
      _id: expectingDashboard._id,
      name: expectingDashboard.name,
      url: expectingDashboard.url,
      icon: expectingDashboard.icon,
    })
  );
}

function expectDashboardBasic(expectingDashboard, actualDashboard) {
  expect(actualDashboard).toEqual(
    expect.objectContaining({
      name: expectingDashboard.name,
      url: expectingDashboard.url,
      icon: expectingDashboard.icon,
    })
  );
}

function expectDashboardDeep(withId, expectingDashboard, actualDashboard) {
  if (withId) {
    expectDashboardBasicWithId(expectingDashboard, actualDashboard);
  } else {
    expectDashboardBasic(expectingDashboard, actualDashboard);
  }
  expect(expectingDashboard.widgets.length).toEqual(
    actualDashboard.widgets.length
  );
  expect(expectingDashboard.widgets[0].name).toEqual(
    actualDashboard.widgets[0].name
  );
  expect(expectingDashboard.widgets[0].panels.length).toEqual(
    actualDashboard.widgets[0].panels.length
  );
  expect(expectingDashboard.widgets[0].panels[0].name).toEqual(
    actualDashboard.widgets[0].panels[0].name
  );
  expect(expectingDashboard.widgets[0].panels[0].width).toEqual(
    actualDashboard.widgets[0].panels[0].width
  );
  expect(expectingDashboard.widgets[0].panels[0].height).toEqual(
    actualDashboard.widgets[0].panels[0].height
  );
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
            tabs: [
              {
                id: "62c3d62f2985104c6ae101d3",
              },
            ],
          },
        ],
      },
    ],
  };
}
