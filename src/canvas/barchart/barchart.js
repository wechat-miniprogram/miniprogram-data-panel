import * as echarts from '../ec-canvas/echarts'
import chartBehavior from '../chart-behavior'

const Utils = require('../../utils/util')

const IS_OPEN_DEBUG_LOG = 0
const debugLog = (...args) => {
  if (IS_OPEN_DEBUG_LOG) console.log('[barchart]', ...args)
}

Component({
  behaviors: [chartBehavior],
  properties: {
    config: { // 属性名
      type: Object,
      value: {
        // mode:'linechart'
      }
    },
    configKey: {
      type: String,
      value: ''
    }
  },
  data: {
    ec: {
      lazyLoad: true
    },
    containerId: `container-${Date.now()}`,
    domId: `dom-bar-${Date.now()}`,
    ret: 'succ',
    tips: '',
    containerH: 0,
    containerW: 0,
  },
  observers: {
  },

  // 组件实例刚刚被创建好时执行，注意此时不能调用 setData
  created() {
    this.debugLog = (...args) => debugLog(`[${this.data.configKey}] `, ...args)
  },
  // 2.2.3起，推荐在 lifetimes 声明
  lifetimes: {
  },
  methods: {
    drawChart(data) {
      if (!data) return
      this.debugLog('[drawChart] start', data)
      if (!this.chart) {
        this.debugLog('[drawChart] 发现没有chart, initChart')
        this.initChart()
      }

      this.debugLog('[drawChart] 有chart')
      const xLabels = data.map(item => item.label)
      const values = data.map(item => +item.value)
      const option = this.getDefaultEchartsOption()

      option.xAxis.data = xLabels
      option.series[0].data = values

      // 格式化Y轴
      const {valueUnit} = this._getYLabelUnit(option.series)
      option.yAxis.axisLabel.formatter = (value) => Utils.formatNumberWithUnit(value, valueUnit, 1)

      if (this.chart) {
        this.debugLog('[drawChart] 画图')
        this.chart.setOption(option, true)
      } else {
        this.debugLog('[drawChart] _readyOption 标记')
        this._readyOption = option
      }
    },

    getDefaultEchartsOption() {
      const isWordBreakCnt = this.data.config.isWordBreakCnt || 4
      const option = {
        animation: false, // 关闭动画
        grid: {
          top: 10, // 调整高度
          bottom: 10,
          left: 10,
          right: 0,
          containLabel: true
        },

        xAxis: {
          type: 'category',
          data: [],
          axisTick: false, // 不要小刻度线
          // 坐标轴线
          axisLine: {
            lineStyle: {
              color: '#C3C3C3',
              width: 1, // 这里是为了突出显示加上的，可以去掉
            }
          },
          axisLabel: { // 改变x轴字体颜色和大小
            lineHeight: 16,
            textStyle: {
              color: '#898989',
              fontSize: '11'
            },
            interval: 0, // 隔interval个标签显示一个标签
            formatter(value) {
              if (isWordBreakCnt === -1) return value // 不换行

              if (typeof (value) === 'string' && value.length > isWordBreakCnt) return value.slice(0, isWordBreakCnt) + '\n' + value.slice(isWordBreakCnt)
              else return value
            }
          },
          // axisPointer: {
          //   shadowStyle: {
          //     shadowColor: '#000000',
          //     opacity: 0.3
          //     // shadowColor: 'blue',
          //     // shadowBlur: 10
          //   }
          // }
        },
        yAxis: {
          type: 'value',
          axisLine: false, // 是否要坐标轴这条线
          splitNumber: 3, // 多少条线
          // 坐标轴线
          axisLabel: {
            textStyle: {
              color: '#898989',
              fontSize: '11'
            },
            interval: 'auto',
            // formatter(value) {
            //   // debugLog("linechart formaterr", value)
            //   return Utils.getFormatNumer(value, 2)
            // }
          },
          // 网格线
          splitLine: {
            show: true,
            lineStyle: {
              color: '#EDEDED',
              type: 'dashed',
              // opacity: 0.3,
            }
          }
        },
        series: [
          {
            type: 'bar',
            barWidth: 20,
            // barWidth: "60%"
            data: [],
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                  0, 0, 0, 1,
                  [
                    {offset: 0, color: '#6467ef'},
                    {offset: 1, color: '#8d90f0'}
                  ]
                )
              },
              emphasis: {
                color: new echarts.graphic.LinearGradient(
                  0, 0, 0, 1,
                  [
                    {offset: 0, color: '#6467ef'},
                    {offset: 1, color: '#8d90f0'}
                  ]
                )
              }
            },
            backgroundStyle: {
              color: 'rgba(220, 220, 220, 0.8)'
            }
          }],
        tooltip: {
          show: true,
          trigger: 'item', // 必须填axis才有隐形
          axisPointer: {
            type: 'shadow',
          },
          confine: true,
          position: 'top',
          // opacity: 1,
          // position: (point, params, dom, rect, size) => {
          //   console.log("point", size)
          //   return { top: '3%', left: 'auto' }
          // },
          formatter(params) {
            if (params.name) return params.name + '\n' + Utils.addComma(params.value)
            if (params[0]) return params[0].name + '\n' + Utils.addComma(params[0].value)
            return '-'
          }
        },
      }

      const userConfig = this.data.config.echartsOption || {}
      Object.keys(userConfig).forEach(key => {
        if (!option[key]) option[key] = userConfig[key]
        else Object.assign(option[key], userConfig[key])
      })

      return option
    },
  },
  // 组件所在页面的生命周期
  pageLifetimes: {
    show() {
      // 页面被展示
    },
    hide() {
      // 页面被隐藏
    },
    resize(size) {
      // 页面尺寸变化
      debugLog('pageLifetimes resize', size)
    }
  },

})
