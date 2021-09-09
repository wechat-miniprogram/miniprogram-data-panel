// let commentCostAVG = 0
// let commmentCnt = 0
import * as echarts from './ec-canvas/echarts'

const Utils = require('../utils/util')

export default Behavior({
  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      this.debugLog('attached, 开始selectCharts')
      this.selectCharts()
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
      this.debugLog('detached')
      clearTimeout(this._selectTimer)

      if (this.chart && this.chart.dispose) {
        this.debugLog('detached chart dispose')
        this.chart.dispose()
        this.chart = null
      }
    },
  },
  methods: {
    selectCharts() {
      clearTimeout(this._selectTimer)

      if (this.__selectChartsLock) return
      this.__selectChartsLock = true // 加锁

      this.debugLog('[selectCharts] 开始')

      const query = wx.createSelectorQuery().in(this)
      query.select(`#${this.data.containerId}`).boundingClientRect()
      query.exec((rect) => {
        this.__selectChartsLock = false // 释放锁

        this.debugLog('[selectCharts] 查询节点=', rect)

        if (!rect || !rect[0]) {
          this.debugLog('[selectCharts] 没有节点, return ')
          return
        }

        if (!rect[0].height || !rect[0].width) {
          // this.debugLog('[selectCharts] 可能是hide导致宽高为0, rect=',rect)
          // 可能是一开始hidden导致, 需要轮训
          this._selectTimer = setTimeout(() => {
            this.selectCharts()
          }, 100)
          return
        }

        this.debugLog('[selectCharts] 获取到宽高', {h: rect[0].height, w: rect[0].width})
        this.data.containerH = rect[0].height
        this.data.containerW = rect[0].width

        this.ecComponent = this.selectComponent(`#${this.data.domId}`)
        if (this._isNeedInitChart) this.initChart()
      })
    },

    initChart() {
      if (!this.ecComponent) {
        this.debugLog('[initChart] 但是还没有ecComponent')
        this._isNeedInitChart = 1 // 标记好，等待selectCharts执行后，再执行initChart()
        this.selectCharts() // 重试
        return
      }

      if (this.__initChartLock) return
      this.__initChartLock = true // 加锁

      this.debugLog('[initChart] start init')
      this.ecComponent.init((canvas, width, height, dpr) => {
        this.debugLog('[initChart] ecComponent.init', {width, height, dpr})

        // 获取组件的 canvas、width、height 后的回调函数
        const chart = echarts.init(canvas, null, {
          width: this.data.containerW,
          height: this.data.containerH,
          devicePixelRatio: dpr // new
        })
        this.chart = chart
        this.debugLog('[initChart] chart succ', this.chart)

        if (this._readyOption) {
          this.debugLog('[initChart] 画图 _readyOption', this._readyOption)
          this.chart.setOption(this._readyOption, true)
          this._readyOption = null
        }

        this.initLengedMustHasOne(chart)
        this.__initChartLock = false // 释放锁

        // 注意这里一定要返回 chart 实例，否则会影响事件处理等
        return chart
      })
    },

    initLengedMustHasOne(chart) {
      chart.on('legendselectchanged', params => {
        const selected = params.selected
        const count = Object.keys(selected).reduce((acc, val) => acc + (selected[val] ? 1 : 0), 0)

        if (count === 0) {
          chart.dispatchAction({
            type: 'legendSelect',
            name: params.name
          })
        }
      })
    },

    setOption(result) {
      clearTimeout(this.reduceUpdateTimer)
      this.reduceUpdateTimer = setTimeout(() => {
        if (!this._inner_preResutString) this._inner_preResutString = JSON.stringify(result) // 上一次结果
        else {
          const _MD5 = JSON.stringify(result)
          if (_MD5 === this._inner_preResutString) {
            this.debugLog('[setOption] 命中相同 return')
            return // 不再绘制
          }

          this._inner_preResutString = _MD5 // 不相同则保留一下
        }
        this._setOption(result)
      }, 16)
    },

    _setOption(result) {
      this.debugLog('setOption', {ret: result.ret, result})
      this._readyOption = null // clear

      let tips = typeof (result.data) === 'string' ? result.data : ''

      const isEmpty = result.ret === 'succ' && (!result.data || !result.data.length === 0)
      if (isEmpty) {
        result.ret = 'empty'
        tips = tips || '暂无数据'
      }

      this.setData({
        ret: result.ret,
        tips: result.ret !== 'succ' ? tips : ''
      }, () => {
        // 手机端有坑，如果第一次canvas被display=none会画不出来。
        // 所以要等ret设置之后，再init再绘图
        if (result.ret === 'succ') this.drawChart(result.data)
      })
    },

    mergeColorList(userColor, defaultColor) {
      if (!userColor || userColor.length === 0) return defaultColor

      const mapFlag = {}
      userColor.forEach(item => mapFlag[item] = 1)

      const newColorList = [].concat(userColor)
      defaultColor.forEach(item => {
        if (!mapFlag[item]) newColorList.push(item)
      })
      return newColorList
    },

    _getYLabelUnit(series) {
      let max = -Infinity
      let min = Infinity
      series.forEach(item => {
        item.data.forEach(val => {
          max = Math.max(max, val)
          min = Math.min(min, val)
        })
      })
      const realMax = Math.max(Math.abs(max), Math.abs(min))

      const valueUnit = Utils.getFormatNumerUnit(realMax)

      const maxValueStr = Utils.formatNumberWithUnit(realMax, valueUnit, 1)
      const maxValueStrLen = String(maxValueStr).replace(/[^\x00-\xff]/gi, 'aa').length + 1
      const gridLeft = 5 + Math.ceil(maxValueStrLen * 11 * 0.5)

      return {
        valueUnit,
        gridLeft
      }
    },
  }

})
