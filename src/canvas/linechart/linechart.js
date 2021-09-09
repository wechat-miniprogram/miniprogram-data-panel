import chartBehavior from '../chart-behavior'

const Utils = require('../../utils/util')

const IS_OPEN_DEBUG_LOG = 0
const debugLog = (...args) => {
  if (IS_OPEN_DEBUG_LOG) console.log('[linechart]', ...args)
}

Component({
  behaviors: [chartBehavior],
  properties: {
    config: {
      // 属性名
      type: Object,
      value: {
        // mode:'linechart',
        // echartsOption: {}
        // firstLineOutstanding: true  // 第一条线outstanding
        // hideLegend: false, // 是否有图例
      },
    },
    configKey: {
      type: String,
      value: '',
    },
  },
  data: {
    ec: {
      lazyLoad: true,
    },
    containerId: `container-${Date.now()}`,
    domId: `dom-line-${Date.now()}`,
    ret: 'succ',
    tips: '',
    containerH: 0,
    containerW: 0,
    chartLegend: [],
  },
  observers: {},

  // 组件实例刚刚被创建好时执行，注意此时不能调用 setData
  created() {
    this.debugLog = (...args) => debugLog(`[${this.data.configKey}] `, ...args)
    this._systemInfo = (wx.getSystemInfoSync && wx.getSystemInfoSync()) || {platform: false}
    this._isPC =
      this._systemInfo.platform === 'window' ||
      this._systemInfo.platform === 'mac'
  },

  methods: {
    /* 数据结构
    旧版 [ {date:'周一',value:1} ]，只支持绘制一条线
    新版
    {
      "xAxis": {
        "data": [
          "周一"
        ]
      },
      "series": [
        {
          "name": "线条一",
          "data": [0,1,2]
        },
        {
          "name": "线条二",
          "data": [0,2,9]
        }
      ]
    }
    */

    _updateGrid() {
      const _this = this
      clearTimeout(this._updateGridTime)
      this._updateGridTime = setTimeout(() => {
        const realWitdh = _this.grid.left
        const _curOption = _this.chart.getOption()

        if (_curOption.grid[0] && _curOption.grid[0].left !== _this.grid.left) {
          // 更新
          _curOption.grid[0].left = realWitdh
          _this.chart.setOption(_curOption, true)
        }
      }, 10)
    },

    drawChart(data) {
      const _this = this
      if (!data) return
      this.debugLog('[drawChart] start', data)

      if (!this.chart) {
        this.debugLog('[drawChart] 发现没有chart, initChart')
        this.initChart()
      }

      this.debugLog('[drawChart] 有chart')
      const oldVersionData = data instanceof Array

      if (!this._mergeOption) this._mergeOption = this.mergeEchartsOption()
      const option = this._mergeOption

      if (oldVersionData) {
        // 旧版本数据结构是单条线
        const xLabels = data.map((item) => item.date)
        const values = data.map((item) => +item.value)
        option.xAxis.data = xLabels
        option.series[0].data = values
        option.legend = null
      } else {
        // 新版本支持多条线
        option.xAxis.data = data.xAxis.data

        const seriseLen = data.series && data.series.length || 0
        this._handleLenged(data.series, option.color)

        option.series = []
        for (let i = 0; i < data.series.length; i++) {
          if (!option.series[i]) option.series[i] = Utils.deepCopy(option.series[0])
          const curColor = option.color[i]
          // const name =
          //   data.series[i].name.length > 5
          //     ? `${data.series[i].name.substr(0, 5)}...`
          //     : data.series[i].name // 图例只显示5个字
          option.series[i] = this._getSeriesConfig(
            data.series[i].name,
            data.series[i].data,
            curColor,
            i
          )
          option.series[i].z = seriseLen - i // 第一条先最先展示
        }
      }

      const {valueUnit} = this._getYLabelUnit(option.series)

      option.yAxis.axisLabel.formatter = (value) => {
        const yLabel = Utils.formatNumberWithUnit(value, valueUnit, 1)

        const yLabelLen =
          String(yLabel).replace(/[^\x00-\xff]/gi, 'aa').length + 1
        const realWitdh = 5 + yLabelLen * 11 * 0.5

        _this.grid.left = Math.max(_this.grid.left, realWitdh)

        _this._updateGrid() // 修正
        return yLabel
      }

      option.legend = {show: false}

      if (this.chart) {
        this.hideTips()

        this.debugLog('[drawChart] 画图')
        this.chart.setOption(option, true)

        // setTimeout(() => {
        //   this.chart.setOption(option)
        // }, 200)
      } else {
        this.debugLog('[drawChart] _readyOption 标记')
        this._readyOption = option
      }
    },

    getDefaultEchartsOption() {
      const _this = this

      _this.grid = {
        top: 25,
        bottom: 30,
        left: 30,
        right: 11,
        containLabel: false,
      }

      return {
        color: [
          '#00C777',
          '#10aeff',
          '#6467ef',
          '#32d3eb',
          '#5bc49f',
          '#feb64d',
          '#ff7c7c',
          '#9287e7',
        ], // 颜色
        animation: false, // 关闭动画
        grid: {..._this.grid},
        tooltip: {
          show: true,
          trigger: 'axis',
          confine: true,
          padding: [0, 6],
          borderRadius: 3,
          alwaysShowContent: false,
          // position: 'bottom',
          position(point, params, dom, rect, size) {
            let lineDataLen = 0
            const series = _this.chart.getOption().series || []
            series.forEach(
              (item) => (lineDataLen = Math.max(lineDataLen, item.data.length))
            )

            // console.log('params', params)
            const itemWidth =
              (size.viewSize[0] - _this.grid.left - _this.grid.right) /
              (lineDataLen - 1)
            const curX = _this.grid.left + itemWidth * params[0].dataIndex

            const tipsWidth = size.contentSize[0] || 110
            const midpoint = size.viewSize[0] / 2
            if (curX > midpoint) {
              return [curX - tipsWidth - 10, 0]
            } else {
              return [curX + 10, 0]
            }
          },

          formatter(ev) {
            let str = ev[0].name // 2019.01.02
            ev.forEach((item, i) => {
              let iconstr = '{marker' + i + 'at0|} '
              if (item.seriesName === '1天前') iconstr = '{marker1at0|} '
              else if (item.seriesName === '7天前') iconstr = '{marker2at0|} '

              str +=
                '\n' +
                iconstr +
                item.seriesName +
                ': ' +
                Utils.addComma((Number(item.value.toFixed(2)))) // xxx:xxx
            })
            return str
          },
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          confine: true,
          // data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
          data: [], // xLabel 数据
          show: true,
          axisLine: {
            lineStyle: {
              color: '#C3C3C3',
              width: 1,
              // width:8,//这里是为了突出显示加上的，可以去掉
            },
          },
          // 改变x轴字体颜色和大小
          axisLabel: {
            margin: 10,
            confine: true,
            textStyle: {
              color: '#898989',
              fontSize: '11',
            },
            interval: 'auto',
          },
          splitLine: false,
        },
        yAxis: {
          x: 'center',
          type: 'value',
          scale: true,
          splitLine: {
            // 垂直于Y轴的网格线
            lineStyle: {
              type: 'dashed',
              color: '#EDEDED',
            },
          },
          axisLine: false,
          // 改变x轴字体颜色和大小
          axisLabel: {
            textStyle: {
              color: '#898989',
              fontSize: '11',
            },
          },
          show: true,
        },
        series: [
          {
            name: '数据1',
            type: 'line',
            smooth: true,
            data: [], // 线段数据
            color: 'rgba(16, 174, 255)',
            areaStyle: {
              normal: {
                color: {
                  type: 'linear',
                  x0: 0,
                  y0: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: 'rgba(16, 174, 255, 0.2)',
                    },
                    {
                      offset: 1,
                      color: 'rgba(16, 174, 255, 0.01)',
                    },
                  ],
                  globalCoord: false,
                },
              },
            },
          },
          {
            name: '数据2',
            type: 'line',
            smooth: true,
            data: [], // 线段数据
            color: 'rgba(16, 174, 255)',
            areaStyle: {
              normal: {
                color: {
                  type: 'linear',
                  x0: 0,
                  y0: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: 'rgba(16, 174, 255,0.20)',
                    },
                    {
                      offset: 1,
                      color: 'rgba(16, 174, 255,0.01)',
                    },
                  ],
                  globalCoord: false,
                },
              },
            },
          },
          {
            name: '数据3',
            type: 'line',
            smooth: true,
            data: [], // 线段数据
            color: 'rgba(100,103,239)',
            areaStyle: {
              normal: {
                color: {
                  type: 'linear',
                  x0: 0,
                  y0: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: 'rgba(100,103,239,0.20)',
                    },
                    {
                      offset: 1,
                      color: 'rgba(100,103,239,0.01)',
                    },
                  ],
                  globalCoord: false,
                },
              },
            },
          },
        ],
        legend: {show: false}, // 自定义方式实现
      }
    },

    _getSeriesConfig(name, data, color, idx) {
      const firstLineOutstanding =
        (this.data.config && this.data.config.firstLineOutstanding) || false
      const lineWidth = firstLineOutstanding ? (idx === 0 ? 2 : 1) : 2
      const rgb = Utils.hexToRgb(color)
      return {
        name,
        type: 'line',
        smooth: true,
        symbolSize: 3, // 小圆点大小
        showSymbol: !(this._isPC || data.length > 40), // 默认不展示小圆点，点击时存在
        // symbol: 'none', // 不要小圆点
        data, // 线段数据
        color,
        areaStyle: {
          normal: {
            color: {
              type: 'linear',
              x0: 0,
              y0: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: `rgba(${rgb.r},${rgb.g},${rgb.b}, 0.2)`,
                },
                {
                  offset: 1,
                  color: `rgba(${rgb.r},${rgb.g},${rgb.b}, 0.01)`,
                },
              ],
              globalCoord: false,
            },
          },
        },
        lineStyle: {
          type: 'solid', // 'dotted'虚线 'solid'实线
          width: lineWidth, // 设置线条粗细
        },
      }
    },

    _handleLenged(series, colorList) {
      // 开始处理legend部分
      const chartLegend = series.map((item, idx) => {
        let rgb = null
        const clr = colorList[idx] || '#C5C5C5'

        try {
          rgb = Utils.hexToRgb(clr) // 默认灰色
        } catch (err) {
          console.error('传入的echartsOption.color 无法解析，请传入hex-color')
          rgb = Utils.hexToRgb(clr) // 解析失败-兜底灰色
        }

        return {
          selected: true,
          _color: clr,
          color: clr,
          backgroundColor: `rgba(${rgb.r},${rgb.g},${rgb.b}, 0.1)`,
          label: item.name || item.label,
        }
      })
      this.setData({chartLegend})
    },

    onClickLegend(ev) {
      this.hideTips()
      const targetIdx = ev.currentTarget.dataset.idx
      const list = this.data.chartLegend
      const targetItem = list[targetIdx]
      targetItem.selected = !targetItem.selected
      targetItem.color = targetItem.selected ? targetItem._color : '#C5C5C5'

      const selectedList = this.data.chartLegend.filter(item => item.selected)
      if (selectedList.length < 1) return // 至少选择一个

      const dispatchAction = this.chart && this.chart.dispatchAction
      if (dispatchAction) {
        if (targetItem.selected) {
          dispatchAction({
            type: 'legendSelect',
            name: targetItem.label, // 图例名称
          })
        } else {
          dispatchAction({
            type: 'legendUnSelect',
            name: targetItem.label, // 图例名称
          })
        }
      }

      this.setData({
        chartLegend: list
      })
    },

    hideTips() {
      const dispatchAction = this.chart && this.chart.dispatchAction
      if (dispatchAction) {
        dispatchAction({
          type: 'hideTip'
        })
      }
    },

    _getLegendConfig(label, color, curIdx, lineNumber) {
      const rgb = Utils.hexToRgb(color)

      const position = {}
      if (lineNumber === 1) position.left = 'center'
      else if (lineNumber === 2) {
        if (curIdx === 0) position.left = '20%'
        else position.right = '20%'
      } else if (lineNumber === 3) {
        if (curIdx === 0) position.left = '15%'
        else if (curIdx === 1) position.left = 'center'
        else position.right = '15%'
      }

      return {
        data: [label],
        bottom: 0,
        // right: '10%',
        ...position,
        backgroundColor: `rgba(${rgb.r},${rgb.g},${rgb.b}, 0.1)`,
        borderRadius: 30,
        padding: [8, 15],
        itemWidth: 7,
        itemHeight: 7,
        icon: 'circle',
        textStyle: {
          color: `rgb(${rgb.r},${rgb.g},${rgb.b})`,
        },
      }
    },

    mergeEchartsOption() {
      const defaultConfig = this.getDefaultEchartsOption()
      try {
        const userConfig = this.data.config.echartsOption
        // this.debugLog('userConfig', userConfig)
        if (!userConfig || Object.keys(userConfig).length === 0) return defaultConfig

        Object.keys(userConfig).forEach((key) => {
          if (!userConfig[key] || key === 'lineBgColor') return
          if (!defaultConfig[key]) defaultConfig[key] = userConfig[key]
          // 如果不存在
          else if (
            Object.prototype.toString.call(userConfig[key]) !==
            '[object Object]'
          ) defaultConfig[key] = userConfig[key]
          else {
            Object.assign(defaultConfig[key], userConfig[key]) // 混一下， todo:以后在深层merge
          }
        })

        // 调整颜色
        defaultConfig.colors = this.mergeColorList(
          userConfig.color,
          defaultConfig.color
        )

        // this.debugLog('mergeConfig', defaultConfig)
      } catch (err) {
        console.error('请检查echartsOption字段, 处理失败', err)
      }

      return defaultConfig
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
    },
  },
})
