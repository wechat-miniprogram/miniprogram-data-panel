// pages/index/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    exampleList: [
      {
        label: 'chart_demo',
        key: 'chart_demo',
        desc: 'chart组件'
      },
      {
        label: 'control_demo',
        key: 'control_demo',
        desc: '筛选组件'
      },
      {
        label: 'card_demo',
        key: 'card_demo',
        desc: '卡片样式'
      },
    ]
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

  onChoice(ev) {
    console.log("ev", ev)
    const { idx, key } = ev.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/${key}/${key}`
    })

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