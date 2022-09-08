import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

import type { TabComponent } from "components/tab";

import { roundDecimalPlaces } from "utils/decimal-helper";

import colors from "theme/colors";

type TabProps = {
  tab: TabComponent;
};

export function Value(props: TabProps) {
  const { tab } = props;

  const renderValues = () => {
    if (tab.values && tab.attribute) {
      let valueArray = [];
      for (let i = 0; i < tab.values.length; i++) {
        valueArray.push(
          <Box key={"value-box-" + i} width="50%" padding={1}>
            <Typography
              fontWeight="bold"
              fontSize="small"
              key={"value-typo-title-" + i}
            >
              {tab.attribute.aliases[i]}
            </Typography>
            <Typography
              fontWeight="bold"
              fontSize={52}
              color={colors.value}
              key={"value-typo-value-" + i}
            >
              {roundDecimalPlaces(tab.values[i], tab.decimals)}
            </Typography>
          </Box>
        );
      }
      return valueArray;
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="flex-start"
        alignItems="center"
        height="inherit"
        padding={1}
      >
        {renderValues()}
      </Box>
      <Box id="valueBottomSpacer" />
    </>
  );
}
