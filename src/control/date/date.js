const Utils = require('../../utils/util')

const IS_OPEN_DEBUG_LOG = 0
const debugLog = (...args) => {
  if (IS_OPEN_DEBUG_LOG) console.warn('[date]', ...args)
}

Component({
  properties: {
    filterIndex: { // 第几个，getData时候需要用
      type: Number
    },
    config: { // 属性名
      type: Object,
      value: {
        // label: '选择日期',
        // format: 'yyyy-MM-dd hh:mm', // 格式
        // limit: {
        //   start: '2019-01-01',
        //   end: '2019-07-01',
        //   begin_yesterday: true, // 从昨天开始计算
        //   last_days: 7, // 指定最近7天
        // },
        // default: '2019-07-01', // 默认展示
      }
    },
  },
  data: {
    dateFields: 'day',
    showTimePicker: false,

    limitStart: '2019-01-01',
    limitEnd: '2019-02-02',

    date: '2019-02-02', // 传入
    time: '00:00',
  },
  observers: {
    config(val) {
      if (val) this._initConfig()
    }
  },

  // 组件实例刚刚被创建好时执行，注意此时不能调用 setData
  created() {
    debugLog('component created')
  },
  // 2.2.3起，推荐在 lifetimes 声明
  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      debugLog('attached')
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
      debugLog('detached')
    },
  },
  methods: {
    _initConfig() {
      debugLog('_initConfig', this.data.config)
      const config = this.data.config

      let {limitStart, limitEnd} = this._getLimitRange()
      debugLog('limitEnd', limitEnd)

      // 如果没有默认时间，用limitEnd
      const defaultDate = Utils.isNaNDate(config.default) ? new Date(limitEnd.getTime()) : new Date(config.default)

      // yyyy-MM-dd hh:mm:ss
      let _format = config.format || 'yyyy-MM-dd'
      debugLog('_format', _format)
      if (_format === 'YYYY-MM-DD') _format = 'yyyy-MM-dd' // 兼容老版本

      const defaultDateStr = Utils.formatTimeStr(defaultDate.getTime(), _format)
      debugLog('defaultDateStr', defaultDateStr)
      const curOpt = {
        ...this._getTimeFields(_format),
        ...this._getDateFields(_format)
      }

      if (curOpt.showTimePicker && curOpt.showDatePicker) {
        curOpt.date = defaultDateStr.split(' ')[0]
        curOpt.time = defaultDateStr.split(' ')[1]
      } else if (curOpt.showTimePicker) {
        curOpt.time = defaultDateStr
        curOpt.date = Utils.formatTimeStr(defaultDate.getTime(), 'yyyy-MM-dd')
      } else if (curOpt.showDatePicker) {
        curOpt.date = defaultDateStr
      }

      // 修正一下limit范围
      if (Date.parse(config.default) !== 'NaN') {
        if ((defaultDate.getTime() > limitEnd.getTime())) {
          limitEnd = new Date(defaultDate.getTime())
        }
        if ((defaultDate.getTime() < limitStart.getTime())) {
          limitStart = new Date(defaultDate.getTime())
        }
      }

      debugLog('curOpt', {
        limitStart: Utils.formatTimeStr(limitStart.getTime(), 'yyyy-MM-dd'),
        limitEnd: Utils.formatTimeStr(limitEnd.getTime(), 'yyyy-MM-dd'),
        ...curOpt
      })

      this.setData({
        limitStart: Utils.formatTimeStr(limitStart.getTime(), 'yyyy-MM-dd'),
        limitEnd: Utils.formatTimeStr(limitEnd.getTime(), 'yyyy-MM-dd'),
        ...curOpt
      })

      this.callback()
    },

    _getLimitRange() {
      const config = this.data.config
      const limit = config.limit || {}

      let limitEnd = new Date()
      let limitStart = new Date()
      limitStart.setDate(limitEnd.getDate() - 90) // 默认是最近90天

      // 结束
      if (!Utils.isNaNDate(limit.end)) {
        limitEnd = new Date(limit.end)
      }

      // 开始
      if (!Utils.isNaNDate(limit.start)) {
        limitStart = new Date(limit.start)
        if (limitStart.getTime() > limitEnd.getTime()) limitStart = new Date(limitEnd.getTime())
      }

      if (limit && limit.last_days) { // 最近多少天
        limitEnd = new Date()
        if (limit.begin_yesterday) {
          limitEnd.setDate(limitEnd.getDate() - 1)
        }
        const num = +limit.last_days + (limit.begin_yesterday ? 1 : 0)
        limitStart.setDate(limitEnd.getDate() - num)
      }
      return {limitStart, limitEnd}
    },
    _getTimeFields(format) {
      // yyyy-MM-dd hh:mm:ss
      if (format.indexOf('s') >= 0) return {showTimePicker: true, timeFields: 'second'}
      if (format.indexOf('m') >= 0) return {showTimePicker: true, timeFields: 'second'}
      if (format.indexOf('h') >= 0) return {showTimePicker: true, timeFields: 'second'}
      return {showTimePicker: false}
    },

    _getDateFields(format) {
      // yyyy-MM-dd hh:mm:ss
      if (format.indexOf('d') >= 0) return {showDatePicker: true, timeFields: 'day'}
      if (format.indexOf('M') >= 0) return {showDatePicker: true, timeFields: 'month'}
      if (format.indexOf('y') >= 0) return {showDatePicker: true, timeFields: 'year'}
      return {showDatePicker: false}
    },

    onTap() {
      const myEventDetail = {} // detail对象，提供给事件监听函数
      const myEventOption = {} // 触发事件的选项
      this.triggerEvent('myevent', myEventDetail, myEventOption)
    },

    bindDateChange(ev) {
      debugLog('bindDateChange', ev)
      const str = ev.detail.value
      this.setData({
        date: str
      })
      this.callback()
    },
    bindTimeChange(ev) {
      debugLog('bindTimeChange', ev)
    },

    callback() {
      const cur = this._getDateWithHour(this.data.date, this.data.time)

      debugLog('date 通知外界更新', cur)

      this.triggerEvent('submit', {
        filterIndex: this.data.filterIndex,
        info: [cur.unix],
      })
    },

    _getDateWithHour(str, hourStr) {
      // IOS 没办法设置 xxxx-xx-xx hh:mm

      const cur = new Date(str)
      const hh = hourStr.split(':')[0] || 0
      const mm = hourStr.split(':')[1] || 0

      cur.setHours(hh)
      cur.setMinutes(mm)

      const curStr = Utils.formatTimeStr(cur, 'yyyy-MM-dd hh:mm')
      return {
        str: curStr.slice(0, 10),
        hour: curStr.slice(11),
        unix: Number((cur.getTime() / 1000).toFixed(0)),
      }
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
