const Utils = require('../../utils/util')

const IS_OPEN_DEBUG_LOG = 0
const debugLog = (...args) => {
  if (IS_OPEN_DEBUG_LOG) console.log('[date-range]', ...args)
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
        pickerMode: 'day', // day
        btnOptionsShow: true,
        btnOptions: [
          {
            label: '近7天', grain: 'day', value: 7, showDateRange: false
          },
          {
            label: '近30天', grain: 'day', value: 30, showDateRange: false
          },
          {
            label: '自定义', grain: '-', value: -1, showDateRange: true
          }],
        default: {
          btnOptionsIdx: 0, // 默认选中哪个
          startStr: '2019-01-01', //  默认就是自定义 或者 btnOptions 不展示
          endStr: '2019-01-02',
        },
        limit: {
          // start: '2019-01-01',
          // end: '2019-07-01',
          begin_yesterday: true, // 从昨天开始计算
          last_days: 7, // 指定最近7天
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
    }
  },

  observers: {
    config(val) {
      if (val) this._initConfig()
    }
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
        let end = new Date()
        let start = new Date()

        if (limit.last_days) {
          if (limit.begin_yesterday) {
            end.setDate(end.getDate() - 1)
          }
          const num = +limit.last_days + (limit.begin_yesterday ? 1 : 0)
          start.setDate(start.getDate() - num)
        } else {
          start = new Date(limit.start)
          end = new Date(limit.end)
        }
        this.setData({
          limit: {
            startStr: Utils.getFullTime(start.getTime()).substr(0, 10),
            startTime: start.getTime(),
            endStr: Utils.getFullTime(end.getTime()).substr(0, 10),
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
          const start = this._getDate(config.default.startStr, 'start')
          const end = this._getDate(config.default.endStr, 'end')
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
        // 近 xx 天
        const lastDay = (btnItem.value || 1) - 1 // 一共多少天
        const end = this._getDate(this.data.limit.endStr, 'end')

        const startObj = new Date(this.data.limit.endStr)
        startObj.setDate(startObj.getDate() - lastDay)
        const start = this._getDate(startObj, 'start')

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

    _getDate(target, type) {
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
      if (type === 'start') curr.setHours(0, 0)
      if (type === 'end') curr.setHours(23, 59)
      return {
        str: Utils.getFullTime(curr.getTime()).substr(0, 10),
        unix: Number((curr.getTime() / 1000).toFixed(0)),
      }
    },

    bindDateChange(ev) {
      debugLog('bindDateChange', ev)
      const key = ev.target.dataset.key
      const date = this._getDate(ev.detail.value, key)
      if (key === 'start') {
        if (this.data.dateRange.startStr === date.str) return
        if (date.unix > this.data.dateRange.endUnix) {
          Utils.tipsSimple('开始时间不能低于结束时间')
          return
        }
        this.setData({
          'dateRange.startStr': date.str,
          'dateRange.startUnix': date.unix
        })
      } else {
        if (this.data.dateRange.endStr === date.str) return
        this.setData({
          'dateRange.endStr': date.str,
          'dateRange.endUnix': date.unix
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
