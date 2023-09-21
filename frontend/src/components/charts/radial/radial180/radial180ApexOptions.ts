import { ApexOptions } from 'apexcharts'
import colors from 'theme/colors'

export function GetRadial180ApexOptions(
  absoluteValue: number,
  percentValue: number,
  minValue: number,
  maxValue: number,
) {
  let radialOption: ApexOptions = {
    chart: {
      height: 150,
      type: 'radialBar',
      offsetY: -20,
      sparkline: {
        enabled: true,
      },
    },
    series: [percentValue],
    colors: [colors.chartBar],
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: '80%',
        },
        track: {
          background: colors.chartGrid,
          startAngle: -90,
          endAngle: 90,
          strokeWidth: '50%',
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: '30px',
            color: colors.white,
            show: true,
            offsetY: -3,
            formatter: function (val) {
              try {
                return absoluteValue.toFixed(1) + ' '
                // return ((val * maxValue) / 100).toFixed(0) + ' '
              } catch (error) {
                console.warn('PROBLEM: Processing value: ' + val)
                return val + ''
              }
            },
          },
        },
      },
    },
    stroke: {
      lineCap: 'round',
    },
  }
  return radialOption
}
