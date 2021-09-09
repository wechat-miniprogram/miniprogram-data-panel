const mockData = require('./mockdata')

console.log("mockData", mockData.getCardData(2))
module.exports = {
  title: { // 标题部分
    label: 'card的标题', // 标题
    icon: true, // 可以切换样式
  },
  control: {
    filter: [] // 没有任何选择
  },
  chart: [
    {
      mode: 'card', // 使用什么图表
      label: null, // 小标题
      maxColCnt: 3,
      getData(filters, renderChart) { // 处理数据部分
        renderChart({ret: 'loading'}) // 绘制loading
        setTimeout(() => { // 替换为对应的数据接口
          renderChart({ret: 'succ', data: mockData.getCardData(3)}) // 绘制图标
        }, 500)
      }
    }
  ],
}
