import WxCanvas from './wx-canvas'
import * as echarts from './echarts'

let ctx

function compareVersion(v1, v2) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i], 10)
    const num2 = parseInt(v2[i], 10)

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
}

Component({
  properties: {
    canvasId: {
      type: String,
      value: 'ec-canvas'
    },

    ec: {
      type: Object
    },

    forceUseOldCanvas: {
      type: Boolean,
      value: false
    },
    // 生成图片的width与height，不为null则生成图片
    genCanvasImage: {
      type: Object,
      value: null
    }
  },

  data: {
    isUseNewCanvas: false
  },

  ready() {
    // Disable prograssive because drawImage doesn't support DOM as parameter
    // See https://developers.weixin.qq.com/miniprogram/dev/api/canvas/CanvasContext.drawImage.html
    echarts.registerPreprocessor(option => {
      if (option && option.series) {
        if (option.series.length > 0) {
          option.series.forEach(series => {
            series.progressive = 0
          })
        } else if (typeof option.series === 'object') {
          option.series.progressive = 0
        }
      }
    })

    if (!this.data.ec) {
      console.warn('组件需绑定 ec 变量，例：<ec-canvas id="mychart-dom-bar" ' +
        'canvas-id="mychart-bar" ec="{{ ec }}"></ec-canvas>')
      return
    }

    if (!this.data.ec.lazyLoad) {
      this.init()
    }
  },

  methods: {
    onError(ev) {
      console.warn('[ec-canvas] error', ev)
    },
    init(callback) {
      const system = wx.getSystemInfoSync && wx.getSystemInfoSync() || {}
      this._system = system
      const version = system.SDKVersion
      const isPC = (system.platform === 'window' || system.platform === 'mac') // PC暂不支持skia-cavans
      const lowSDKVersion = '2.15.0' // 2.15.0
      const canUseNewCanvas = !isPC && compareVersion(version, lowSDKVersion) >= 0
      const forceUseOldCanvas = this.data.forceUseOldCanvas
      // const forceUseOldCanvas = true // 基于现在有bug
      const isUseNewCanvas = canUseNewCanvas && !forceUseOldCanvas
      this.setData({isUseNewCanvas})

      if (forceUseOldCanvas && canUseNewCanvas) {
        console.warn('开发者强制使用旧canvas,建议关闭')
      }

      if (isUseNewCanvas) {
        // console.log('微信基础库版本大于2.9.0，开始使用<canvas type="2d"/>');
        // 2.15.0 可以使用 <canvas type="2d"></canvas>
        this.initByNewWay(callback)
      } else {
        const isValid = compareVersion(version, '1.9.91') >= 0
        if (!isValid) {
          console.error('微信基础库版本过低，需大于等于 1.9.91。' +
            '参见：https://github.com/ecomfe/echarts-for-weixin' +
            '#%E5%BE%AE%E4%BF%A1%E7%89%88%E6%9C%AC%E8%A6%81%E6%B1%82')
        } else {
          if (!isPC) console.warn('建议将微信基础库调整大于等于2.15.0版本。升级后绘图将有更好性能')
          this.initByOldWay(callback)
        }
      }
    },

    initByOldWay(callback) {
      // 1.9.91 <= version < 2.9.0：原来的方式初始化
      ctx = wx.createCanvasContext(this.data.canvasId, this)
      // console.log("[ec-canvas] ctx", ctx)
      const canvas = new WxCanvas(ctx, this.data.canvasId, false)
      // console.log("[ec-canvas] canvas", canvas)
      echarts.setCanvasCreator(() => canvas)
      const isPC = (this._system.platform === 'window' || this._system.platform === 'mac') // PC需要传入dpr，手机上不能传入
      const canvasDpr = isPC ? (wx.getSystemInfoSync && wx.getSystemInfoSync().pixelRatio || 1) : 1
      // const canvasDpr = 1
      const query = wx.createSelectorQuery().in(this)
      query.select('.ec-canvas').boundingClientRect(res => {
        if (!res) return
        if (typeof callback === 'function') {
          this.chart = callback(canvas, res.width, res.height, canvasDpr)
        } else if (this.data.ec && typeof this.data.ec.onInit === 'function') {
          this.chart = this.data.ec.onInit(canvas, res.width, res.height, canvasDpr)
        } else {
          this.triggerEvent('init', {
            canvas,
            width: res.width,
            height: res.height,
            canvasDpr // 增加了dpr，可方便外面echarts.init
          })
        }
        this.getImage()
      }).exec()
    },

    initByNewWay(callback) {
      // version >= 2.9.0：使用新的方式初始化
      const query = wx.createSelectorQuery().in(this)
      query
        .select('.ec-canvas')
        .fields({node: true, size: true})
        .exec(res => {
          const canvasNode = (res && res[0] && res[0].node) || null
          if (!canvasNode) return

          const canvasDpr = wx.getSystemInfoSync().pixelRatio
          const canvasWidth = res[0].width
          const canvasHeight = res[0].height

          const ctx = canvasNode.getContext('2d')

          const canvas = new WxCanvas(ctx, this.data.canvasId, true, canvasNode)
          echarts.setCanvasCreator(() => canvas)

          if (typeof callback === 'function') {
            this.chart = callback(canvas, canvasWidth, canvasHeight, canvasDpr)
          } else if (this.data.ec && typeof this.data.ec.onInit === 'function') {
            this.chart = this.data.ec.onInit(canvas, canvasWidth, canvasHeight, canvasDpr)
          } else {
            this.triggerEvent('init', {
              canvas,
              width: canvasWidth,
              height: canvasHeight,
              dpr: canvasDpr
            })
          }
          this.getImage()
        })
    },
    canvasToTempFilePath(opt) {
      if (this.data.isUseNewCanvas) {
        // 新版
        const query = wx.createSelectorQuery().in(this)
        query
          .select('.ec-canvas')
          .fields({node: true, size: true})
          .exec(res => {
            const canvasNode = res[0].node
            opt.canvas = canvasNode
            wx.canvasToTempFilePath(opt)
          })
      } else {
        // 旧的
        if (!opt.canvasId) {
          opt.canvasId = this.data.canvasId
        }
        ctx.draw(true, () => {
          wx.canvasToTempFilePath(opt, this)
        })
      }
    },
    getImage() {
      if (!this.data.genCanvasImage) return
      const {pixelRatio} = wx.getSystemInfoSync()
      this.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: this.data.genCanvasImage.width,
        height: this.data.genCanvasImage.height,
        destWidth: pixelRatio * this.data.genCanvasImage.width,
        destHeight: pixelRatio * this.data.genCanvasImage.height,
        success: (res) => {
          this.triggerEvent('postImage', {
            path: res.tempFilePath, // 图片本地路径
            canvasId: this.data.canvasId // 图片所对应的canvasID, 多图进行判断
          })
        },
        fail: (e) => {
          console.error('shdjsdj', e)
        }
      })
    },

    touchStart(e) {
      if (this.chart && e.touches.length > 0) {
        const touch = e.touches[0]
        const handler = this.chart.getZr().handler
        handler.dispatch('mousedown', {
          zrX: touch.x,
          zrY: touch.y
        })
        handler.dispatch('mousemove', {
          zrX: touch.x,
          zrY: touch.y
        })
        handler.processGesture(wrapTouch(e), 'start')
      }
    },

    touchMove(e) {
      if (this.chart && e.touches.length > 0) {
        const touch = e.touches[0]
        const handler = this.chart.getZr().handler
        handler.dispatch('mousemove', {
          zrX: touch.x,
          zrY: touch.y
        })
        handler.processGesture(wrapTouch(e), 'change')
      }
    },

    touchEnd(e) {
      if (this.chart) {
        const touch = e.changedTouches ? e.changedTouches[0] : {}
        const handler = this.chart.getZr().handler
        handler.dispatch('mouseup', {
          zrX: touch.x,
          zrY: touch.y
        })
        handler.dispatch('click', {
          zrX: touch.x,
          zrY: touch.y
        })
        handler.processGesture(wrapTouch(e), 'end')
      }
    }
  }
})

function wrapTouch(event) {
  for (let i = 0; i < event.touches.length; ++i) {
    const touch = event.touches[i]
    touch.offsetX = touch.x
    touch.offsetY = touch.y
  }
  return event
}
