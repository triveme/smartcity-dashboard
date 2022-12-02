import Box from "@mui/material/Box";

import { default as ApexChart } from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";

import type { TabComponent } from "components/tab";

import { roundDecimalPlaces } from "utils/decimal-helper";

import colors from "theme/colors";

type BarChartProps = {
  tab: TabComponent;
  height: number;
  tickAmountKey: number;
  windowWidth?: number;
};

export function BarChart(props: BarChartProps) {
  const { tab, height, tickAmountKey, windowWidth } = props;

  let trigger = "a";

  function triggerRerender() {
    if (trigger === "a") {
      trigger = "b";
    } else {
      trigger = "a";
    }
  }

  /** adds annotationLineToApexOptions (apexMaxValue) */
  function getApexOptionsWithMaxLine() {
    const maxAlias = tab.apexMaxAlias ? tab.apexMaxAlias : "Maximum";
    const maxColor = tab.apexMaxColor ? tab.apexMaxColor : colors.primary;
    let newApexOptions: ApexOptions = {};
    if (tab.apexOptions && tab.apexMaxValue) {
      newApexOptions = cloneDeep(tab.apexOptions);
      newApexOptions = {
        ...newApexOptions,
        annotations: {
          yaxis: [
            {
              y: tab.apexMaxValue,
              strokeDashArray: 0,
              borderColor: maxColor,
              fillColor: "white",
              label: {
                borderColor: maxColor,
                style: {
                  color: "white",
                  background: maxColor,
                },
                text: maxAlias,
              },
            },
          ],
        },
      };
      triggerRerender();
    }
    if (
      tab.apexSeries &&
      tab.apexSeries.length > 0 &&
      tab.apexSeries[0].data &&
      tab.apexSeries[0].data.length > 0 &&
      tab.apexMaxValue &&
      tab.apexOptions
    ) {
      let maxValue = getMaxValueFromSeries();
      if (maxValue && maxValue !== -1 && maxValue < tab.apexMaxValue) {
        let minValue = 0;
        if (tab.apexType && tab.apexType === "line") {
          minValue = getMinValueFromSeries();
        }
        setNewMinMax(minValue, tab.apexMaxValue, newApexOptions);
        triggerRerender();
      }
    }

    return newApexOptions;
  }

  function getMaxValueFromSeries() {
    let maxValue;
    if (tab.apexSeries && tab.apexSeries.length > 0) {
      for (let i = 0; i < tab.apexSeries.length; i++) {
        if (tab.apexSeries[i].data) {
          let currMaxValue = Math.max(...tab.apexSeries[i].data);
          if (!maxValue || maxValue < currMaxValue) {
            maxValue = currMaxValue;
          }
        }
      }
    }
    return maxValue ? maxValue : -1;
  }

  function getMinValueFromSeries() {
    let minValue;
    if (tab.apexSeries && tab.apexSeries.length > 0) {
      for (let i = 0; i < tab.apexSeries.length; i++) {
        if (tab.apexSeries[i].data) {
          let currMinValue = Math.min(...tab.apexSeries[i].data);
          if (!minValue || minValue > currMinValue) {
            minValue = currMinValue;
          }
        }
      }
    }
    return minValue ? minValue : 0;
  }

  /**sets a new max-value of chart (eg if maxLine is outside of shown range)
   * ! min value also needs to be set for line charts (otherwise min/max ~ infitiny)
   */
  function setNewMinMax(
    newMinValue: number,
    newMaxValue: number,
    apexOptions: ApexOptions
  ) {
    const maxWithPuffer = newMaxValue + (newMaxValue - newMinValue) * 0.1;
    // set forceNiceScale to false if spexSeries cover small range (-> min & max will not be rounded)
    const niceScaling = Math.abs(newMaxValue - newMinValue) > 0.5;
    if (apexOptions) {
      apexOptions.yaxis = apexOptions.yaxis
        ? {
            ...apexOptions.yaxis,
            forceNiceScale: niceScaling,
            min: newMinValue,
            max: maxWithPuffer > newMaxValue ? maxWithPuffer : newMaxValue,
          }
        : {
            min: newMinValue,
            forceNiceScale: niceScaling,
            max: maxWithPuffer > newMaxValue ? maxWithPuffer : newMaxValue,
          };
    }
  }

  if (tab.apexSeries) {
    tab.apexSeries = tab.apexSeries.map((series) => {
      if (series && series.data) {
        series.data = series.data.map((val: string | number) => {
          return roundDecimalPlaces(val, tab.decimals);
        });
      }
      return series;
    });
  }

  if (!tab.apexOptions) {
    tab.apexOptions = {};
  }
  if (tab.apexOptions) {
    tab.apexOptions = set(
      tab.apexOptions,
      "xaxis.tickAmount",
      windowWidth ? Math.round(windowWidth / 150) : 3
    );
  }

  return (
    <Box
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        key={"box-" + (tab._id!=="" ? tab._id : tab.uid)}
        style={{ padding: 5, marginBottom: -15, width: "100%" }}
      >
        <ApexChart
          key={"apexchart-" + (tab._id!=="" ? tab._id : tab.uid) + tickAmountKey + trigger}
          height={height}
          series={tab.apexSeries}
          options={
            tab.apexOptions
              ? tab.apexMaxValue && tab.apexMaxAlias && tab.apexMaxAlias !== ""
                ? getApexOptionsWithMaxLine()
                : tab.apexOptions
              : {}
          }
          type="bar"
        />
      </Box>
    </Box>
  );
}
