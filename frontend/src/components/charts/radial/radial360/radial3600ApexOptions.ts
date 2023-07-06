import { ApexOptions } from 'apexcharts'
import colors from 'theme/colors'

export function GetRadial360ApexOptions(seriesData: number) {
  let radialOption: ApexOptions = {
    chart: {
      height: 150,
      type: 'radialBar',
      sparkline: {
        enabled: true,
      },
    },
    series: [seriesData],
    colors: [colors.chartBar],
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: '30px',
            color: colors.white,
            show: true,
            offsetY: 13,
            formatter: function (val) {
              return val + '%'
            },
          },
        },
        hollow: {
          size: '60%',
        },
        track: {
          background: colors.chartGrid,
          strokeWidth: '80%',
        },
      },
    },
    stroke: {
      lineCap: 'round',
    },
  }
  return radialOption
}
