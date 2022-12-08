const mongoose = require("mongoose");

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
                donutToTotalLabel: Boolean,
                timeframe: Number,
                fiwareService: String,
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
