const mongoose = require("mongoose");
const InfoLink = require("./link.model");

const Dashboard = mongoose.model(
  "Dashboard",
  new mongoose.Schema({
    index: Number,
    name: String,
    url: String,
    icon: String,
    visible: { type: Boolean, default: true, required: false },
    widgets: [
      {
        name: String,
        width: Number,
        height: Number,
        widgetIcon: String,
        tabIcons: [String],
        infoHeadline: String,
        infoText: String,
        infoLinks: [{}],
        panels: [
          {
            name: String,
            width: Number,
            height: Number,
            tabs: [
              {
                name: String,
                type: {
                  type: String,
                },
                text: String,
                apexType: String,
                apexOptions: {},
                apexSeries: [{}],
                apexMaxValue: Number,
                apexMaxAlias: String,
                apexMaxColor: String,
                apexStepline: Boolean,
                componentType: String,
                componentDataType: String,
                componentData: [],
                componentName: String,
                componentDescription: String,
                componentIcon: String,
                componentMinimum: Number,
                componentMaximum: Number,
                componentWarning: Number,
                componentAlarm: Number,
                componentUnit: String,
                componentValue: Number,
                componentOptions: {},
                donutToTotalLabel: Boolean,
                timeframe: Number,
                fiwareService: String,
                fiwareType: String,
                entityId: [String],
                queryUpdateMsg: String,
                attribute: {
                  keys: [String],
                  aliases: [String],
                },
                filterProperty: String,
                filterAttribute: String,
                filterValues: [String],
                values: [Number],
                decimals: Number,
                attributeType: String,
                aggrMode: String,
                queryData: {
                  id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Querydata",
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  })
);

module.exports = Dashboard;
