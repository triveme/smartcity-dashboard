import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { Chart } from "components/chart";
import { Value } from "components/value";
import { ApexOptions } from "apexcharts";
import { PanelComponent } from "components/panel";

import colors from "theme/colors";
import { TransitionAlert } from "./elements/transition-alert";

export type TabComponent = {
  _id: string;
  type: string;
  name: string;
  uid: string;
  donutToTotalLabel?: boolean;
  text?: string;
  apexType?: string;
  apexOptions?: ApexOptions;
  apexSeries?: Array<any>;
  apexMaxValue?: number;
  apexMaxAlias?: string;
  apexMaxColor?: string;
  timeframe?: number;
  fiwareService?: string;
  entityId?: string[];
  filterProperty: string;
  filterAttribute: string;
  filterValues: string[];
  attribute?: {
    keys: string[];
    aliases: string[];
  };
  values?: number[];
  decimals?: number;
  aggrMode?: string;
  queryData?: {
    id?: string;
  };
  queryUpdateMsg?: String;
};

type SingleTabProps = {
  tab: TabComponent;
  height: number;
};

function SingleTab(props: SingleTabProps) {
  const { tab, height } = props;

  //init alertText
  let alertText: String = "";
  if (tab.queryUpdateMsg) {
    alertText = tab.queryUpdateMsg;
  }

  if (tab.type === "chart") {
    return (
      <Box sx={{ position: "relative" }}>
      <Chart key={"chart-" + (tab._id!=="" ? tab._id : tab.uid)} height={height - 50} tab={tab} />
        {!tab.apexSeries || (tab.apexSeries && tab.apexSeries?.length < 1) ? (
          alertText === "" ? (
            <TransitionAlert alertText={alertText} info={true} />
          ) : (
            <TransitionAlert alertText={alertText} />
          )
        ) : null}
      </Box>
    );
  } else if (tab.type === "description") {
    return (
      <Box key={"box-" + (tab._id!=="" ? tab._id : tab.uid)} height={height - 49} style={{ padding: 10 }}>
        <Typography
          overflow="auto"
          height="100%"
          component="div"
          variant="body2"
          lineHeight={1.75}
        >
          {tab.text}
        </Typography>
      </Box>
    );
  } else if (tab.type === "value") {
    return (
      <Box sx={{ position: "relative", height: "inherit" }}>
        <Value key={"value-" + (tab._id!==""? tab._id : tab.uid)} tab={tab} />
        {!tab.values || (tab.values && tab.values?.length < 1) ? (
          alertText === "" ? (
            <TransitionAlert alertText={alertText} info={true} />
          ) : (
            <TransitionAlert alertText={alertText} />
          )
        ) : null}
      </Box>
    );
  } else {
    return <>Invalid Tab type</>;
  }
}

type TabPanelProps = {
  value: number;
  tab: TabComponent;
  index: number;
  height: number;
};

function TabPanel(props: TabPanelProps) {
  const { value, tab, height, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={tab.name + "-" + index}
      aria-labelledby={tab.name + "-" + index}
    >
      {value === index && (
        <SingleTab key={"singletab-" + (tab._id!==""? tab._id : tab.uid)} height={height} tab={tab} />
      )}
    </div>
  );
}

function a11yProps(tab: TabComponent, index: number) {
  return {
    id: tab.name + "-" + index,
    "aria-controls": tab.name + "-" + index,
  };
}

type TabbingProps = {
  panel: PanelComponent;
};

export function Tabbing(props: TabbingProps) {
  const { panel } = props;

  const [tabValue, setTabValue] = React.useState(0);
  const handleTabValueChange = (
    event: React.SyntheticEvent,
    newTabValue: number
  ) => {
    setTabValue(newTabValue);
  };

  if (panel.tabs.length === 1) {
    return (
      <SingleTab
        key={"singletab-" + (panel.tabs[0]._id!=="" ? panel.tabs[0]._id : panel.tabs[0].uid)}
        height={panel.name ? panel.height - 24 : panel.height}
        tab={panel.tabs[0]}
      />
    );
  } else if (panel.tabs.length > 1) {
    return (
      <>
        {panel.tabs.map((tab: TabComponent, index: number) => (
          <TabPanel
            key={"tabpanel-" + (tab._id!=="" ? tab._id : tab.uid + index)}
            value={tabValue < panel.tabs.length ? tabValue : 0}
            tab={tab}
            height={panel.name ? panel.height - 24 - 49 : panel.height - 49}
            index={index}
          />
        ))}
        <Box display="flex" justifyContent="center">
          <Tabs
            value={tabValue < panel.tabs.length ? tabValue : 0}
            sx={{
              minHeight: 38,
              maxHeight: 38,
              "& .Mui-selected css-1q2h7u5": {
                color: colors.edit,
              },
            }}
            onChange={handleTabValueChange}
            aria-label={panel.name + "-tabs"}
          >
            {panel.tabs.map((tab: TabComponent, index: number) => (
              <Tab
                key={"tab-" + (tab._id!=="" ? tab._id : tab.uid + index)}
                style={{
                  fontSize: "small",
                  padding: 0,
                  fontWeight: "bold",
                }}
                label={tab.name}
                {...a11yProps(tab, index)}
              />
            ))}
          </Tabs>
        </Box>
      </>
    );
  } else {
    return <p>Kein Inhalt gefunden.</p>;
  }
}
