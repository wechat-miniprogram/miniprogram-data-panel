import * as echarts from '../ec-canvas/echarts'
import chartBehavior from '../chart-behavior'

const Utils = require('../../utils/util')

const IS_OPEN_DEBUG_LOG = 0
const debugLog = (...args) => {
  if (IS_OPEN_DEBUG_LOG) console.log('[fenbuchart]', ...args)
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
    domId: `dom-fenbu-${Date.now()}`,
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
    attached() {
      this.debugLog('attached')
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
      this.debugLog('detached')
    },
  },
  methods: {
    // 画图部分
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

      option.yAxis.data = xLabels
      option.series[0].data = values

      if (this.chart) {
        this.debugLog('[drawChart] 画图', option)
        this.chart.setOption(option)
      } else {
        this.debugLog('[drawChart] _readyOption 标记')
        this._readyOption = option
      }
    },

    getDefaultEchartsOption() {
      const option = {
        animation: false, // 关闭动画
        grid: {
          top: 10, // 调整高度
          bottom: 10,
          left: 0,
          right: 10,
          containLabel: true
        },
        textStyle: {
          fontFamily: 'Microsoft YaHei',
          fontSize: 8,
          color: '#575757',
        },

        xAxis: {
          type: 'value',
          axisTick: false, // 不要小刻度线
          splitNumber: 3, // 分多少垂直于x轴的线

          splitLine: { // 垂直于x轴的网格线
            show: true,
            lineStyle: {
              color: '#EDEDED',
              type: 'dashed',
              // opacity: 0.3,
            }
          },

          // 改变x轴字体颜色和大小
          axisLabel: {
            textStyle: {
              color: '#898989',
              fontSize: '11'
            },
            interval: 'auto', // 隔interval个标签显示一个标签
            formatter(value) {
              return Utils.getFormatNumer(value, 2)
            }
          },
        },
        yAxis: {
          type: 'category', // 调整fenbu图，还是bar图
          axisTick: false, // 不要小刻度线
          // 坐标轴线
          axisLabel: {
            textStyle: {
              color: '#898989',
              fontSize: '11'
            },
            interval: 0
          },
          splitLine: false, // 垂直于Y轴的网格线
          axisLine: {
            lineStyle: {
              color: '#C3C3C3',
              width: 1,
              // type: 'sold',
            }
          }
        },
        series: [
          {
            type: 'bar',
            barWidth: 15,
            // barWidth: "60%"
            data: [],
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(
                  1, 0, 0, 0,
                  [
                    {offset: 0, color: '#6467ef'},
                    {offset: 1, color: '#8d90f0'}
                  ]
                )
              },
              emphasis: {
                color: new echarts.graphic.LinearGradient(
                  1, 0, 0, 0,
                  [
                    {offset: 0, color: '#6467ef'},
                    {offset: 1, color: '#8d90f0'}
                  ]
                )
              }
            }
          }],
        tooltip: {
          show: true,
          trigger: 'item', // 必须填axis才有隐形
          axisPointer: {
            type: 'shadow',
          },
          confine: true,
          position: 'right',
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
      this.debugLog('pageLifetimes resize', size)
    }
  },

})
