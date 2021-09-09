// pages/chart_demo/chart_demo.js
const mockData = require('../../configs/card/mockdata')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    chartConfig: {
      title: { // 标题部分
        label: 'chart组件',
      },
      control: {filter:[]}, // 可查看control_demo
      chart: [
        {
          mode: 'card', // 使用什么图表
          label: 'card', // 小标题
          maxColCnt: 3, // 一行放多少个
          getData(filters, renderChart) { // 处理数据部分
            renderChart({ret: 'loading'}) // 绘制loading
            setTimeout(() => { // 替换为对应的数据接口
              renderChart({ret: 'succ', data: mockData.getCardData(3)}) // 绘制图标
            }, 500)
          }
        },
        {
          mode: 'linechart', // 使用什么图表
          label: 'linechart', // 小标题
          getData(filters, renderChart) { // 处理数据部分
            renderChart({ret: 'loading'}) // 绘制loading
            setTimeout(() => { // 替换为对应的数据接口
              const date = ['11.01', '11.02', '11.03', '11.04']
              // const date = ['2020.11.01', '2020.11.02', '2020.11.03', '2020.11.04']
              const chartData = {
                xAxis: {
                  data: date
                },
                series: [
                  {
                    name: '线条一',
                    data: date.map(() => Math.ceil(Math.random() * 10000))
                  },
                  {
                    name: '线条二',
                    data: date.map(() => Math.ceil(Math.random() * 10000))
                  },
                  {
                    name: '线条三',
                    data: date.map(() => Math.ceil(Math.random() * 10000))
                  },
                ]
              }
              renderChart({data: chartData, ret: 'succ'})
            }, 500)
          }
        },
        {
          mode: 'barchart', // 使用什么图表
          label: 'barchart', // 小标题
          echartsOption: {
            color: ['#32d3eb', '#5bc49f', '#FB7373', '#FA9D3B', '#576B95', '#FA9D3B']
          },
          getData(filters, renderChart) { // 处理数据部分
            setTimeout(() => {
              const cnt = Math.floor(Math.random() * 10) || 3
              const data = []
              for (let i = 0; i < cnt; i++) {
                data.push({label: `类目${i + 1}`, value: Math.floor(Math.random() * 1000)})
              }
              renderChart({data, ret: 'succ'})
            }, 100)
          }
        },
        {
          mode: 'fenbuchart', // 使用什么图表
          label: 'fenbuchart', // 小标题
          echartsOption: {
            yAxis: {
              minInterval: 1, // 最小间隔
            }
          },
          isWordBreakCnt: -1,
          getData(filters, renderChart) { // 处理数据部分
            setTimeout(() => {
              const cnt = Math.floor(Math.random() * 10) || 3
              const data = []
              for (let i = 0; i < cnt; i++) {
                data.push({label: `类目${i + 1}`, value: Math.floor(Math.random() * 1000)})
              }
              renderChart({data, ret: 'succ'})
            }, 100)
          }
        },
        {
          mode: 'piechart', // 使用什么图表
          label: 'piechart', // 小标题
          tableHeader: ['类目', '用户数', '占比'],
          showTable: true,
          hasLegend: true, // 控制是否有图例
          echartsOption: {
            // color: ['#32d3eb', '#5bc49f', '#FB7373', '#FA9D3B', '#576B95', '#FA9D3B']
          },
          getData(filters, renderChart) { // 处理数据部分
            setTimeout(() => {
              const cnt = Math.floor(Math.random() * 10) || 3
              const data = []
              for (let i = 0; i < cnt; i++) {
                data.push({name: `类目${i + 1}`, value: Math.floor(Math.random() * 1000)})
              }
              renderChart({data, ret: 'succ'})
            }, 100)
          }
        },
        {
          mode: 'table', // 使用什么图表
          label: '普通图表', // 小标题
          hasFold: true,
          perCount: 2,
          // fixColCnt: 0,
          getData(filters, renderChart) { // 处理数据部分
            console.log('example-cardConfig filters', filters)
            renderChart({data: {}, ret: 'loading'})
            setTimeout(() => {
              const header = [
                // css 目前还有些问题，待解决
                {
                  style: 'text', value: '日期', canSort: 0, css: 'min-width: 100rpx;'
                },
                {
                  style: 'number', value: '数据', canSort: 1, sortType: 'only-reduce'
                },
                {style: 'number', value: '占比', canSort: 1}
              ]
              // const date = ['02/01', '02/02', '02/03', '02/04']
              const date = ['02月01日', '02月02日', '02月03日', '02月04日']
    
              const body = date.map(item => [
                {value: item},
                {value: Math.floor(Math.random() * Math.floor(1000))},
                {value: (Math.random()).toFixed(2), valueUnit: '%'}
              ])
    
              renderChart({data: {header, body}, ret: 'succ'})
            }, 200)
          }
        },
        {
          mode: 'table', // 使用什么图表
          label: '支持固定前N列', // 小标题
          fixColCnt: 1,
          getData(filters, renderChart) { // 处理数据部分
            console.log('example-cardConfig filters', filters)
            // renderChart({ data: {}, ret: 'loading' })
            setTimeout(() => {
              const header = [
                // css 目前还有些问题，待解决
                {style: 'text', value: '日期', canSort: 0},
                {style: 'number', value: '新增用户'},
                {style: 'number', value: '1天后'},
                {style: 'number', value: '2天后'},
                {style: 'number', value: '3天后'},
                {style: 'number', value: '4天后'},
                {style: 'number', value: '5天后'},
                {style: 'number', value: '6天后'},
                {style: 'number', value: '7天后'},
                {style: 'number', value: '8天后'},
                {style: 'number', value: '9天后'},
                {style: 'number', value: '10天后'},
              ]
    
              const dateCnt = 5
              const body = []
              for (let cnt = 1; cnt < dateCnt; cnt++) {
                const row = header.map((item, idx) => ({
                  value: idx === 0 ? `11月${cnt}日` : (idx === 1 ? Math.floor(Math.random() * Math.floor(1000)) : (Math.random() * 100).toFixed(1)),
                  valueUnit: idx > 1 ? '%' : ''
                }))
                body.push(row)
              }
              renderChart({
                ret: 'succ',
                data: {
                  header,
                  body,
                  totalCnt: body.length,
                }
              })
            }, 200)
          }
        },
    
        {
          mode: 'table', // 使用什么图表
          label: '数据带颜色', // 小标题
          fixColCnt: 1,
          numberColorConfig: [{
            color: ['', ''],
            position: [[0, 2]] // numberColor区域，[左上角坐标，右小角坐标], 不写代表到最后
          }],
          getData(filters, renderChart) { // 处理数据部分
            console.log('example-cardConfig filters', filters)
            // renderChart({ data: {}, ret: 'loading' })
            setTimeout(() => {
              const header = [
                // css 目前还有些问题，待解决
                {style: 'text', value: '日期', canSort: 0},
                {style: 'number', value: '新增用户'},
                {style: 'number', value: '1天后'},
                {style: 'number', value: '2天后'},
                {style: 'number', value: '3天后'},
                {style: 'number', value: '4天后'},
                {style: 'number', value: '5天后'},
                {style: 'number', value: '6天后'},
                {style: 'number', value: '7天后'},
                {style: 'number', value: '8天后'},
                {style: 'number', value: '9天后'},
                {style: 'number', value: '10天后'},
              ]
    
              const dateCnt = 5
              const body = []
              for (let cnt = 1; cnt < dateCnt; cnt++) {
                const row = header.map((item, idx) => ({
                  value: idx === 0 ? `11月${cnt}日` : (idx === 1 ? Math.floor(Math.random() * Math.floor(1000)) : (Math.random() * 100).toFixed(1)),
                  valueUnit: idx > 1 ? '%' : ''
                }))
                body.push(row)
              }
              renderChart({
                ret: 'succ',
                data: {
                  header,
                  body,
                  totalCnt: body.length,
                }
              })
            }, 200)
          }
        }
      ]
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})