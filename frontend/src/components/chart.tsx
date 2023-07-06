import { useState, useEffect } from 'react'

import type { TabComponent } from 'components/tab'
import { DonutChart } from 'components/charts/donut'
import { BarChart } from 'components/charts/bar'
import { LineChart } from 'components/charts/line'
import { RadialChart180 } from './charts/radial/radial180/radial180'
import { RadialChart360 } from './charts/radial/radial360'
import { SliderWithKnobs, SliderWithoutKnobs } from './charts/slider/slider'

type TabProps = {
  tab: TabComponent
  height: number
}

export function Chart(props: TabProps) {
  const { tab, height } = props
  const [tickAmountKey, setTickAmountKey] = useState(1)

  function useWindowWidth() {
    const [windowWidth, setWindowWidth] = useState<number | undefined>(undefined)

    useEffect(() => {
      function handleResize() {
        setWindowWidth(window.innerWidth)
      }
      window.addEventListener('resize', handleResize)
      handleResize()
      return () => window.removeEventListener('resize', handleResize)
    }, [])
    return windowWidth
  }

  const windowWidth = useWindowWidth()

  useEffect(() => {
    if (windowWidth) {
      setTickAmountKey(windowWidth)
    } else {
      setTickAmountKey(2)
    }
  }, [windowWidth])

  if (tab.apexType === 'donut') {
    return <DonutChart tab={tab} height={height} />
  } else if (tab.apexType === 'bar') {
    return <BarChart tab={tab} height={height} tickAmountKey={tickAmountKey} windowWidth={windowWidth} />
  } else if (tab.apexType === 'line') {
    return <LineChart tab={tab} height={height} tickAmountKey={tickAmountKey} windowWidth={windowWidth} />
  } else if (tab.apexType === 'radial180') {
    return (
      <RadialChart180
        key={'apex-radial180-' + tab.componentName}
        chartName={tab.componentName}
        minValue={tab.componentMinimum}
        maxValue={tab.componentMaximum}
        currentValue={tab.apexSeries && tab.apexSeries[0] ? tab.apexSeries[0].currentValue : undefined}
        unit={tab.componentUnit}
        icon={tab.componentIcon}
      />
    )
  } else if (tab.apexType === 'radial360') {
    return (
      <RadialChart360
        description={tab.componentDescription}
        currentValue={tab.apexSeries && tab.apexSeries[0] ? tab.apexSeries[0] : 0}
      />
    )
  } else if (tab.apexType === 'slider') {
    return (
      <SliderWithoutKnobs
        name={tab.componentName}
        currentValue={tab.apexSeries && tab.apexSeries[0] ? tab.apexSeries[0] : 0}
        unit={tab.componentUnit}
      />
    )
  } else if (tab.apexType === 'sliderKnobs') {
    return (
      <SliderWithKnobs
        name={tab.componentName}
        currentValue={tab.apexSeries && tab.apexSeries[0] ? tab.apexSeries[0] : tab.componentMaximum - 1}
        maximumValue={tab.componentMaximum}
      />
    )
  } else {
    return <>Invalider Chart-Typ</>
  }
}
