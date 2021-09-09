const Utils = require('../../utils/util')

const IS_OPEN_DEBUG_LOG = 0
const debugLog = (...args) => {
  if (IS_OPEN_DEBUG_LOG) console.log('[month-range]', ...args)
}
Component({
  properties: {
    filterIndex: { // 第几个，getData时候需要用
      type: Number
    },
    isComp: {
      type: Boolean,
      value: false, // todo：
    }, // 如果是时间对比，不展示btnOptions
    config: { // 属性名
      type: Object,
      value: {
        pickerMode: 'month', // day
        btnOptionsShow: true,
        btnOptions: [
          {
            label: '近半年', grain: 'month', value: 6, showDateRange: false
          },
          {
            label: '近一年', grain: 'month', value: 12, showDateRange: false
          },
          {
            label: '自定义', grain: '-', value: -1, showDateRange: true
          }],
        default: {
          btnOptionsIdx: 0, // 默认选中哪个
          startStr: '2019-01', //  默认就是自定义 或者 btnOptions 不展示
          endStr: '2019-01',
        },
        limit: {
          last_months: 12, // 指定最近多少天，自动计算start、end
          begin_last_month: true, // 从昨天开始计算last_days
        },
      }
    },
  },
  data: {
    btnSelectIdx: 0,
    dateRange: // 时间戳
    {
      startStr: '',
      startUnix: null,
      endStr: '',
      endUnix: null
    },

    // 选择范围限制
    limit: {
      startStr: '',
      startTime: 0,
      endStr: '',
      endTime: 0
    },
    day: 1
  },

  observers: {
    // config() {
    //   this._initConfig()
    // }
  },

  methods: {
    _initConfig() {
      const config = this.data.config
      if (!config) return
      const btnSelectIdx = config.default.btnOptionsIdx || 0
      this.setData({btnSelectIdx})

      this._initConfigLimit()
      this._initDateRange(true)
    },
    _initConfigLimit() {
      const config = this.data.config
      if (config.limit) {
        const limit = config.limit
        let end = this.getMonthFirstDay()
        let start = this.getMonthFirstDay()

        if (limit.last_months) {
          if (limit.begin_last_month) {
            end.setMonth(end.getMonth() - 1)
          }
          const num = +limit.last_months + (limit.begin_last_month ? 1 : 0)
          start.setMonth(start.getMonth() - num)
        } else {
          start = new Date(new Date(limit.start).setDate(1))
          end = new Date(new Date(limit.end).setDate(1))
        }
        this.setData({
          limit: {
            startStr: Utils.formatTimeStr(start, 'yyyy-MM'),
            startTime: start.getTime(),
            endStr: Utils.formatTimeStr(end, 'yyyy-MM'),
            endTime: end.getTime(),
          }
        })
      }
    },

    _initDateRange(useDefaultRange) {
      // 更新时间
      const config = this.data.config
      const btnItem = config.btnOptions[this.data.btnSelectIdx]
      // 不展示btnOptions 或者是 选择了自定义
      if (!config.btnOptionsShow || btnItem.label === '自定义') {
        if (useDefaultRange) {
          debugLog('采用默认时间')
          const start = this._getDate(config.default.startStr)
          const end = this._getDate(config.default.endStr)
          this.setData({
            dateRange: {
              startStr: start.str,
              startUnix: start.unix,
              endStr: end.str,
              endUnix: end.unix
            }
          })
          this.callback()
        }
      } else {
        // 近 xx 月
        const lastMonth = (btnItem.value || 1) - 1 // 一共多少月
        const endStr = Utils.getFullTime(this.data.limit.endTime).substr(0, 10)
        const end = this._getDate(endStr)

        const startObj = new Date(end.unix * 1000)
        startObj.setMonth(startObj.getMonth() - lastMonth)
        const start = this._getDate(startObj)
        this.setData({
          dateRange: {
            startStr: start.str,
            startUnix: start.unix,
            endStr: end.str,
            endUnix: end.unix
          }
        })
        this.callback()
      }
    },

    _getDate(target) {
      let curr = null
      if (Object.prototype.toString.call(target) === '[object Date]') curr = target
      else if (Object.prototype.toString.call(target) === '[object String]') curr = new Date(target)
      else {
        try {
          curr = new Date(target)
        } catch (err) {
          // todo: 更新一判断标准
        }
      }
      if (Object.prototype.toString.call(curr) !== '[object Date]') return
      return {
        str: Utils.formatTimeStr(curr, 'yyyy-MM'),
        unix: Number((curr.getTime() / 1000).toFixed(0)),
      }
    },

    bindDateChange(ev) {
      debugLog('bindDateChange', ev)
      const date = this._getDate(ev.detail.value)
      const key = ev.target.dataset.key
      const day = this.data.day
      const unixDate = this.getDateFromMonthStr(date.str, day)

      if (key === 'start') {
        if (this.data.dateRange.startStr === date.str) return
        this.setData({
          'dateRange.startStr': date.str,
          'dateRange.startUnix': Number(unixDate.getTime() / 1000).toFixed(0)
        })
      } else {
        if (this.data.dateRange.endStr === date.str) return
        this.setData({
          'dateRange.endStr': date.str,
          'dateRange.endUnix': Number(unixDate.getTime() / 1000).toFixed(0)
        })
      }
      this.callback()
    },

    callback() {
      debugLog('通知外界更新', {
        start: this.data.dateRange.startUnix,
        end: this.data.dateRange.endUnix
      })
      this.triggerEvent('submit', {
        filterIndex: this.data.filterIndex,
        info: [{
          start: this.data.dateRange.startUnix,
          end: this.data.dateRange.endUnix
        }],
      })
    },

    onTapBtnOptions(ev) {
      const idx = +ev.currentTarget.dataset.index
      if (idx === this.data.btnSelectIdx) return
      this.setData({
        btnSelectIdx: idx,
      })
      this._initDateRange(false)
    },
    getMonthFirstDay() {
      return new Date(new Date().setDate(1))
    },
    getDateFromMonthStr(month, day) {
      const monthArr = month.split('-')
      if (monthArr && monthArr.length > 1) {
        const year = parseInt(monthArr[0], 10)
        const month = parseInt(monthArr[1], 10)
        const date = parseInt(day || 1, 10)
        return new Date(year, month - 1, date)
      }
      return new Date(`${month}-${day}`)
    },
  },

  // 组件实例刚刚被创建好时执行，注意此时不能调用 setData
  created() {
    debugLog('component created')
  },
  // 2.2.3起，推荐在 lifetimes 声明
  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      debugLog('attached', this.data.config)
      this._initConfig()
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
      debugLog('detached')
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
