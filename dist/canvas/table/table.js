const IS_OPEN_DEBUG_LOG = 0
const debugLog = (...args) => {
  if (IS_OPEN_DEBUG_LOG) console.log('[table]', ...args)
}

const Utils = require('../../utils/util')

Component({
  properties: {
    config: { // 属性名
      type: Object,
      value: {
        // label: null, // 小标题
        // fixColCnt: 2, // 固定前N列
        // hasFold: false, // 是否有折叠
        // perCount: 5, // 每次加载5条
        // ceilMargin: 20, // 间隔边距
        // banNumberAutoAddComm: true, // 禁止数字自动加千位分隔符
        numberColorConfig: [{ // 数据加颜色
          color: ['', ''],
          position: [[2, 0], [-1, -1]] // numberColor区域，[左上角坐标，右小角坐标], 不写 或 -1代表到最后
        }]
      }
    },
    configKey: {
      type: String,
      value: ''
    }
  },
  data: {
    ret: 'loading',
    header: [],
    body: [],
    tips: '',
    isShowAddMoreBtn: false, // 是否展示加载更多

    // header: [{
    //   value: '来源名称',
    //   style: ''
    // }, {
    //   value: '总数',
    //   style: ''
    // }, {
    //   value: '占比',
    //   style: ''
    // }, {
    //   value: 'xxx'
    // }],
    // body: [
    //   [{
    //     value: '小程序后台数据分析插件解读', // todo
    //   }, {
    //     value: 243234,
    //   }, {
    //     value: '34%'  // text value ratio
    //   }, {
    //     value: '34%'  // text value ratio
    //   }],
    //   [{
    //     value: '小程序后台数据分析插件解读', // todo
    //   }, {
    //     value: 243234,
    //   }, {
    //     value: '34%'  // text value ratio
    //   }, {
    //     value: '34%'  // text value ratio
    //   }],
    // ]
  },
  observers: {
    config(val) {
      this.debugLog('config', val)
    }
  },

  // 组件实例刚刚被创建好时执行，注意此时不能调用 setData
  created() {
    this.debugLog = (...args) => debugLog(`[${this.data.configKey}] `, ...args)
  },
  // 2.2.3起，推荐在 lifetimes 声明
  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
      // this.debugLog("attached", options)
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
      // this.debugLog("detached")
    },
  },
  methods: {
    setOption(result) {
      clearTimeout(this.reduceUpdateTimer)
      this.reduceUpdateTimer = setTimeout(() => {
        if (!this._inner_preResutString) this._inner_preResutString = JSON.stringify(result) // 上一次结果
        else {
          const _MD5 = JSON.stringify(result)
          if (_MD5 === this._inner_preResutString) {
            this.debugLog('[setOption] 命中相同 return')
            return // 不再绘制
          }

          this._inner_preResutString = _MD5 // 不相同则保留一下
        }

        this._setOption(result)
      }, 16)
    },

    _setOption(result) {
      const ret = this.checkRet(result)
      if (ret !== 'succ') {
        this.setData({
          ret,
          tips: typeof (result.data) === 'string' ? result.data : ''
        })
        return
      }

      this.debugLog('setOption', ret, result)
      this.renderChart(result.data || {})
    },

    checkRet(result) {
      const ret = result.ret
      if (ret !== 'succ') return ret
      if (!result.data) return 'empty'
      if (!result.data.header || result.data.header.length === 0) return 'empty'
      if (!result.data.body || result.data.body.length === 0) return 'empty'
      return 'succ'
    },

    _handleHeader(header) {
      const fixColCnt = this.data.config.fixColCnt || 0
      const ceilMargin = this.data.config.ceilMargin || 20
      header.forEach((item, idx) => {
        item.css = item.css || ''
        // 滑动部分计算宽度
        if (fixColCnt && idx >= fixColCnt) {
          item.css += 'width:' + Math.ceil((item.value || '').length * 26 + ceilMargin) + 'rpx;'
        }

        item.style = item.style || 'text'
        item.canSort = item.canSort || 0
        item.sortType = item.sortType || ''
        if (item.sortType) item.canSort = 1
      })

      let canSortCnt = 0
      let sortCnt = 0
      let isFirstSelectedIdx = -1
      header.forEach((item, idx) => {
        if (item.canSort) canSortCnt += 1
        if ((item.sortType === 'only-reduce') || (item.sortType === 'only-increase') ||
          (item.sortType === 'double-sort' && item.isSort)) {
          sortCnt += 1
          if (isFirstSelectedIdx === -1) isFirstSelectedIdx = idx
        }
      })
      this._canSortCnt = canSortCnt
      if (sortCnt <= 1) return header

      header.forEach((item, idx) => {
        if (idx === isFirstSelectedIdx) return
        if (item.sortType === 'only-reduce' || item.sortType === 'only-increase') {
          console.error('不能多个列指定为排序')
          item.sortType = ''
        }

        if (item.sortType === 'double-sort' && item.isSort) {
          console.error('不能多个列指定为排序')
          item.isSort = 0
        }
      })
      return header
    },

    _handleBody(header, body) {
      // 补一样样式
      const maxRow = body.length
      let maxCol = header.length || 0
      body.forEach(row => {
        maxCol = Math.max(maxCol, row.length)
      })

      body.forEach(row => {
        row.forEach((item, idx) => {
          item.style = item.style || header[idx].style || 'text'
        })
        // 补齐
        while (row.length < maxCol) {
          row.push({value: '\x07　', valueUnit: '', style: 'text'})
        }
      })

      // 处理颜色
      if (maxRow !== 0 && maxCol !== 0) {
        body = this._handleBodyColor(body, maxRow, maxCol)
      }

      // 最后一行没有border-bottom
      const lastRow = body.length - 1
      body[lastRow].forEach(ceil => {
        ceil.css = (ceil.css || '') + 'border-bottom: 1px solid transparent;'
      })

      // 加千位分隔符
      if (!this.data.config.banNumberAutoAddComm) {
        body.forEach(row => {
          row.forEach((item) => {
            if (!isNaN(item.value)) {
              item.value = Utils.addComma(item.value)
            }
          })
        })
      }
      return body
    },

    _handleBodyColor(body, maxRow, maxCol) {
      // 计算color
      const numberColorConfig = this.data.config.numberColorConfig || []
      if (numberColorConfig.length === 0) return body

      // 计算区域
      numberColorConfig.forEach(curConfig => {
        const positionRange = curConfig.position
        if (!positionRange || positionRange.length === 0) return

        // 计算范围
        const rowStart = positionRange[0] ? (positionRange[0][0] || 0) : 0
        const colStart = positionRange[0] ? (positionRange[0][1] || 0) : 0

        const rowEnd = positionRange[1] ? (positionRange[1][0] || (maxRow - 1)) : (maxRow - 1)
        const colEnd = positionRange[1] ? (positionRange[1][0] || (maxCol - 1)) : (maxCol - 1)

        // console.log("xxxxx", maxRow, maxCol)
        // console.log("xxxxx", positionRange[0], positionRange[1])
        // console.log("xxxxx", { rowStart, rowEnd, colStart, colEnd })

        let maxValue = 0
        let minValue = Infinity

        for (let row = rowStart; row <= rowEnd; row++) {
          for (let col = colStart; col <= colEnd; col++) {
            const ceil = body[row][col]
            ceil.css = ceil.css || ''
            if (ceil.value === '\x07　') ceil.css += 'background-color:white;'
            else {
              maxValue = Math.max(maxValue, ceil.value)
              minValue = Math.min(minValue, ceil.value)
            }
          }
        }
        this.debugLog('数据的范围', {maxValue, minValue})

        const minColor = (curConfig.color && curConfig.color[0]) || '#e9f2e8'
        const maxColor = (curConfig.color && curConfig.color[1]) || '#7ad17a'

        for (let row = rowStart; row <= rowEnd; row++) {
          for (let col = colStart; col <= colEnd; col++) {
            const ceil = body[row][col]
            if (ceil.value !== '\x07　') {
              const ceilColor = this._getColor({
                minValue,
                maxValue,
                x: ceil.value,
                minColor,
                maxColor,
              }) || '#f0ebf7'
              ceil.css += 'background-color:' + ceilColor + ';'
            }
          }
        }
      })

      this.debugLog('body 加了颜色', body)
      return body
    },

    _getColor({
      minValue, maxValue, x, maxColor, minColor
    }) {
      const rgbMin = Utils.hexToRgb(minColor)
      const rgbMax = Utils.hexToRgb(maxColor)

      const Rx = ((x - minValue) * (rgbMax.r - rgbMin.r)) / (maxValue - minValue) + rgbMin.r
      const Bx = ((x - minValue) * (rgbMax.b - rgbMin.b)) / (maxValue - minValue) + rgbMin.b
      const Gx = ((x - minValue) * (rgbMax.g - rgbMin.g)) / (maxValue - minValue) + rgbMin.g

      // console.log("xxxx", "rgb(" + Rx.toFixed(0) + "," + Bx.toFixed(0) + "," + Gx.toFixed(0) + ")")
      return (
        `rgb(${Rx.toFixed(0)},${Gx.toFixed(0)},${Bx.toFixed(0)})`
      // "rgb(" + Rx.toFixed(0) + "," + Gx.toFixed(0) + "," + Bx.toFixed(0) + ")"
      )
    },

    renderChart(data) {
      const header = this._handleHeader(data.header || [])
      const body = this._handleBody(header, data.body || [])
      this.debugLog('整理后的header', header, body, data.totalCnt, this.data.config)

      this._currentBody = body
      this._totalCnt = data.totalCnt || body.length

      const {isShowAddMoreBtn, showBody} = this._getIfShowAddMoreBtn(body, data.totalCnt)

      this.debugLog('renderChart', {isShowAddMoreBtn, showBody})
      this.setData({
        ret: header.length && body.length ? 'succ' : 'empty',
        header,
        body: showBody,
        isShowAddMoreBtn
      })
    },

    _getIfShowAddMoreBtn(body, totalCnt) {
      const bodyLength = body.length
      const config = this.data.config
      const perCount = config.perCount || totalCnt
      if (perCount >= totalCnt) return {isShowAddMoreBtn: false, showBody: body}

      if (!config.hasFold) return {isShowAddMoreBtn: false, showBody: body}

      if (bodyLength >= perCount) return {isShowAddMoreBtn: true, showBody: body.slice(0, perCount)}

      return {isShowAddMoreBtn: false, showBody: body}
    },

    onTapTableHeader(ev) {
      if (this._canSortCnt <= 1) return
      const col = ev.currentTarget.dataset.col
      const ceil = this.data.header[col]
      if (!ceil.canSort || ceil.sortType === 'only-reduce' || ceil.sortType === 'only-increase') return
      this.debugLog('onTapTableHeader', col, ceil)

      this.triggerEvent('click', {
        type: 'click-header',
        sortColIdx: +col,
        sortCeil: JSON.stringify(ceil)
      })
    },

    onTapTable(ev) {
      this.debugLog('onTapBody', ev)
      const {row, col} = ev.currentTarget.dataset
      if (+row === -1 && !this.data.header[+col].sort) return
      this.triggerEvent('click', {
        type: 'click-body',
        row: +row,
        col: +col
      })
    },

    onLongPresssTable(ev) {
      this.debugLog('onLongPresss', ev)
      const {row, col} = ev.currentTarget.dataset
      const value = this.data.body[row][col].value || ''
      if (value && (typeof (value) === 'string' || typeof (value) === 'number')) {
        wx.setClipboardData({
          data: this.data.body[row][col].value
        })
      }
    },

    onAddMore(ev) {
      this.debugLog('onAddMore', ev)
      // TODO: 加载更多
      if (this._currentBody.length === this._totalCnt) {
        this.setData({
          body: this._currentBody,
          isShowAddMoreBtn: false,
        })
      }
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
      this.debugLog('pageLifetimes resize', size)
    }
  },

})
