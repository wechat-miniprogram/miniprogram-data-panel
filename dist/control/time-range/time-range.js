const Utils = require('../../utils/util')

const MAP_GRAIN_LIMIT_DAY = {
  'minute': {
    60: -1, // 不限制
    30: 5,
    5: 3,
    1: 1
  }

}

const IS_OPEN_DEBUG_LOG = 0
const debugLog = (...args) => {
  if (IS_OPEN_DEBUG_LOG) console.log('[time-range]', ...args)
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
        // label: '日期范围',
        // mode: 'time-range',
        // pickerMode: 'minute', // day
        // btnOptionsShow: true,
        // btnOptions: [
        //   { label: '近7天', grain: 'day', value: 7, showDateRange: false },
        //   { label: '近30天', grain: 'day', value: 30, showDateRange: false },
        //   { label: '自定义', grain: '-', value: -1, showDateRange: true }],

        // grainOptionsShow: true, // 展示颗粒度选择
        // grainOptions: [
        //   { label: '60分钟', grain: 'minute', value: 60 },
        //   { label: '30分钟', grain: 'minute', value: 30 },
        //   { label: '1分钟', grain: 'minute', value: 1 },
        // ],
        // default: {
        //   btnOptionsIdx: 0, // 默认选中哪个
        //   startStr: '2019-01-01', //  默认就是自定义 或者 btnOptions 不展示
        //   endStr: '2019-01-02',
        // },
        // limit: {
        //   // start: '2019-01-01',
        //   // end: '2019-07-01',
        //   begin_yesterday: true, // 从昨天开始计算
        //   last_days: 7, // 指定最近7天
        // },
      }
    },
  },
  data: {
    btnSelectIdx: 0,
    grainSelectIdx: 0,

    // 时间戳
    timeRange: {
      startStr: '', // 2020-01-01
      startShortStr: '', // 01-01
      startUnix: null, // 时间戳
      endStr: '',
      endShortStr: '',
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
  // 组件实例刚刚被创建好时执行，注意此时不能调用 setData
  created() {
    debugLog('component created')
  },

  // 2.2.3起，推荐在 lifetimes 声明
  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      // debugLog("attached", this.data.config)
      // this._initConfig()
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
      debugLog('detached')
    },
  },

  methods: {
    _initConfig() {
      const config = this.data.config
      if (!config) return
      debugLog('_initConfig')

      this._initGrainSelectIdx() // 初始化时间粒度
      this._initBtnSelectIdx()
      this._initConfigLimit()
      this._initDateRange(true)
    },

    // 最近x天的选择
    _initBtnSelectIdx() {
      const config = this.data.config

      let btnSelectIdx = (config.default && config.default.btnOptionsIdx) || 0
      btnSelectIdx = isNaN(btnSelectIdx) || btnSelectIdx < 0 ? 0 : btnSelectIdx

      const btnList = config.btnOptions || []
      if (btnSelectIdx >= btnList.length) btnSelectIdx = btnList.length - 1

      this.setData({btnSelectIdx})
    },

    // 时间粒度
    _initGrainSelectIdx() {
      const config = this.data.config

      let grainSelectIdx = (config.default && config.default.grainOptionIdx) || 0
      grainSelectIdx = isNaN(grainSelectIdx) || grainSelectIdx < 0 ? 0 : grainSelectIdx

      const grainItem = this.data.config.grainOptions && this.data.config.grainOptions[grainSelectIdx] || {}
      this._curSelectedGrainItem = grainItem // 记录一下

      const curGrain = grainItem.grain || 'day'
      this.setData({
        grainSelectIdx,
        isShowHourPicker: !!((curGrain === 'minute' || curGrain === 'hour' || curGrain === 'second')),
      })
    },

    _initConfigLimit() {
      const config = this.data.config
      const limit = config.limit || null

      if (limit) {
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

        debugLog('计算limit', {
          startStr: Utils.getFullTime(start.getTime()).substr(0, 10),
          startTime: start.getTime(),
          endStr: Utils.getFullTime(end.getTime()).substr(0, 10),
          endTime: end.getTime(),
        })
      }
    },

    _initDateRangeWithDefaultConfig() {
      const config = this.data.config

      const defaultStartStr = (config.default && config.default.startStr) || ''
      const defaultEndStr = (config.default && config.default.endStr) || ''

      // TODO: 处理不存在的情况

      const startObj = this._getDate(defaultStartStr)
      const endObj = this._getDate(defaultEndStr)

      this.setData({
        timeRange: {
          startStr: startObj.str,
          startShortStr: startObj.shortStr,
          startUnix: startObj.unix,

          endStr: endObj.str,
          endShortStr: endObj.shortStr,
          endUnix: endObj.unix
        }
      })

      debugLog('_initDateRangeWithDefaultConfig timeRange', {
        startStr: startObj.str,
        startUnix: startObj.unix,
        endStr: endObj.str,
        endUnix: endObj.unix
      })
      // TODO
      // this.callback()
    },

    _initDateRange(useDefaultRange) {
      // 更新时间
      const config = this.data.config
      const btnItem = config.btnOptions[this.data.btnSelectIdx] || null

      // 没有快速选择 或者是 选择了自定义
      if (!btnItem || btnItem.label === '自定义') {
        if (!btnItem) debugLog('没有快速选择按钮')
        else debugLog('自定义')

        if (!useDefaultRange) return // 用户选择 自定义

        this._initDateRangeWithDefaultConfig() // 初始化时间
        return
      }

      const lastDay = (btnItem.value || 1) - 1 // 一共多少天

      const defaultConfig = config.default

      const curHour = Utils.formatTimeStr('', 'yyyy-MM-dd hh:mm').slice(11)

      const end = this._getDateWithHour(this.data.limit.endStr, defaultConfig.endHour || curHour)

      let startStr = this.data.limit.endTime
      startStr = Utils.formatTimeStr(startStr, 'yyyy-MM-dd')

      const start = this._getDateWithHour(startStr, defaultConfig.startHour || curHour)
      debugLog('近xx天 range', {
        start, end, lastDay, limit: this.data.limit, btnItem
      })
      this.setData({
        timeRange: {
          startStr: start.str,
          startShortStr: start.shortStr,
          startHour: start.hour,
          startUnix: start.unix,
          endStr: end.str,
          endShortStr: end.shortStr,
          endHour: end.hour,
          endUnix: end.unix,
        }
      })
      this.callback()
    },

    _getDate(target, beforeDay = 0) {
      let curr = null
      if (Object.prototype.toString.call(target) === '[object Date]') curr = target
      else if (Object.prototype.toString.call(target) === '[object String]') curr = new Date(target)
      else {
        try {
          if (target) curr = new Date(target)
          else curr = new Date()
        } catch (err) {
          console.error('_getDate Err', err, target, beforeDay)
          curr = new Date() // 兜底策略
        }
      }

      if (Object.prototype.toString.call(curr) !== '[object Date]') {
        curr = new Date() // 兜底策略
      }

      if (beforeDay) {
        curr.setDate(curr.getDate() - beforeDay)
      }

      const str = Utils.formatTimeStr(curr, 'yyyy-MM-dd hh:mm')
      return {
        str: str.slice(0, 10),
        shortStr: str.slice(5, 10), // 月-日
        hour: str.slice(11),
        unix: Number((curr.getTime() / 1000).toFixed(0)),
      }
    },

    _getDateWithHour(str, hourStr) {
      // IOS 没办法设置 xxxx-xx-xx hh:mm

      const cur = new Date(str)

      const [hh, mm, ss] = hourStr.split(':')
      cur.setHours(hh || 0, mm || 0, ss || 0)

      const curStr = Utils.formatTimeStr(cur, 'yyyy-MM-dd hh:mm')
      return {
        str: curStr.slice(0, 10),
        shortStr: str.slice(5, 10), // 月-日
        hour: curStr.slice(11),
        unix: Number((cur.getTime() / 1000).toFixed(0)),
      }
    },

    _getAutoRightRange(key, date) {
      // 备注策略
      // 1）如果选择startTime时， 当前endTime < startTime，自动调整endTime = startTime + 1天
      // 2）如果选择endTime时， 当前startTime >= endTime，自动调整startTime = endTime - 1天
      // 3）如果x分钟粒度时， 选择startTime， 当前endTime 超过最大范围，自动调整endTime且提示
      // 4）如果x分钟粒度时， 选择endTime， 当前startTime 超过最大范围，自动调整startTime且提示

      const curGrain = this._curSelectedGrainItem
      const timeRange = this.data.timeRange

      const startUnix = key === 'start' ? date.unix : timeRange.startUnix
      const endUnix = key === 'start' ? timeRange.endUnix : date.unix

      // 日期范围不对
      if (startUnix >= endUnix) {
        let limit = null
        if (key === 'start') {
          limit = this._getDate((startUnix + (3600 * 24 * 1)) * 1000)
          return {
            'timeRange.endHour': limit.hour,
            'timeRange.endStr': limit.str,
            'timeRange.endShortStr': limit.shortStr,
            'timeRange.endUnix': limit.unix,
          }
        } else {
          limit = this._getDate((endUnix - (3600 * 24 * 1)) * 1000)
          return {
            'timeRange.startHour': limit.hour,
            'timeRange.startStr': limit.str,
            'timeRange.startShortStr': limit.shortStr,
            'timeRange.startUnix': limit.unix,
          }
        }
      } else {
        return this._getAutoRightRangeWithGrain(key, startUnix, endUnix, curGrain)
      }
    },
    _getAutoRightRangeWithGrain(key, startUnix, endUnix, curGrain) {
      console.log('curGrain', curGrain)
      if (!curGrain || curGrain.grain !== 'minute') return {}

      const limitDayCnt = MAP_GRAIN_LIMIT_DAY[curGrain.grain] && MAP_GRAIN_LIMIT_DAY[curGrain.grain][curGrain.value]
      console.log('limitDayCnt', limitDayCnt)
      if (!limitDayCnt || limitDayCnt < 1) return {}

      const isOver = (endUnix - startUnix) > 3600 * 24 * limitDayCnt
      if (!isOver) return {}

      let limit = null
      if (key === 'start') {
        Utils.tipsSimple(`当前粒度最大范围为${limitDayCnt}天，已修正结束时间`, 1000)
        limit = this._getDate((startUnix + (3600 * 24 * limitDayCnt)) * 1000) // 往后推limitDayCnt天
        return {
          'timeRange.endHour': limit.hour,
          'timeRange.endStr': limit.str,
          'timeRange.endShortStr': limit.shortStr,
          'timeRange.endUnix': limit.unix,
        }
      } else {
        Utils.tipsSimple(`当前粒度最大范围为${limitDayCnt}天，已修正开始时间`, 1000)
        limit = this._getDate((endUnix - (3600 * 24 * limitDayCnt)) * 1000) // 往前推limitDayCnt天
        return {
          'timeRange.startHour': limit.hour,
          'timeRange.startStr': limit.str,
          'timeRange.startShortStr': limit.shortStr,
          'timeRange.startUnix': limit.unix,
        }
      }
    },

    bindDateChange(ev) {
      debugLog('bindDateChange', ev)
      const str = ev.detail.value
      const key = ev.target.dataset.key

      const timeRange = this.data.timeRange
      if (timeRange[key + 'Str'] === str) return

      const date = this._getDateWithHour(str, timeRange[key + 'Hour'])
      const changeOpt = this._getAutoRightRange(key, date)
      debugLog('bindDateChange changeOpt', changeOpt)
      if (key === 'start') {
        this.setData({
          ...changeOpt,
          'timeRange.startStr': date.str,
          'timeRange.startShortStr': date.shortStr,
          'timeRange.startUnix': date.unix
        })
      } else {
        this.setData({
          ...changeOpt,
          'timeRange.endStr': date.str,
          'timeRange.endShortStr': date.shortStr,
          'timeRange.endUnix': date.unix
        })
      }
      this.callback()
    },

    bindTimeChange(ev) {
      debugLog('bindTimeChange', ev)
      const hour = ev.detail.value
      const key = ev.target.dataset.key
      const timeRange = this.data.timeRange

      debugLog('bindTimeChange str', key, hour, timeRange[key + 'Hour'])
      if (timeRange[key + 'Hour'] === hour) return // 没有改变

      const date = this._getDateWithHour(timeRange[key + 'Str'], hour)
      if (key === 'start') {
        this.setData({
          'timeRange.startHour': hour,
          'timeRange.startUnix': date.unix
        })
      } else {
        this.setData({
          'timeRange.endHour': hour,
          'timeRange.endUnix': date.unix
        })
      }
      this.callback()
    },

    callback() {
      clearTimeout(this.callBackTimer)
      this.callBackTimer = setTimeout(() => {
        debugLog('通知外界更新', {
          start: this.data.timeRange.startUnix,
          end: this.data.timeRange.endUnix,
          grain: this._curSelectedGrainItem.grain || 'day',
        })

        this.triggerEvent('submit', {
          filterIndex: this.data.filterIndex,
          info: [{
            start: this.data.timeRange.startUnix,
            end: this.data.timeRange.endUnix,
            grain: this._curSelectedGrainItem.grain || 'day',
            grainValue: this._curSelectedGrainItem.value || -1
          }],
        })
      }, 100)
    },

    onTapGrainOptions(ev) {
      const idx = +ev.currentTarget.dataset.index
      if (idx === this.data.grainSelectIdx) return

      const grainItem = this.data.config.grainOptions && this.data.config.grainOptions[idx] || {}
      this._curSelectedGrainItem = grainItem // 记录一下

      const changeOpt = this.initDateRangeWithGrain()
      debugLog('onTapGrainOptions changeOpt', changeOpt)
      this.setData({
        ...changeOpt, // 更新时间
        grainSelectIdx: idx,
        isShowHourPicker: !!((grainItem.grain === 'minute' || grainItem.grain === 'hour' || grainItem.grain === 'second')),
      })
      this.callback()
    },

    initDateRangeWithGrain() {
      const curGrain = this._curSelectedGrainItem
      debugLog('initDateRangeWithGrain curGrain', curGrain)

      if (curGrain.grain === 'minute' && (curGrain.value === 1 || curGrain.value === 5)) {
        const timeRange = this.data.timeRange

        // const cur = this._getDate()
        // console.warn("initDateRangeWithGrain cur", cur)

        const limitSt = this._getDate((timeRange.endUnix * 1000 - (24 * 3600 * 1000))) // 限制最近24小时
        if (limitSt.unix > timeRange.startUnix) {
          return {
            'timeRange.startHour': limitSt.hour,
            'timeRange.startStr': limitSt.str,
            'timeRange.startShortStr': limitSt.shortStr,
            'timeRange.startUnix': limitSt.unix,
          }
        }

        // hour: "21:59"
        // shortStr: "03-03"
        // str: "2021-03-03"
        // unix: 1614779940

        // timeRange: {
        //   startHour: st.hour,
        //   startStr: st.str,
        //   startShortStr: st.shortStr,
        //   startUnix: st.unix,

        //   endUnix: ed.unix,
        //   endStr: ed.str,
        //   endShortStr: ed.shortStr,
        //   endHour: ed.hour
        // }
      }

      return {}
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
