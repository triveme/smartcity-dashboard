import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import MenuItem from "@mui/material/MenuItem";
import Slider from "@mui/material/Slider";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import cloneDeep from "lodash/cloneDeep";

import { v4 as uuidv4 } from 'uuid';
import { initialTab } from "components/architectureConfig/initial-components";
import { TabConfigurator } from "components/architectureConfig/tab-configurator";
import { PanelComponent } from "components/panel";
import { SmallField } from "components/elements/text-fields";

import colors from "theme/colors";
import borderRadius from "theme/border-radius";
import { TabComponent } from "components/tab";

type PanelConfiguratorProps = {
  tempPanel: PanelComponent;
  setTempPanel: (panel: PanelComponent) => void;
};

export function PanelConfigurator(props: PanelConfiguratorProps) {
  const { tempPanel, setTempPanel } = props;

  const [currentTabIndex, setCurrentTabIndex] = useState(0);

  const setNewPanelValue = (key: string, value: any) => {
    let newTempPanel = cloneDeep(tempPanel);
    switch (key) {
      case "name":
        newTempPanel.name = value;
        break;
      case "height":
        newTempPanel.height = value;
        break;
      case "width":
        newTempPanel.width = value;
        break;
      case "tabs":
        newTempPanel.tabs = cloneDeep(value);
        break;
    }
    setTempPanel(newTempPanel);
  };

  const handleTabsAmountChange = (event: SelectChangeEvent) => {
    const newAmountOfTabs = parseInt(event.target.value);
    let newTempTabs = [...tempPanel.tabs];
    if (newAmountOfTabs < newTempTabs.length) {
      const numberToRemove = newTempTabs.length - newAmountOfTabs;
      for (let i = 0; i < numberToRemove; i++) {
        newTempTabs.pop();
      }
    } else if (newAmountOfTabs > newTempTabs.length) {
      const numberToAdd = newAmountOfTabs - newTempTabs.length;
      for (let i = 0; i < numberToAdd; i++) {
        let tab: TabComponent = {...initialTab};
        tab.uid = uuidv4();
        newTempTabs.push({ ...tab });
      }
      // type value is only allowed for panels without tabs (so tabs.length === 1)
      if (newTempTabs[0].type === "value") {
        newTempTabs[0].type = "description";
      }
    }
    setNewPanelValue("tabs", newTempTabs);
  };

  useEffect(() => {
    setCurrentTabIndex(0);
  }, [tempPanel.tabs.length]);

  return (
    <Paper
      style={{
        height: "100%",
        padding: 10,
        backgroundColor: colors.backgroundColor,
        borderRadius: borderRadius.componentRadius,
      }}
      elevation={0}
    >
      <SmallField
        label="Name"
        type="text"
        value={tempPanel.name}
        onChange={(e) => setNewPanelValue("name", e.target.value)}
      />
      <Box display="flex" alignItems="center">
        <SmallField
          label="Größe (Höhe / Breite)"
          type="number"
          value={tempPanel.height}
          onChange={(e) =>
            setNewPanelValue(
              "height",
              parseInt(e.target.value) ? parseInt(e.target.value) : 300
            )
          }
          onBlur={() => {
            if (tempPanel.height < 150) {
              setNewPanelValue("height", 150);
            }
          }}
          customStyle={{
            minWidth: 150,
            width: 150,
          }}
        />
        <Box
          style={{
            marginLeft: 6,
            backgroundColor: colors.backgroundColor,
            width: "100%",
            borderRadius: "4px",
            border: "1px",
            borderStyle: "solid",
            borderColor: colors.inputFieldOutline,
            marginTop: "4px",
            display: "flex",
          }}
        >
          <Slider
            aria-label="Panelbreite"
            value={tempPanel.width as number}
            onChange={(e, v) => setNewPanelValue("width", v)}
            getAriaValueText={(v) => v.toString()}
            valueLabelDisplay="auto"
            step={1}
            marks
            min={2}
            max={12}
            style={{
              color: colors.edit,
              marginLeft: 10,
              marginRight: 10,
              paddingTop: 17,
              paddingBottom: 17,
            }}
          />
        </Box>
      </Box>
      <Box display="flex" alignItems="center" paddingBottom={1}>
        <FormControl
          variant="outlined"
          sx={{ minWidth: 150 }}
          style={{ marginTop: 9 }}
        >
          <InputLabel id="demo-simple-select-filled-label">
            Tabs (Anzahl / aktuell)
          </InputLabel>
          <Select
            size="small"
            margin="dense"
            label="Tabs (Anzahl / aktuell)"
            labelId="anzahl-tabs-simple-select-filled-label"
            id="anzahl-tabs-simple-select-filled"
            value={tempPanel.tabs.length.toString()}
            onChange={handleTabsAmountChange}
          >
            <MenuItem value={1}>Keine</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
          </Select>
        </FormControl>
        {tempPanel.tabs.length > 1 && (
          <Box
            style={{
              marginLeft: 6,
              backgroundColor: colors.backgroundColor,
              width: "100%",
              borderRadius: "4px",
              border: "1px",
              borderStyle: "solid",
              borderColor: colors.inputFieldOutline,
              display: "flex",
              marginTop: "8px",
            }}
          >
            <FormControl
              component="fieldset"
              style={{
                paddingLeft: 10,
              }}
            >
              <RadioGroup
                row
                aria-label="tabbing"
                name="tabs-row-radio-buttons-group"
                value={
                  currentTabIndex < tempPanel.tabs.length
                    ? currentTabIndex
                    : tempPanel.tabs.length - 1
                }
                onChange={(e, v) => setCurrentTabIndex(parseInt(v))}
              >
                <FormControlLabel
                  value={0}
                  control={
                    <Radio style={{ color: colors.edit, padding: 6.5 }} />
                  }
                  label="1. Tab"
                />
                <FormControlLabel
                  value={1}
                  control={
                    <Radio style={{ color: colors.edit, padding: 6.5 }} />
                  }
                  label="2. Tab"
                />
                {tempPanel.tabs.length > 2 && (
                  <FormControlLabel
                    value={2}
                    control={
                      <Radio style={{ color: colors.primary, padding: 6.5 }} />
                    }
                    label="3. Tab"
                  />
                )}
              </RadioGroup>
            </FormControl>
          </Box>
        )}
      </Box>
      <TabConfigurator
        currentTabIndex={currentTabIndex}
        tempPanel={tempPanel}
        setNewPanelValue={setNewPanelValue}
      />
    </Paper>
  );
}
