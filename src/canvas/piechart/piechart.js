import chartBehavior from '../chart-behavior'

const Utils = require('../../utils/util')

const IS_OPEN_DEBUG_LOG = 0
const debugLog = (...args) => {
  if (IS_OPEN_DEBUG_LOG) console.log('[piechart]', ...args)
}

Component({
  behaviors: [chartBehavior],
  properties: {
    config: { // 属性名
      type: Object,
      value: {
        //  mode: 'piechart', // 使用什么图表
        // label: null, // 小标题
        // tableHeader: ["性别", "用户数", "占比"],
        // showTable: true,
        // hasLegend: true, // 控制是否有图例
        // isNeedSort: true, // 是否要排序
        // banNumberAutoAddComm: true, // 禁止数字自动加千位分隔符
        // echartsOption: {
        //   color: ['#3FBEFF', '#8385F3', '#FA9D3B']
        // },
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
    domId: `dom-pie-${Date.now()}`,
    ret: 'succ',
    tips: '', // 提示
    containerH: 0,
    containerW: 0,

    chartLegend: [],
    showTable: false,
    tableHeader: [],
    tableBody: []
  },
  observers: {
  },

  // 组件实例刚刚被创建好时执行，注意此时不能调用 setData
  created() {
    this.debugLog = (...args) => debugLog(`[${this.data.configKey}] `, ...args)
  },

  methods: {
    // 画图
    drawChart(data, isTapLegend) {
      // hideIdx
      // const data = {
      //   categoryLabel: '性别',
      //   valueLabel: '用户数',
      //   values: [
      //     { label: '男', value: '19231' },
      //     { label: '女', value: '21211' },
      //     { label: '未知', value: '223' }]
      // }
      if (!data) return

      if (!this.data.config.isKeepDataSort && !isTapLegend) {
        data.sort((itemA, itemB) => itemB.value - itemA.value)
      }

      if (!isTapLegend) {
        data.forEach(item => item.isShow = true)
        this._sourceResultData = data // 保留给tapLegend记录
      }

      if (!this.chart) this.initChart()
      const option = this.getDefaultEchartsOption() // chart 的option

      const curColor = this.mergeColorList((this.data.config.echartsOption && this.data.config.echartsOption.color) || null, option.color)

      option.color = data.map((item, idx) => (item.isShow ? curColor[idx] : null)).filter(item => item)

      option.series[0].data = data.map(item => {
        if (!item.isShow) return null
        return {
          value: isNaN(item.value) ? 0 : +item.value,
          name: item.label || item.name
        }
      }).filter(item => item)

      option.legend = false // 单独处理： echart自带的无法很好的布局管控

      if (this.chart) {
        this.debugLog('[drawChart] 画图', option)
        this.chart.setOption(option)
      } else {
        this.debugLog('[drawChart] _readyOption 标记')
        this._readyOption = option
      }

      // 开始处理legend部分
      const legend = data.map((item, idx) => {
        let rgb = null
        const clr = curColor[idx] || '#C5C5C5'

        try {
          rgb = Utils.hexToRgb(clr) // 默认灰色
        } catch (err) {
          console.error('传入的echartsOption.color 无法解析，请传入hex-color')
          rgb = Utils.hexToRgb(clr) // 解析失败-兜底灰色
        }

        return {
          color: item.isShow ? clr : '#C5C5C5',
          backgroundColor: `rgba(${rgb.r},${rgb.g},${rgb.b}, 0.1)`,
          label: item.name || item.label,
        }
      })
      this.setData({chartLegend: legend})

      // 处理图表
      this.renderTable(data)
    },

    getDefaultEchartsOption() {
      const option = {
        // tooltip: {
        //   trigger: 'item',
        //   formatter: '{a} <br/>{b}: {c} ({d}%)'
        // },
        color: ['#32d3eb', '#5bc49f', '#FB7373', '#FA9D3B', '#576B95', '#FA9D3B', '#0E7CE2', '#FF8352', '#E271DE', '#F8456B', '#00FFFF', '#4AEAB0'], // 目前只支持hex格式
        legend: [{
          data: ['直接访问'],
          bottom: 0,
          left: '5%',
          backgroundColor: 'rgba(16,174,255,0.10)',
          borderRadius: 30,
          padding: [8, 15],
          itemWidth: 7,
          itemHeight: 7,
          icon: 'circle',
          textStyle: {
            color: 'rgba(16,174,255)'
          }
        }, {
          data: ['邮件营销'],
          bottom: 0,
          // right: '10%',
          backgroundColor: 'rgba(100,103,239,0.10)',
          borderRadius: 30,
          padding: [8, 15],
          itemWidth: 7,
          itemHeight: 7,
          icon: 'circle',
          textStyle: {
            color: 'rgba(100,103,239)'
          }
        }, {
          data: ['联盟广告'],
          bottom: 0,
          right: '5%',
          backgroundColor: 'rgba(100,103,239,0.10)',
          borderRadius: 30,
          padding: [8, 15],
          itemWidth: 7,
          itemHeight: 7,
          icon: 'circle',
          textStyle: {
            color: 'rgba(100,103,239)'
          }
        }],
        title: false,
        animation: false,
        tooltip: false,
        hoverLink: false,
        // legendHoverLink: false,
        series: [
          {
            // name: '访问来源',
            type: 'pie',
            radius: ['50%', '90%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '30',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              {value: 335, name: '直接访问'},
              {value: 310, name: '邮件营销'},
              {value: 234, name: '联盟广告'},
              {value: 135, name: '视频广告'},
              {value: 1548, name: '搜索引擎'}
            ]
          }
        ]
      }
      return option
    },

    onClickLegend(ev) {
      debugLog('onClickLegend', ev)
      const targetIdx = ev.currentTarget.dataset.idx
      if (!this._sourceResultData) return
      const oldIsShow = this._sourceResultData[targetIdx].isShow
      if (oldIsShow) {
        const showCount = this._sourceResultData.reduce((acc, item) => acc + (item.isShow ? 1 : 0), 0)
        if (showCount === 1) return // 剩最后一个，不触发点击图例
      }

      this._sourceResultData[targetIdx].isShow = !this._sourceResultData[targetIdx].isShow
      this.drawChart(this._sourceResultData, true)
    },

    renderTable(data) {
      const config = this.data.config
      const configHeader = config.tableHeader || []
      if (configHeader.length === 0 || !config.showTable) return

      const tableHeader = [
        {value: configHeader[0] || '类别', style: 'text'},
        {value: configHeader[1] || '数据', style: 'number'},
        {value: configHeader[2] || '占比', style: 'number'}
      ]

      let sum = 0
      data.forEach(item => sum += isNaN(item.value) ? 0 : +item.value)

      const tableBody = []
      data.forEach(item => {
        if (!item.isShow) return
        let curValue = item.value
        if (!isNaN(item.value) && !this.data.config.banNumberAutoAddComm) {
          curValue = Utils.addComma(curValue)
        }
        tableBody.push([
          {value: item.label || item.name, valueUnit: '', style: 'text'},
          {value: curValue, valueUnit: '', style: 'number'},
          {value: sum === 0 ? '-' : `${((item.value / sum) * 100).toFixed(2)}%`, valueUnit: '', style: 'number'}])
      })

      // 最后一行没有border-bottom
      const lastRow = tableBody.length - 1
      tableBody[lastRow].forEach(ceil => {
        ceil.css = (ceil.css || '') + 'border-bottom: 1px solid transparent;'
      })

      this.setData({
        showTable: true,
        tableHeader,
        tableBody
      })
    },

    postImage(e) {
      this.triggerEvent('postImage', {
        ...e.detail
      })
    }
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
