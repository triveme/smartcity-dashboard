import { useState, useEffect } from "react";

import type { TabComponent } from "components/tab";
import { DonutChart } from "components/charts/donut";
import { BarChart } from "components/charts/bar";
import { LineChart } from "components/charts/line";

type TabProps = {
  tab: TabComponent;
  height: number;
};

export function Chart(props: TabProps) {
  const { tab, height } = props;
  const [tickAmountKey, setTickAmountKey] = useState(1);

  function useWindowWidth() {
    const [windowWidth, setWindowWidth] =
      useState<number | undefined>(undefined);
    useEffect(() => {
      function handleResize() {
        setWindowWidth(window.innerWidth);
      }
      window.addEventListener("resize", handleResize);
      handleResize();
      return () => window.removeEventListener("resize", handleResize);
    }, []);
    return windowWidth;
  }

  const windowWidth = useWindowWidth();

  useEffect(() => {
    if (windowWidth) {
      setTickAmountKey(windowWidth);
    } else {
      setTickAmountKey(2);
    }
  }, [windowWidth]);

  if (tab.apexType === "donut") {
    return <DonutChart tab={tab} height={height} />;
  } else if (tab.apexType === "bar") {
    return (
      <BarChart
        tab={tab}
        height={height}
        tickAmountKey={tickAmountKey}
        windowWidth={windowWidth}
      />
    );
  } else if (tab.apexType === "line") {
    return (
      <LineChart
        tab={tab}
        height={height}
        tickAmountKey={tickAmountKey}
        windowWidth={windowWidth}
      />
    );
  } else {
    return <>Invalider Chart-Typ</>;
  }
}
