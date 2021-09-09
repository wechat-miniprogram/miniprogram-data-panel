import * as utils from '../../../utils/util'

Component({
  properties: {
    opt: { // 属性名
      type: Object,
      value: {
        // show: false,
        // options: [{
        //   label: '维度1',
        //   value: '11',
        //   select: true
        // }, {
        //   label: '维度2',
        //   value: '22',
        //   select: false
        // }, {
        //   label: '维度3',
        //   value: '33',
        //   select: true
        // }],
      }
    },
    label: {
      type: String,
      value: '对比指标'
    },
    maxOptional: { // 最大可选项，默认2个
      type: Number,
      value: 2
    }
  },
  data: {
    selected: 0,
  },
  observers: {
    'opt.option': function(option) {
      let selected = 0
      option.forEach(e => {
        if (e.select) {
          selected++
        }
      })
      if (this.data.selected !== selected) {
        this.setData({
          selected
        })
      }
    }
  },

  // 组件实例刚刚被创建好时执行，注意此时不能调用 setData
  created() {
    // console.log("component created")
  },
  // 2.2.3起，推荐在 lifetimes 声明
  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      // console.log("attached", options)
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
      // console.log("detached")
    },
  },
  methods: {
    onClose() {
      this.triggerEvent('close')
    },
    onChoice(ev) {
      const idx = ev.currentTarget.dataset.index
      // const idx = ev.target.dataset.index
      if (idx === undefined || idx === null) return
      const option = this.data.opt.option
      option[idx].select = !option[idx].select
      this.setData({
        'opt.option': option
      })
    },
    onSubmit() {
      if (this.data.selected > this.data.maxOptional) {
        utils.tipsSimple(`最多只能选${this.data.maxOptional}个`, 1500)
      } else if (this.data.selected <= 0) {
        utils.tipsSimple('至少选一个指标', 1500)
      } else {
        this.triggerEvent('submit', {
          option: this.data.opt.option
        })
      }
    },
    onReset() { // 重置，默认选前两个
      const option = this.data.opt.option
      option.forEach(e => e.select = false)
      option[0].select = true
      if (option.length >= this.data.maxOptional) {
        option[1].select = true
      }
      this.setData({
        'opt.option': option
      })
      this.triggerEvent('submit', {
        option: this.data.opt.option
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
  },

})
