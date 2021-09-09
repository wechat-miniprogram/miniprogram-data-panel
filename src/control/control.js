const IS_OPEN_DEBUG_LOG = 0
const debugLog = (...args) => {
  if (IS_OPEN_DEBUG_LOG) console.log('[control]', ...args)
}
const Utils = require('../utils/util')

Component({
  properties: {
    initializeConfig: { // 属性名
      type: Object,
      value: {}
    },
    extFilter: {
      type: Object, // 附加数据
      value: {}
    },
    reInit: {
      type: Boolean,
      value: false,
    }
  },
  data: {
    config: {}, // 避免改动外界
  },
  observers: {
    initializeConfig() {
      this._initConfig()
    },
    reInit(val) {
      if (val) {
        debugLog('control 有结束到')
        this._initConfig(true)
      }
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
      debugLog('attached', this.data.config)
      // this._initConfig()
    },

    detached() {
      // 在组件实例被从页面节点树移除时执行
      debugLog('detached')
    },
  },
  methods: {
    _initConfig(isReInit) {
      if (!this.data.initializeConfig) return

      const config = Utils.deepCopy(this.data.initializeConfig)
      this.setData({
        config
      })

      debugLog('_initConfig', config)
      const filterLength = (config.filter && config.filter.length) || 0
      if (filterLength === 0) {
        this.triggerEvent('change', {
          filters: [] // 结果返回回去
        })
      }

      this.filterLength = filterLength

      if (isReInit || !this.filterSelectList || this.filterSelectList.length !== filterLength) {
        this.filterSelectList = new Array(filterLength) // 选择结果存储
        this._initFilter()
      }
    },

    _initFilter() {
      // 处理是否可以多选
      const filter = this.data.config.filter
      debugLog('_initFilter', filter)

      let isChange = false
      filter.forEach(item => {
        if (item.mode !== 'dimension') return
        const maxOptional = Object.prototype.isPrototypeOf.call(item, 'maxOptional') && !isNaN(item.maxOptional) && item.maxOptional > 1

        // 没有设置最大数值，但是isComp=true
        if (!maxOptional && item.isComp) {
          isChange = true
          item.maxOptional = 2 // 默认能选择2个
        }

        // 设置了最大可选值，但是isComp=false: 修正isComp
        if (maxOptional && !item.isComp) {
          isChange = true
          item.isComp = true // 可以多选
        }
      })

      if (isChange) {
        debugLog('_initFilter change', filter)
        this.setData({'config.filter': filter})
      }
    },
    // 更改
    onChangeFilter(ev) {
      const target = ev.detail

      const curIndex = target.filterIndex || 0
      // 跟上次相同的话也不更新
      const _oldStr = JSON.stringify(this.filterSelectList[curIndex] || {})
      const _newStr = JSON.stringify(target.info || {})
      if (_oldStr === _newStr) return

      // 记录
      this.filterSelectList[curIndex] = target.info

      // 检查是否齐全 return
      for (let idx = 0; idx < this.filterLength; idx++) {
        if (!this.filterSelectList[idx]) {
          // debugLog("接收到外界通知 但 还不齐全")
          return
        }
      }
      this.callback()
    },

    callback() {
      const config = this.data.config || {}
      const result = {}
      this.filterSelectList.forEach((item, idx) => {
        const curFilter = config.filter[idx] || {}
        const alias = curFilter.alias || idx
        if (curFilter.isComp) { // 是多选
          result[alias] = item
        } else if (config.singleSelectedReturnObj || curFilter.mode !== 'dimension') { // 单选
          result[alias] = item[0]
        } else { // 单选
          result[alias] = item
        }
      })
      debugLog('通知更新数据', result)
      this.triggerEvent('change', {
        filters: result // 结果返回回去
      })
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
