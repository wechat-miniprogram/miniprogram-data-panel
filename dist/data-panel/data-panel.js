const IS_OPEN_DEBUG_LOG = 0
const debugLog = (...args) => {
  if (IS_OPEN_DEBUG_LOG) console.log('[data-panel]', ...args)
}

Component({

  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  properties: {
    config: { // 属性名
      type: Object,
      value: {}
    },
    extFilter: {
      type: Object, // 附加数据
      value: {}
    },
    reInit: {
      type: Boolean,
      value: false
    }
  },
  data: {
    currentFilters: {},
    cardStyle: 'default', // 默认
    headerDesc: '',
  },
  observers: {
    extFilter(val) {
      debugLog('extFilter', val)
      if (!this.preFilters || !val || Object.keys(val).length === 0) return // 说明还没选择好
      Object.assign(this.preFilters, val)

      clearTimeout(this._getDataTimer)
      this._getDataTimer = setTimeout(() => {
        this.onTotalChange()
      }, 10)
    }
  },

  // 组件实例刚刚被创建好时执行，注意此时不能调用 setData
  created() {
    debugLog('created')
  },
  // 2.2.3起，推荐在 lifetimes 声明
  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      debugLog('attached', this.data.config)
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
      debugLog('detached')
    },
  },
  methods: {
    onChangeMode() {
      const chartConfig = this.data.config.chart && this.data.config.chart[0]
      if (chartConfig.mode === 'card') {
        this.setData({cardStyle: this.data.cardStyle === 'default' ? 'vertical' : 'default'})
      }
    },

    onControlChange(ev) {
      debugLog('onControlChange', ev)
      this.preFilters = {...ev.detail.filters, ...this.data.extFilter} // 加上外部的变化

      clearTimeout(this._getDataTimer)
      this._getDataTimer = setTimeout(() => {
        this.onTotalChange()
      }, 10)
    },

    // 告知外界变化
    onTotalChange() {
      debugLog('onTotalChange')
      const pageThis = this
      if (!this.data.config || Object.keys(this.data.config).length === 0) return
      const chart = this.data.config.chart || []

      chart.forEach((item, chartIdx) => {
        if (Object.prototype.toString.call(item.getData) === '[object Function]') {
          const ID = `#dom-${item.mode}-${chartIdx}`
          const chartComponent = this.selectComponent(ID)
          if (!chartComponent) {
            console.error('renderchart 找不到组件', ID)
            return
          }

          // 获取数据
          item.getData({...this.preFilters}, (result) => {
            if (result.headerDesc) {
              pageThis.setData({headerDesc: result.headerDesc})
            } else if (result.refDate) {
              pageThis.setData({headerDesc: '数据更新至 ' + result.refDate})
            }
            
            if ((!result.data || result.data.length === 0) && result.ret === 'succ') result.ret = 'empty' // 修正
            chartComponent.setOption.bind(chartComponent)(result)
          })
        }
      })
    },

    onClickTable(ev) {
      debugLog('onClickTable', ev)
      this.triggerEvent('clicktable', {
        ...ev.detail
      })
    },
    postImage(ev) {
      this.triggerEvent('postImage', {
        ...ev.detail
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
