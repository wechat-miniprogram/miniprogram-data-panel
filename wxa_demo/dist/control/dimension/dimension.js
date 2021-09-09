const IS_OPEN_DEBUG_LOG = 0
const debugLog = (...args) => {
  if (IS_OPEN_DEBUG_LOG) console.log('[dimension]', ...args)
}

Component({
  properties: {
    filterIndex: { // 第几个，getData时候需要用
      type: Number
    },
    config: { // 属性名
      type: Object,
      value: {
        // label: '维度',
        // style: 'btn',
        // option: [{
        //   label: '维度1',
        //   value: '11'
        // }, {
        //   label: '维度2',
        //   value: '22'
        // }, {
        //   label: '维度3',
        //   value: '33'
        // }],
      },
    },
    extFilter: {
      type: Object, // 附加数据
      value: {}
    },
    isComp: {
      type: Boolean,
      value: false,
    }, // 外界控制
  },
  data: {
    option: [],
    selectLabel: '',
    selectIdx: 0, // picker 使用

    multiPicker: {
      show: false, //
      option: [{
        label: '对比指标名称1',
        select: true
      }, {
        label: '对比指标名称2',
        select: true
      }, {
        label: '对比指标名称3',
        select: true
      }, {
        label: '对比指标名称4',
        select: true
      }, {
        label: '对比指标名称5',
        select: true
      }, {
        label: '对比指标名称6',
        select: true
      }, {
        label: '对比指标名称7',
        select: true
      }]
    }
  },
  observers: {
    extFilter(val) {
      debugLog('extFilter', val)

      if (!val || Object.keys(val).length === 0) return // 说明还没选择好
      if (!this.data.config || typeof (this.data.config.option) !== 'function') return // 如果config没有传入 或者 option 不是 function

      this._preExtFilter = val

      clearTimeout(this._getDataTimer)
      this._getDataTimer = setTimeout(() => {
        debugLog('extFilter变化，告知外界获取option', val)
        this.data.config.option(this._preExtFilter, this.resetRender.bind(this))
      }, 10)
    },
    isComp(newVal, oldVal) {
      debugLog('isComp observers', {newVal, oldVal, config: this.data.config})
      if (newVal !== oldVal) {
        debugLog('isComp observers call initGetoption')
        this.initGetoption()
      }
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
      debugLog('attached')
      this.initGetoption()
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
      debugLog('detached')
    },
  },
  methods: {
    // 初始化选项，有些是网络请求回来的
    initGetoption() {
      const config = this.data.config
      if (!config) return
      if (Object.prototype.toString.call(config.option) === '[object Array]') {
        this.resetRender(config.option, config.defaultIndex)
      } else if (Object.prototype.toString.call(config.option) === '[object Function]') {
        debugLog('initGetoption 请求数据', this.data.extFilter)
        config.option(this.data.extFilter || {}, this.resetRender.bind(this))
      } else {
        debugLog('参数')
      }
    },
    // 初始化面板
    resetRender(option, defaultIndex) {
      console.log('resetRender', option)
      if (!option || option.length === 0) {
        option = [{
          label: '空',
          value: 0
        }]
      }
      if (!defaultIndex) defaultIndex = 0
      if (defaultIndex > option.length) {
        console.error('[dimension]指定的defaultIndex 超过数组范围')
        defaultIndex = 0 // 默认
      }

      if (!option) option = this.data.option
      if (!option || option.length === 0) return
      option = option.map(item => ({
        label: item.label,
        value: item.value,
        select: false
      }))
      debugLog('resetRender isComp', this.data.isComp)
      if (this.data.isComp) {
        // 默认选择前俩个
        option[0].select = true
        if (option[1]) option[1].select = true
      } else {
        option[defaultIndex].select = true // 默认
      }

      this.setData({
        option,
        selectIdx: defaultIndex,
      })
      this._getSelectLabel()
      this.callback()
    },

    _getSelectLabel() {
      const option = this.data.option
      const selectList = option.filter(item => item.select)

      const strList = selectList.map(item => item.label)
      this.setData({
        selectList,
        selectLabel: strList.join('/')
      })
    },

    bindBtnChange(ev) {
      debugLog('bindBtnChange', ev)
      const idx = +ev.target.dataset.index
      if (idx === this.data.selectIdx) return
      this.setData({
        selectIdx: idx
      })
      this.callback()
    },
    bindBtnCompChange(ev) {
      const idx = +ev.target.dataset.index
      const option = this.data.option
      option[idx].select = option[idx].select ? 0 : 1
      this.setData({
        option
      })
      this.callback()
    },
    bindPickerChange(ev) {
      debugLog('bindChange', ev)

      const idx = +ev.detail.value
      if (this.data.selectIdx === idx) return
      this.setData({
        selectIdx: idx
      })
      this.callback()
    },

    onChangeTabBar(type, isRetry) {
      const _this = this
      const wxFunc = wx[type] && wx[type]
      wxFunc({
        success() { console.log(`${type} succ`) },
        fail(res) {
          console.warn(`${type} fail, isRetry=${isRetry} res=`, res)
          // 失败了要重试
          if (!isRetry) {
            setTimeout(() => {
              _this.onChangeTabBar(type, 1)
            }, 200)
          }
        }
      })
    },

    bindPickerCompShow() {
      this.onChangeTabBar('hideTabBar', 0)
      this.setData({
        multiPicker: {
          show: true,
          option: this.data.option
        }
      })
    },
    bindPickerCompHide() {
      this.onChangeTabBar('showTabBar', 0)
      this.setData({
        'multiPicker.show': false
      })
    },
    bindPickerCompChange(ev) {
      debugLog('bindPickerCompChange', ev)
      this.onChangeTabBar('showTabBar', 0)
      const option = ev.detail.option
      this.setData({
        'multiPicker.show': false,
        option
      })
      this._getSelectLabel()
      this.callback()
    },
    callback() {
      const isComp = this.data.isComp
      let selectList = []
      if (isComp) {
        selectList = this.data.option.filter(item => item.select)
      } else {
        selectList.push(this.data.option[this.data.selectIdx])
      }
      debugLog('通知外界更新', selectList)
      this.triggerEvent('submit', {
        filterIndex: this.data.filterIndex,
        info: selectList,
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
