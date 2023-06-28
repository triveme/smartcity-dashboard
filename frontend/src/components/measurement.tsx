import { useState } from "react";
import { Box, Typography } from "@mui/material";
import { IntervalButton } from "./elements/buttons";
import { TabComponent } from "./tab";
import { InfoDisplayComponent } from "./elements/info-display";
import colors from "theme/colors";
import { SingleColumnChart } from "./charts/column";
import { AlarmLineChart } from "./charts/line";
import { ZOO_UTILIZATION_DATA } from "constants/dummy-data";

type UtilizationProps = {
  tab: TabComponent;
};

export function MeasurementComponent(props: UtilizationProps) {
  const { tab } = props;

  const [ dayActive, setDayActive ] = useState(true);
  const [ weekActive, setWeekActive ] = useState(false);
  const [ monthActive, setMonthActive ] = useState(false);
  const [ dataValues, setDataValues ] = useState([]);
  const [ dataDates, setDataDates ] = useState([]);
  
  const handleIntervalClick = (interval: string) => {
    switch (interval) {
      case "day":
        setDayActive(true);
        setWeekActive(false);
        setMonthActive(false);
        // setDataValues(data.valuesDay);
        // setDataDates(data.dateDay);
        break;
      case "week":
        setDayActive(false);
        setWeekActive(true);
        setMonthActive(false);
        // setDataValues(data.valuesWeek);
        // setDataDates(data.dateWeek);
        break;
      case "month":
        setDayActive(false);
        setWeekActive(false);
        setMonthActive(true);
        // setDataValues(data.valuesMonth);
        // setDataDates(data.dateMonth);
        break;
      default:
        break;
    }
  }

  return(
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      width="100%"
    >
      {/* Filter-Box */}
      <Box
        display={"flex"}
        flexDirection={"row"}
        alignItems={"flex-start"}
        gap={"10px"}
        flexBasis="15%"
        height="100%"
        width="100%"
      >
        <IntervalButton text="HEUTE" active={dayActive} onClick={() => handleIntervalClick("day")}></IntervalButton>
        <IntervalButton text="WOCHE" active={weekActive} onClick={() => handleIntervalClick("week")}></IntervalButton>
        <IntervalButton text="MONAT" active={monthActive} onClick={() => handleIntervalClick("month")}></IntervalButton>
      </Box>
      {/* Handler-Box */}
      <Box
        display="flex"
        flexDirection="row"
        flexBasis="85%"
        height="100%"
        width="100%"
      >
        {/* Chart-Holder-Box */}
        <Box
          display="flex"
          flexDirection="column"
          flexBasis="80%"
        >
          {/* Chart */}
          <Box
            flexBasis={dayActive ? "90%" : "100%"}
            height="100%"
            width="100%"
          >
            {dayActive ? (
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="center"
                alignItems="flex-start"
              >
                <Typography color={colors.iconColor} sx={{fontSize:"120px"}}>18.29</Typography>
                <Typography color={colors.grey} sx={{fontSize:"40px"}}>cm</Typography>
              </Box>
            ) : null}
            {weekActive ? (
              <AlarmLineChart
                data={ZOO_UTILIZATION_DATA.valuesWeek}
                timeValue={ZOO_UTILIZATION_DATA.dateWeek}
                warningValue={tab.componentWarning}
                alarmValue={tab.componentAlarm}
                maxValue={tab.componentMaximum}
              />
            ) : null}
            {monthActive ? (
              <AlarmLineChart
                data={ZOO_UTILIZATION_DATA.valuesMonth}
                timeValue={ZOO_UTILIZATION_DATA.dateMonth}
                warningValue={tab.componentWarning}
                alarmValue={tab.componentAlarm}
                maxValue={tab.componentMaximum}
              />
            ) : null}
          </Box>
          {/* Infobox */}
          {dayActive ? (
            <Box
              flexBasis={"10%"}
              display="flex"
              flexDirection="row"
              height="100%"
              justifyContent="space-evenly"
              alignItems="flex-end"
            >
              <InfoDisplayComponent headline={"Mittelwert"} icon={""} iconColor={""} value={"30 cm"}></InfoDisplayComponent>
              <InfoDisplayComponent headline={"Abweichung"} icon={"IconArrowWaveRightDown"} iconColor={colors.iconColor} value={"-60 %"}></InfoDisplayComponent>
              <InfoDisplayComponent headline={"Warnung"} icon={"IconPoint"} iconColor={colors.orange} value={"130 cm"}></InfoDisplayComponent>
              <InfoDisplayComponent headline={"Alarm"} icon={"IconPoint"} iconColor={colors.pink} value={"210 cm"}></InfoDisplayComponent>
            </Box>
          ) : null}
        </Box>
        {/* Single-Column-Box */}
        <Box
          key={"single-column-box" + (tab._id ? tab._id : tab.uid)}
          display="flex"
          flexDirection="column"
          flexBasis="20%"
          height="100%"
          width="100%"
          alignItems="center"
          justifyContent="center"
        >
          {/* Column Chart */}
          <Box
            flexBasis={"90%"}
            display="flex"
            flexDirection="column"
            justifyContent="space-evenly"
            alignItems="flex-end"
            height="100%"
            width="100%"
          >
            <SingleColumnChart
              data={[18.29]}
              timeValue={["13.01.2023"]}
              warningValue={tab.componentWarning}
              alarmValue={tab.componentAlarm}
              maxValue={tab.componentMaximum}
            />
          </Box>
          {/* Description Box */}
          <Box flexBasis={"10%"}>
            <Typography color={colors.white}>Pegelstand aktuell</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}