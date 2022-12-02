import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import cloneDeep from "lodash/cloneDeep";
import set from "lodash/set";

import { initialTab } from "components/architectureConfig/initial-components";
import { PanelComponent } from "components/panel";
import { ChartConfigurator } from "components/architectureConfig/chart-configurator";
import { ValueConfigurator } from "components/architectureConfig/value-configurator";
import { SmallField } from "components/elements/text-fields";

import colors from "theme/colors";

const re = new RegExp("^[A-Z.a-z0-9:_-]+$");
function isValidDataConfigString(str: string) {
  return re.test(str);
}

type TabConfiguratorProps = {
  currentTabIndex: number;
  tempPanel: PanelComponent;
  setNewPanelValue: (key: string, value: any) => void;
};

type newTabValue = {
  key: string;
  tabValue: any;
};

export function TabConfigurator(props: TabConfiguratorProps) {
  const { currentTabIndex, tempPanel, setNewPanelValue } = props;

  const setNewTabValue = (newTabValues: newTabValue[]) => {
    let newTempTabs = cloneDeep(tempPanel.tabs);
    newTabValues.forEach((newTabValue) => {
      switch (newTabValue.key) {
        case "name":
          newTempTabs[currentTabIndex].name = newTabValue.tabValue;
          break;
        case "type":
          newTempTabs[currentTabIndex] = cloneDeep(initialTab);
          newTempTabs[currentTabIndex].type = newTabValue.tabValue;
          // conveniently set the height to the smallest possible one
          // if (value === "value") {
          //   setNewPanelValue("height", 150);
          // }
          break;
        case "text":
          newTempTabs[currentTabIndex].text = newTabValue.tabValue;
          break;
        case "aggrMode":
          newTempTabs[currentTabIndex].aggrMode = newTabValue.tabValue;
          break;
        case "apexType":
          if (
            newTempTabs[currentTabIndex].apexType !== newTabValue.tabValue &&
            (newTabValue.tabValue === "donut" ||
              newTempTabs[currentTabIndex].apexType === "donut")
          ) {
            // reset apexSeries + labels on change from/ to donut chart
            newTempTabs[currentTabIndex].apexSeries = [];
            if (newTempTabs[currentTabIndex].apexOptions) {
              delete newTempTabs[currentTabIndex].apexOptions!.labels;
            }
          }
          newTempTabs[currentTabIndex].apexType = newTabValue.tabValue;
          break;
        case "apexOptions":
          newTempTabs[currentTabIndex].apexOptions = newTabValue.tabValue;
          break;
        case "apexMaxValue":
          newTempTabs[currentTabIndex].apexMaxValue = newTabValue.tabValue;
          break;
        case "apexMaxAlias":
          newTempTabs[currentTabIndex].apexMaxAlias = newTabValue.tabValue;
          break;
        case "apexMaxColor":
          newTempTabs[currentTabIndex].apexMaxColor = newTabValue.tabValue;
          break;
        case "timeframe":
          newTempTabs[currentTabIndex].timeframe = newTabValue.tabValue;
          break;
        case "fiwareService":
          if (isValidDataConfigString(newTabValue.tabValue)) {
            newTempTabs[currentTabIndex].fiwareService = newTabValue.tabValue;
          }
          break;
        case "entityId":
          if (isValidDataConfigString(newTabValue.tabValue)) {
            newTempTabs[currentTabIndex].entityId = [newTabValue.tabValue];
          }
          break;
        case "entityIds":
          let idsAreValid = true;
          newTabValue.tabValue.forEach((val: string) => {
            if (!isValidDataConfigString(val)) {
              idsAreValid = false;
            }
          });
          if (idsAreValid) {
            newTempTabs[currentTabIndex].entityId = newTabValue.tabValue;
          }
          break;
        case "attributeKeys":
          let newAttributeForKeys = newTempTabs[currentTabIndex].attribute
            ? cloneDeep(newTempTabs[currentTabIndex].attribute)
            : { keys: [], aliases: [] };
          let allStringsValid = true;
          newTabValue.tabValue.forEach((key: string) => {
            if (!isValidDataConfigString(key)) {
              allStringsValid = false;
            }
          });
          if (allStringsValid) {
            newAttributeForKeys!.keys = cloneDeep(newTabValue.tabValue);
            const keyAliasLenDiff =
              newTabValue.tabValue.length - newAttributeForKeys!.aliases.length;
            // missing aliases and colors, fill them
            if (keyAliasLenDiff > 0) {
              for (
                let i = newAttributeForKeys!.aliases.length;
                i < newTabValue.tabValue.length;
                i++
              ) {
                newAttributeForKeys!.aliases[i] = newTabValue.tabValue[i];
                if (newTempTabs[currentTabIndex].apexOptions?.colors) {
                  newTempTabs[currentTabIndex].apexOptions?.colors!.push(
                    colors.attributeColors[0]
                  );
                } else {
                  set(newTempTabs[currentTabIndex], "apexOptions.colors", [
                    colors.attributeColors[0],
                  ]);
                }
              }
            }
            // too many aliases and colors, pop them
            if (keyAliasLenDiff < 0) {
              for (let i = keyAliasLenDiff; i < 0; i++) {
                newAttributeForKeys!.aliases.pop();
                if (newTempTabs[currentTabIndex].apexOptions?.colors) {
                  newTempTabs[currentTabIndex].apexOptions?.colors!.pop();
                }
              }
            }
            newTempTabs[currentTabIndex].attribute = newAttributeForKeys;
            newTempTabs[currentTabIndex].apexMaxColor = newTempTabs[
              currentTabIndex
            ].apexMaxColor
              ? newTempTabs[currentTabIndex].apexMaxColor
              : colors.attributeColors[0];
          }
          break;
        case "attributeAlias":
          let newAttributeForAliases = newTempTabs[currentTabIndex].attribute
            ? cloneDeep(newTempTabs[currentTabIndex].attribute)
            : { keys: [], aliases: [] };
          const keyIndexForAlias = newAttributeForAliases!.keys.indexOf(
            newTabValue.tabValue.key
          );
          if (keyIndexForAlias !== -1) {
            newAttributeForAliases!.aliases[keyIndexForAlias] =
              newTabValue.tabValue.alias;
            newTempTabs[currentTabIndex].attribute = newAttributeForAliases;
          }
          break;
        case "attributeDecimals":
          newTempTabs[currentTabIndex].decimals = newTabValue.tabValue;
          break;
        case "apexSeries":
          newTempTabs[currentTabIndex].apexSeries = newTabValue.tabValue;
          break;
      }
    });

    setNewPanelValue("tabs", newTempTabs);
  };

  return (
    <>
      <Box display="flex" alignItems="center">
        <FormControl
          variant="outlined"
          sx={{ minWidth: 150 }}
          style={{
            marginBottom: 4,
            marginTop: 4,
          }}
        >
          <InputLabel id="typ-simple-select-filled-label">Typ</InputLabel>
          <Select
            size="small"
            margin="dense"
            variant="outlined"
            label="Typ"
            labelId="typ-simple-select-filled-label"
            id="typ-simple-select-filled"
            value={
              tempPanel.tabs[currentTabIndex]
                ? tempPanel.tabs[currentTabIndex].type
                : tempPanel.tabs[0].type
            }
            onChange={(e) =>
              setNewTabValue([{ key: "type", tabValue: e.target.value }])
            }
          >
            <MenuItem value="description">Beschreibung</MenuItem>
            <MenuItem value="chart">Chart</MenuItem>
            {tempPanel.tabs && tempPanel.tabs.length === 1 ? (
              <MenuItem value="value">Wert(e)</MenuItem>
            ) : null}
          </Select>
        </FormControl>
        {tempPanel.tabs.length > 1 && (
          <SmallField
            label="Tabname"
            type="text"
            customStyle={{
              marginTop: 4,
              marginLeft: 6,
            }}
            value={
              tempPanel.tabs[currentTabIndex]
                ? tempPanel.tabs[currentTabIndex].name
                : ""
            }
            onChange={(e) =>
              setNewTabValue([{ key: "name", tabValue: e.target.value }])
            }
          />
        )}
      </Box>
      {tempPanel.tabs[currentTabIndex] ? (
        tempPanel.tabs[currentTabIndex].type === "description" ? (
          <SmallField
            customStyle={{
              marginTop: 10,
            }}
            label="Beschreibungstext"
            type="text"
            multiline
            value={
              tempPanel.tabs[currentTabIndex].text
                ? tempPanel.tabs[currentTabIndex].text
                : ""
            }
            onChange={(e) =>
              setNewTabValue([{ key: "text", tabValue: e.target.value }])
            }
          />
        ) : tempPanel.tabs[currentTabIndex].type === "chart" ? (
          <ChartConfigurator
            currentTabIndex={currentTabIndex}
            tempPanel={tempPanel}
            setNewTabValue={setNewTabValue}
          />
        ) : tempPanel.tabs[currentTabIndex].type === "value" ? (
          <ValueConfigurator
            currentTabIndex={currentTabIndex}
            tempPanel={tempPanel}
            setNewTabValue={setNewTabValue}
          />
        ) : null
      ) : null}
    </>
  );
}
