import dataBuilder from "../controllers/DataBuilder"; // this will be your custom import
import { expect } from "chai";
import { isQueryConfigObject, QueryData } from "../models/QueryData";

describe("DataBuilder multi tests", () => {
  it("build response empty", () => {
    const queryData = getMultiQueryData();
    const response: any[] = [];
    const data = dataBuilder.buildMulti(queryData, response);

    expect(data).to.deep.equal([]);
  });

  it("build response measurements empty", () => {
    const queryData = getMultiQueryData();
    const response = getMultiResponse().map((resp) => {
      resp = [];
      return resp;
    });
    const data = dataBuilder.buildMulti(queryData, response);

    expect(data).to.deep.equal([]);
  });

  it("build aggrMode Single", () => {
    const queryData = getMultiQueryData();
    const response = getMultiResponse();
    const data = dataBuilder.buildMulti(queryData, response);

    expect(data).to.deep.equal([2935.8333333333335]);
  });

  it("build aggrMode avg", () => {
    const queryData = getMultiQueryData();

    if (isQueryConfigObject(queryData.queryConfig)) {
      queryData.queryConfig.aggrMode = "avg";

      const response = getMultiResponse();
      const data = dataBuilder.buildMulti(queryData, response);

      expect(data).to.deep.equal([2935.8333333333335]);
    }
  });

  it("build aggrMode sum", () => {
    const queryData = getMultiQueryData();

    if (isQueryConfigObject(queryData.queryConfig)) {
      queryData.queryConfig.aggrMode = "sum";

      const response = getMultiResponse();
      const data = dataBuilder.buildMulti(queryData, response);

      expect(data).to.deep.equal([17615]);
    }
  });

  it("build aggrMode min", () => {
    const queryData = getMultiQueryData();

    if (isQueryConfigObject(queryData.queryConfig)) {
      queryData.queryConfig.aggrMode = "min";

      const response = getMultiResponse();
      const data = dataBuilder.buildMulti(queryData, response);

      expect(data).to.deep.equal([2770]);
    }
  });

  it("build aggrMode max", () => {
    const queryData = getMultiQueryData();

    if (isQueryConfigObject(queryData.queryConfig)) {
      queryData.queryConfig.aggrMode = "max";

      const response = getMultiResponse();
      const data = dataBuilder.buildMulti(queryData, response);

      expect(data).to.deep.equal([3253]);
    }
  });

  it("build with co2 response", () => {
    const queryData = getMultiQueryData();
    if (isQueryConfigObject(queryData.queryConfig)) {
      const response = [getCo2SoftResponse()];

      const data = dataBuilder.build(queryData, response);

      expect(data).to.deep.equal([{ name: "Distanz", data: [0] }]);
    }
  });
});

describe("DataBuilder value tests", () => {
  it("build test", () => {
    const queryData = getQueryData();
    if (isQueryConfigObject(queryData.queryConfig)) {
      queryData.queryConfig.type = "value";
      const response = getResponse();
      const data = dataBuilder.build(queryData, response);

      expect(data).to.deep.equal([2780]);
    }
  });

  it("build test with key that is not in response", () => {
    const queryData = getQueryData();
    if (isQueryConfigObject(queryData.queryConfig)) {
      queryData.queryConfig.type = "value";
      queryData.queryConfig.attribute.keys = ["notInResponse"];
      const response = getResponse();
      const data = dataBuilder.build(queryData, response);

      expect(data).to.deep.equal([0]);
    }
  });

  it("build test with empty measurement response", () => {
    const queryData = getQueryData();
    if (isQueryConfigObject(queryData.queryConfig)) {
      queryData.queryConfig.type = "value";
      const response: any[] = [];
      const data = dataBuilder.build(queryData, response);

      expect(data).to.deep.equal([]);
    }
  });
});

describe("DataBuilder line chart tests", () => {
  it("build test", () => {
    const queryData = getQueryData();
    if (isQueryConfigObject(queryData.queryConfig)) {
      queryData.queryConfig.apexType = "line";
      const response = getResponse();
      const data = dataBuilder.build(queryData, response);

      expect(data).to.deep.equal([
        {
          name: "Distanz",
          data: [2780, 2782, 2780],
        },
      ]);
    }
  });

  it("build test with empty measurement response", () => {
    const queryData = getQueryData();
    if (isQueryConfigObject(queryData.queryConfig)) {
      queryData.queryConfig.apexType = "line";
      const response: any[] = [];
      const data = dataBuilder.build(queryData, response);

      expect(data).to.deep.equal([
        {
          name: "Distanz",
          data: [],
        },
      ]);
    }
  });
});

describe("DataBuilder bar chart tests", () => {
  it("build test", () => {
    const queryData = getQueryData();
    if (isQueryConfigObject(queryData.queryConfig)) {
      queryData.queryConfig.apexType = "bar";
      const response = getResponse();
      const data = dataBuilder.build(queryData, response);

      expect(data).to.deep.equal([
        {
          name: "Distanz",
          data: [2780, 2782, 2780],
        },
      ]);
    }
  });

  it("build test with empty measurement response", () => {
    const queryData = getQueryData();
    if (isQueryConfigObject(queryData.queryConfig)) {
      queryData.queryConfig.apexType = "bar";
      const response: any[] = [];
      const data = dataBuilder.build(queryData, response);

      expect(data).to.deep.equal([
        {
          name: "Distanz",
          data: [],
        },
      ]);
    }
  });
});

describe("DataBuilder donut chart tests", () => {
  it("build apex max test", () => {
    const queryData = getQueryData();
    if (isQueryConfigObject(queryData.queryConfig)) {
      queryData.queryConfig.apexType = "donut";
      queryData.queryConfig.attribute.keys = ["version"];

      const response = getResponse();
      response.length = 1;

      const data = dataBuilder.build(queryData, response);

      expect(data).to.deep.equal([98, 2]);
    }
  });

  it("build test with apex max and bigger length", () => {
    const queryData = getQueryData();
    if (isQueryConfigObject(queryData.queryConfig)) {
      queryData.queryConfig.apexType = "donut";
      queryData.queryConfig.attribute.keys = ["version"];

      const response = getResponse();

      const data = dataBuilder.build(queryData, response);

      expect(data).to.deep.equal([98, 2]);
    }
  });

  it("build regular test", () => {
    const queryData = getQueryData();
    if (isQueryConfigObject(queryData.queryConfig)) {
      queryData.queryConfig.apexType = "donut";
      queryData.queryConfig.attribute.keys = ["version"];
      queryData.queryConfig.apexMaxAlias = "";

      const response = getResponse();
      response.length = 1;

      const data = dataBuilder.build(queryData, response);

      expect(data).to.deep.equal([2]);
    }
  });

  it("build regular test with bigger length", () => {
    const queryData = getQueryData();
    if (isQueryConfigObject(queryData.queryConfig)) {
      queryData.queryConfig.apexType = "donut";
      queryData.queryConfig.attribute.keys = ["version"];
      queryData.queryConfig.apexMaxAlias = "";

      const response = getResponse();

      const data = dataBuilder.build(queryData, response);

      expect(data).to.deep.equal([2]);
    }
  });

  it("build with co2 response", () => {
    const queryData = getQueryData();
    if (isQueryConfigObject(queryData.queryConfig)) {
      const response = getCo2SoftResponse();

      const data = dataBuilder.build(queryData, response);

      expect(data).to.deep.equal([]);
    }
  });
});

function getQueryData(): QueryData {
  return {
    _id: { $oid: "61f929546eb2edbb8b0a84fe" },
    queryConfig: {
      type: "chart",
      fiwareService: "sensors",
      entityId: ["cas_02e3204e_5292_4772_b77b_be5448bcea6b"],
      attribute: { keys: ["distance"], aliases: ["Distanz"] },
      aggrMode: "single",
      apexType: "bar",
      apexMaxValue: 100,
      apexMaxAlias: "Maximale Besucher",
      intervalInMinutes: 5,
    },
    data: [],
    dataLabels: [],
    createdAt: new Date(1643718996427),
    updatedAt: new Date(1666018832168),
    updateMsg: "",
  };
}

function getResponse(): any[] {
  return [
    {
      id: "ultrasonic2",
      timestamp: "2021-04-28T15:15:29.358Z",
      distance: 2780,
      nodeid: 4190,
      trials: 15,
      version: 2,
      voltage: 2814,
    },
    {
      id: "ultrasonic2",
      timestamp: "2021-04-28T14:55:32.097Z",
      distance: 2782,
      nodeid: 4190,
      trials: 15,
      version: 2,
      voltage: 2814,
    },
    {
      id: "ultrasonic2",
      timestamp: "2021-04-28T14:45:29.739Z",
      distance: 2780,
      nodeid: 4190,
      trials: 15,
      version: 2,
      voltage: 2814,
    },
  ];
}

function getMultiQueryData(): QueryData {
  return {
    _id: { $oid: "61f1349397fe31a9d33fe4d0" },
    queryConfig: {
      type: "chart",
      fiwareService: "sensors",
      entityId: [
        "cas_02e3204e_5292_4772_b77b_be5448bcea6b",
        "cas_6433ea1d_9c83_47a3_9bc6_c0712642843c",
      ],
      attribute: { keys: ["distance"], aliases: ["Distanz"] },
      aggrMode: "single",
      apexType: "line",
      apexMaxValue: 8,
      apexMaxAlias: "frei",
      intervalInMinutes: 5,
    },
    data: [],
    dataLabels: [],
    createdAt: new Date(1643197587841),
    updatedAt: new Date(1666018832164),
    updateMsg: "",
  };
}

function getMultiResponse(): any[] {
  return [
    [
      {
        id: "ultrasonic2",
        timestamp: "2021-04-28T15:15:29.358Z",
        distance: 2780,
        nodeid: 4190,
        trials: 15,
        version: 2,
        voltage: 2814,
      },
      {
        id: "ultrasonic2",
        timestamp: "2021-04-28T14:55:32.097Z",
        distance: 2782,
        nodeid: 4190,
        trials: 15,
        version: 2,
        voltage: 2814,
      },
      {
        id: "ultrasonic2",
        timestamp: "2021-04-28T14:45:29.739Z",
        distance: 2780,
        nodeid: 4190,
        trials: 15,
        version: 2,
        voltage: 2814,
      },
    ],
    [
      {
        id: "ultrasonic2",
        timestamp: "2021-01-25T08:29:49.130Z",
        distance: 2770,
        nodeid: 4190,
        trials: 15,
        version: 2,
        voltage: 1628,
      },
      {
        id: "ultrasonic1",
        timestamp: "2021-01-25T08:46:59.721Z",
        distance: 3250,
        nodeid: 2772,
        trials: 15,
        version: 2,
        voltage: 2792,
      },
      {
        id: "ultrasonic1",
        timestamp: "2021-01-25T08:26:58.051Z",
        distance: 3253,
        nodeid: 2772,
        trials: 15,
        version: 2,
        voltage: 2792,
      },
    ],
  ];
}

function getCo2SoftResponse() {
  return [
    {
      id: "elsystemp-sensor-a81758fffe0626fa",
      isotimestamp: "2022-06-01T07:13:22.336Z",
      consumerid: "elsystemp-sensor-a81758fffe0626fa",
      consumername: "elsystemp-sensor-a81758fffe0626fa",
      measurements: [
        {
          value: 23.0,
          unit: "°C",
          property: "Temperatursensor",
          exactmeasurement: "W",
        },
        {
          value: 36.0,
          unit: "%",
          property: "rel. Feuchte Sensor",
          exactmeasurement: "W",
        },
        {
          value: 0.0,
          unit: "lux",
          property: "Beleuchtungssensor",
          exactmeasurement: "W",
        },
      ],
    },
  ];
}
