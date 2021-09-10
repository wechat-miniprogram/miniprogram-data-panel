const Utils = require('../../utils/util')

const IS_OPEN_DEBUG_LOG = 0
const debugLog = (...args) => {
  if (IS_OPEN_DEBUG_LOG) console.log('[card]', ...args)
}

Component({
  properties: {
    config: { // 属性名
      type: Object,
      value: {
        // hasFold: false, // 是否有折叠
      }
    },
    cardStyle: { // 格式
      type: String,
      value: 'default'
    }
  },
  data: {
    info: [
      //  {
      //   wording: 'xxx',
      //   value: 12333,
      //   ext: [{
      //     color: 'increase',
      //     label: '日',
      //     value: '12%'
      //   }, {
      //     color: 'increase',
      //     label: '周',
      //     value: '12%'
      //   }, {
      //     color: 'increase',
      //     label: '月',
      //     value: '12%'
      //   }]
      //  }
    ],
    rowInfo: [],
    tips: '',
    isShowAddMoreBtn: false,
  },
  observers: {
    /**
    'numberA, numberB': function(numberA, numberB) {
      // 在 numberA 或者 numberB 被设置时，执行这个函数
      this.setData({
        sum: numberA + numberB
      })
    }
    */
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
    onAddMore() {
      this.setData({
        isShowAddMoreBtn: !this.data.isShowAddMoreBtn
      })
    },
    onTap() {
      const myEventDetail = {} // detail对象，提供给事件监听函数
      const myEventOption = {} // 触发事件的选项
      this.triggerEvent('myevent', myEventDetail, myEventOption)
    },

    checkRet(result) {
      const ret = result.ret
      if (ret !== 'succ') return ret
      const info = result.info || result.data || []
      if (info.length === 0) return 'empty'
      return 'succ'
    },

    setOption(result) {
      clearTimeout(this.reduceUpdateTimer)
      this.reduceUpdateTimer = setTimeout(() => {
        this._setOption(result)
      }, 16)
    },

    _setOption(result) {
      debugLog('setOption', result)
      const ret = this.checkRet(result)
      if (ret !== 'succ') {
        const tips = typeof (result.data) === 'string' ? result.data : ''
        this.setData({ret, tips, isShowAddMoreBtn: false})
        return
      }
      const configMaxLabel = this.data.config.maxLabelCnt || 10

      const info = result.data || result.info
      info.forEach(item => {
        const label = item.label || ''
        if (label.length > configMaxLabel) item.label = label.slice(0, configMaxLabel) + '\n' + label.slice(configMaxLabel)
        item.value = isNaN(item.value) ? item.value : Utils.getFormatNumer(item.value, 2)
        if (item.value && item.value.indexOf && item.value.indexOf('￥') === 0) {
          item.isMoney = true
        } else {
          item.isMoney = false
        }
        if (Object.prototype.toString.call(item.ext) === '[object Array]') {
          item.ext.forEach(item => {
            item.value = isNaN(item.value) ? item.value : Number((item.value * 100).toFixed(2)) // 100%
            if (!isNaN(item.value) && +item.value > 0) item.color = 'increase'
            else if (!isNaN(item.value) && +item.value < 0) item.color = 'decrease'
            else item.color = 'default'
          })
        }
      })

      const rowInfo = []
      debugLog('maxColCnt-config', this.data.config)
      const maxColCnt = this.data.config.maxColCnt || 4
      debugLog('maxColCnt', maxColCnt)
      for (let cnt = 0; cnt < info.length; cnt += maxColCnt) {
        rowInfo.push(info.slice(cnt, cnt + maxColCnt)) // 一行最多4个
      }

      this.setData({
        ret: 'succ', // succ
        info, // 整体
        rowInfo, // 确保一行4个
        cardStyle: this.data.config.cardStyle || 'default',
        isShowAddMoreBtn: !!this.data.config.hasFold
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
