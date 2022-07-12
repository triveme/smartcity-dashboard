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

const re = new RegExp("^[A-Za-z0-9:_-]+$");
function isValidDataConfigString(str: string) {
  return re.test(str);
}

type TabConfiguratorProps = {
  currentTabIndex: number;
  tempPanel: PanelComponent;
  setNewPanelValue: (key: string, value: any) => void;
};

export function TabConfigurator(props: TabConfiguratorProps) {
  const { currentTabIndex, tempPanel, setNewPanelValue } = props;

  const setNewTabValue = (key: string, value: any) => {
    let newTempTabs = cloneDeep(tempPanel.tabs);
    switch (key) {
      case "name":
        newTempTabs[currentTabIndex].name = value;
        break;
      case "type":
        newTempTabs[currentTabIndex] = cloneDeep(initialTab);
        newTempTabs[currentTabIndex].type = value;
        // conveniently set the height to the smallest possible one
        // if (value === "value") {
        //   setNewPanelValue("height", 150);
        // }
        break;
      case "text":
        newTempTabs[currentTabIndex].text = value;
        break;
      case "aggrMode":
        newTempTabs[currentTabIndex].aggrMode = value;
        break;
      case "apexType":
        if (
          newTempTabs[currentTabIndex].apexType !== value &&
          (value === "donut" ||
            newTempTabs[currentTabIndex].apexType === "donut")
        ) {
          // reset apexSeries + labels on change from/ to donut chart
          newTempTabs[currentTabIndex].apexSeries = [];
          if (newTempTabs[currentTabIndex].apexOptions) {
            delete newTempTabs[currentTabIndex].apexOptions!.labels;
          }
        }
        newTempTabs[currentTabIndex].apexType = value;
        break;
      case "apexOptions":
        newTempTabs[currentTabIndex].apexOptions = value;
        break;
      case "apexMaxValue":
        newTempTabs[currentTabIndex].apexMaxValue = value;
        break;
      case "apexMaxAlias":
        newTempTabs[currentTabIndex].apexMaxAlias = value;
        break;
      case "apexMaxColor":
        newTempTabs[currentTabIndex].apexMaxColor = value;
        break;
      case "timeframe":
        newTempTabs[currentTabIndex].timeframe = value;
        break;
      case "fiwareService":
        if (isValidDataConfigString(value)) {
          newTempTabs[currentTabIndex].fiwareService = value;
        }
        break;
      case "entityId":
        if (isValidDataConfigString(value)) {
          newTempTabs[currentTabIndex].entityId = [value];
        }
        break;
      case "entityIds":
        let idsAreValid = true;
        value.forEach((val: string) => {
          if (!isValidDataConfigString(val)) {
            idsAreValid = false;
          }
        });
        if (idsAreValid) {
          newTempTabs[currentTabIndex].entityId = value;
        }
        break;
      case "attributeKeys":
        let newAttributeForKeys = newTempTabs[currentTabIndex].attribute
          ? cloneDeep(newTempTabs[currentTabIndex].attribute)
          : { keys: [], aliases: [] };
        let allStringsValid = true;
        value.forEach((key: string) => {
          if (!isValidDataConfigString(key)) {
            allStringsValid = false;
          }
        });
        if (allStringsValid) {
          newAttributeForKeys!.keys = cloneDeep(value);
          const keyAliasLenDiff =
            value.length - newAttributeForKeys!.aliases.length;
          // missing aliases and colors, fill them
          if (keyAliasLenDiff > 0) {
            for (
              let i = newAttributeForKeys!.aliases.length;
              i < value.length;
              i++
            ) {
              newAttributeForKeys!.aliases[i] = value[i];
              if (newTempTabs[currentTabIndex].apexOptions?.colors) {
                newTempTabs[currentTabIndex].apexOptions?.colors!.push(
                  colors.primary
                );
              } else {
                set(newTempTabs[currentTabIndex], "apexOptions.colors", [
                  colors.primary,
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
          value.key
        );
        if (keyIndexForAlias !== -1) {
          newAttributeForAliases!.aliases[keyIndexForAlias] = value.alias;
          newTempTabs[currentTabIndex].attribute = newAttributeForAliases;
        }
        break;
      case "attributeDecimals":
        newTempTabs[currentTabIndex].decimals = value;
        break;
    }
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
            onChange={(e) => setNewTabValue("type", e.target.value)}
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
            onChange={(e) => setNewTabValue("name", e.target.value)}
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
            onChange={(e) => setNewTabValue("text", e.target.value)}
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
