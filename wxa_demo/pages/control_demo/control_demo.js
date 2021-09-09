// pages/control_demo/control_demo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chartConfig: {
      title: { // 标题部分
        label: '筛选组件',
      },
      control: {
        filter: [
          {
            // hidden: true, // 隐藏
            label: '单天',
            alias: 'date', // 标记性字段
            mode: 'date',
            format: 'yyyy-MM-dd hh:mm', // yyyy-MM-DD HH:mm:SS
            limit: {
              // start: '2019-01-01', // 选择范围
              // end: '2019-07-01',  // 选择范围
              begin_yesterday: true, // 从昨天开始计算
              last_days: 30, // 指定最近7天，优先级最高
            },
            default: '', // 默认选中时间，不写默认可选范围的最后一天
          },
          {
            label: '日期范围',
            mode: 'date-range',
            alias: 'daterange', // 标记性字段
            btnOptionsShow: true,
            btnOptions: [ // 快捷时间切换选项
              {
                label: '近7天', grain: 'day', value: 7, showDateRange: false
              },
              {
                label: '近30天', grain: 'day', value: 30, showDateRange: false
              },
              {
                label: '自定义', grain: 'day', value: -1, showDateRange: true
              }],
            default: {
              btnOptionsIdx: 0, // 默认选中btn，有意义时优先级最高
              startStr: '2019-01-01', // 默认开始时间
              endStr: '2019-01-02', // 默认结束时间
            },
            limit: {
              // start: '2019-01-01',
              // end: '2019-07-01',
              last_days: 90, // 指定最近多少天，自动计算start、end
              begin_yesterday: true, // 从昨天开始计算last_days
            },
          },
          {
            label: '实时范围',
            mode: 'time-range',
            alias: 'daterange', // 标记性字段
    
            pickerMode: 'minute', // day
    
            btnOptionsShow: false,
            btnOptions: [
              { label: '今天', grain: 'day', value: 0, showDateRange: true },
              { label: '近7天', grain: 'day', value: 30, showDateRange: true },
              { label: '自定义', grain: '-', value: -1, showDateRange: true }],
    
            grainOptionsShow: false, // 展示颗粒度选择
            grainOptions: [
              { label: '60分钟', grain: 'minute', value: 60 },
              { label: '5分钟', grain: 'minute', value: 5 },
              { label: '1分钟', grain: 'minute', value: 1 },
            ],
    
            default: {
              btnOptionsIdx: 0, // 默认选中哪个
              grainOptionIdx: 0,
    
              startHour: '00:00',
              endHour: '23:59',
    
              startStr: '2019-01-01', //  默认就是自定义 或者 btnOptions 不展示
              endStr: '2019-01-02',
            },
            limit: {
              // start: '2019-01-01',
              // end: '2019-07-01',
              begin_yesterday: false, // 从昨天开始计算
              last_days: 14, // 指定最近7天
            },
          },
       
          {
            alias: 'indexPicker', // 标记性字段
            mode: 'dimension', // 维度
            style: 'picker', // 维度的模式，picker 或者 btn
            label: '选择指标',
            isComp: false,
            option: [ // array类型：固定已知的维度列表
              {
                label: '活跃用户',
                value: 'value1',
              },
              {
                label: '新增用户',
                value: 'value2',
              }
            ],
            defaultIndex: 0,
          },
          {
            alias: 'indexBtn', // 标记性字段
            mode: 'dimension', // 维度
            style: 'btn', // 维度的模式，picker 或者 btn
            label: '选择指标',
            isComp: false,
            option: [ // array类型：固定已知的维度列表
              {
                label: '活跃用户',
                value: 'value1',
              },
              {
                label: '新增用户',
                value: 'value2',
              }
            ],
            defaultIndex: 0,
          },
       
        ],
        cmpFilter: null,
      },
      chart: [
        {
          mode: 'card', // 使用什么图表
          getData(filters, renderChart) { // 处理数据部分
            renderChart({ret: 'error', data: '这里重点看筛选组件'})
          }
        }
      ],
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