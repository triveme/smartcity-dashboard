import { useState } from "react";

import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";

import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";

import { PanelComponent } from "components/panel";
import { DataConfigurator } from "components/architectureConfig/data-configurator";
import { SmallField } from "components/elements/text-fields";
import { MaxColorDialog } from "components/architectureConfig/color-dialog";

import colors from "theme/colors";

type ChartConfiguratorProps = {
  currentTabIndex: number;
  tempPanel: PanelComponent;
  setNewTabValue: (key: string, tabValue: any) => void;
};

export function ChartConfigurator(props: ChartConfiguratorProps) {
  const { currentTabIndex, tempPanel, setNewTabValue } = props;

  // create missing tab properties
  if (!tempPanel.tabs[currentTabIndex].apexOptions) {
    tempPanel.tabs[currentTabIndex].apexOptions = {
      chart: {
        toolbar: {
          show: false,
        },
      },
    };
  }
  if (!tempPanel.tabs[currentTabIndex].apexMaxValue) {
    tempPanel.tabs[currentTabIndex].apexMaxValue = 100;
  }
  if (!tempPanel.tabs[currentTabIndex].apexMaxAlias) {
    tempPanel.tabs[currentTabIndex].apexMaxAlias = "";
  }

  const [maxManual, setMaxManual] = useState(
    tempPanel.tabs[currentTabIndex].apexMaxAlias !== "" ? "manual" : "auto"
  );

  const [maxColorPickerOpen, setMaxColorPickerOpen] = useState(false);

  const handleMaxColorPickerClickOpen = () => {
    setMaxColorPickerOpen(true);
  };

  const handleMaxColorPickerClose = () => {
    setMaxColorPickerOpen(false);
  };

  // in case of a donut chart, the max color is saved in the colors array in apexOptions
  // thus when switching away from a manual max color it needs to be removed
  const donutCleanup = () => {
    if (
      tempPanel.tabs[currentTabIndex].apexType &&
      tempPanel.tabs[currentTabIndex].apexType === "donut" &&
      tempPanel.tabs[currentTabIndex].apexOptions?.colors &&
      tempPanel.tabs[currentTabIndex].apexOptions!.colors!.length > 0
    ) {
      let newOptionsForColors = cloneDeep(
        tempPanel.tabs[currentTabIndex].apexOptions
      );
      newOptionsForColors!.colors!.shift();
      setNewTabValue("apexOptions", newOptionsForColors);
    }
  };

  return (
    <>
      <FormControl
        variant="outlined"
        fullWidth
        style={{
          marginTop: 8,
          marginBottom: 4,
          backgroundColor: colors.backgroundColor,
        }}
      >
        <InputLabel id="typ-simple-select-filled-label">Charttyp</InputLabel>
        <Select
          size="small"
          margin="dense"
          label="Charttyp"
          labelId="charttyp-simple-select-filled-label"
          id="charttyp-simple-select-filled"
          value={
            tempPanel.tabs[currentTabIndex] &&
            tempPanel.tabs[currentTabIndex].type === "chart"
              ? tempPanel.tabs[currentTabIndex].apexType
              : "donut"
          }
          onChange={(e) => setNewTabValue("apexType", e.target.value)}
          style={{ backgroundColor: colors.backgroundColor }}
        >
          <MenuItem value="donut">Donut</MenuItem>
          <MenuItem value="bar">Säulen</MenuItem>
          <MenuItem value="line">Linien</MenuItem>
        </Select>
      </FormControl>
      {tempPanel.tabs[currentTabIndex] &&
        tempPanel.tabs[currentTabIndex].type === "chart" &&
        (tempPanel.tabs[currentTabIndex].apexType === "line" ||
          tempPanel.tabs[currentTabIndex].apexType === "bar") && (
          <>
            {tempPanel.tabs[currentTabIndex].apexOptions ? (
              <>
                <FormControl
                  variant="outlined"
                  fullWidth
                  style={{ marginTop: 8, marginBottom: 4 }}
                >
                  <InputLabel id="timeframe-select-filled-label">
                    Zeitraum
                  </InputLabel>
                  <Select
                    size="small"
                    margin="dense"
                    label="Zeitraum"
                    labelId="timeframe-select-filled-label"
                    id="timeframe-select-filled"
                    value={
                      tempPanel.tabs[currentTabIndex].timeframe
                        ? tempPanel.tabs[currentTabIndex].timeframe
                        : 0
                    }
                    onChange={(e) =>
                      setNewTabValue("timeframe", e.target.value)
                    }
                    style={{ backgroundColor: colors.backgroundColor }}
                  >
                    <MenuItem value={0}>Letzte 24h</MenuItem>
                    <MenuItem value={1}>Letzte 7 Tage</MenuItem>
                    <MenuItem value={2}>Letzte 30 Tage</MenuItem>
                  </Select>
                </FormControl>
                <SmallField
                  label="Y-Beschriftung"
                  type="text"
                  value={
                    (tempPanel.tabs[currentTabIndex].apexOptions as any).yaxis
                      ?.title?.text || ""
                  }
                  onChange={(e) =>
                    setNewTabValue(
                      "apexOptions",
                      set(
                        cloneDeep(tempPanel.tabs[currentTabIndex].apexOptions!),
                        "yaxis.title.text",
                        e.target.value
                      )
                    )
                  }
                />
                <SmallField
                  label="X-Beschriftung"
                  type="text"
                  value={
                    tempPanel.tabs[currentTabIndex].apexOptions?.xaxis?.title
                      ?.text
                      ? tempPanel.tabs[currentTabIndex].apexOptions?.xaxis
                          ?.title?.text
                      : ""
                  }
                  onChange={(e) =>
                    setNewTabValue(
                      "apexOptions",
                      set(
                        cloneDeep(tempPanel.tabs[currentTabIndex].apexOptions!),
                        "xaxis.title.text",
                        e.target.value
                      )
                    )
                  }
                />
              </>
            ) : null}
          </>
        )}
      {tempPanel.tabs[currentTabIndex] &&
      tempPanel.tabs[currentTabIndex].type === "chart" ? (
        <>
          <Box display="flex" alignItems="center">
            <FormControl
              variant="outlined"
              sx={{ minWidth: 150 }}
              style={{
                marginBottom: 4,
                marginTop: 8,
                marginRight: 6,
              }}
            >
              <InputLabel id="maximum-simple-select-filled-label">
                Maximum (Art, Wert)
              </InputLabel>
              <Select
                size="small"
                margin="dense"
                variant="outlined"
                label="Maximum (Art, Wert)"
                labelId="maximum-simple-select-filled-label"
                id="maximum-simple-select-filled"
                value={maxManual}
                onChange={(e) =>
                  e.target.value === "auto"
                    ? (setNewTabValue("apexMaxValue", "100"),
                      setNewTabValue("apexMaxAlias", ""),
                      donutCleanup(),
                      setMaxManual(e.target.value))
                    : (setNewTabValue("apexMaxAlias", "frei"),
                      setMaxManual(e.target.value))
                }
                style={{
                  backgroundColor: colors.backgroundColor,
                }}
              >
                <MenuItem value="auto">Automatisch</MenuItem>
                <MenuItem value="manual">Manuell</MenuItem>
              </Select>
            </FormControl>
            {maxManual === "manual" ? (
              <SmallField
                label=""
                type="number"
                value={
                  tempPanel.tabs[currentTabIndex].apexMaxValue
                    ? tempPanel.tabs[currentTabIndex].apexMaxValue
                    : 100
                }
                onChange={(e) => setNewTabValue("apexMaxValue", e.target.value)}
              />
            ) : null}
          </Box>
          {maxManual === "manual" ? (
            <Box margin={0.5} marginTop={0}>
              <Paper
                key={"manual-max-paper"}
                style={{
                  height: "100%",
                  paddingTop: 2,
                  paddingRight: 2,
                  paddingBottom: 2,
                  paddingLeft: 10,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: colors.backgroundColor,
                }}
                elevation={0}
              >
                <SmallField
                  key={"manual-max-alias-text-field"}
                  label="Alias für Zahl bis Maximum"
                  type="text"
                  value={
                    tempPanel.tabs[currentTabIndex].apexMaxAlias === ""
                      ? "frei"
                      : tempPanel.tabs[currentTabIndex].apexMaxAlias
                  }
                  onChange={(e) =>
                    setNewTabValue("apexMaxAlias", e.target.value)
                  }
                />
                <Button
                  size="small"
                  key={"manual-max-color-button"}
                  variant="contained"
                  onClick={handleMaxColorPickerClickOpen}
                  style={{
                    marginLeft: 15,
                    marginRight: 10,
                    fontWeight: "bold",
                    backgroundColor: !tempPanel.tabs[currentTabIndex]
                      .apexMaxColor
                      ? colors.primary
                      : tempPanel.tabs[currentTabIndex].apexMaxColor,
                  }}
                >
                  Farbe
                </Button>
                <MaxColorDialog
                  open={maxColorPickerOpen}
                  onClose={handleMaxColorPickerClose}
                  setNewTabValue={setNewTabValue}
                  currentTab={tempPanel.tabs[currentTabIndex]}
                />
              </Paper>
            </Box>
          ) : null}
          <SmallField
            label="Nachkommastellen"
            type="number"
            value={
              !tempPanel.tabs[currentTabIndex].decimals
                ? 0
                : tempPanel.tabs[currentTabIndex].decimals
            }
            onChange={(e) =>
              setNewTabValue(
                "attributeDecimals",
                parseInt(e.target.value) ? parseInt(e.target.value) : 0
              )
            }
            onBlur={() => {
              if (
                tempPanel.tabs[currentTabIndex].decimals &&
                (tempPanel.tabs[currentTabIndex].decimals! < 0 ||
                  tempPanel.tabs[currentTabIndex].decimals! > 5)
              ) {
                setNewTabValue("attributeDecimals", 0);
              }
            }}
          />
          <DataConfigurator
            currentTabIndex={currentTabIndex}
            tempPanel={tempPanel}
            setNewTabValue={setNewTabValue}
          />
        </>
      ) : null}
    </>
  );
}
