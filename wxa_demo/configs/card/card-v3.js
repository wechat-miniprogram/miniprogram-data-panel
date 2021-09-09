const mockData = require('./mockdata')

console.log("mockData", mockData.getCardData(2))
module.exports = {
  title: { // 标题部分
    label: '含日期选择', // 标题
    icon: false,
  },
  control: {
    filter: [
      {
        label: '选择日期',
        alias: 'date', // 标记性字段
        mode: 'date',
        format: 'yyyy-MM-dd', // yyyy-MM-DD HH:mm:SS
        limit: {
          // start: '2019-01-01', // 选择范围
          // end: '2019-07-01',  // 选择范围
          begin_yesterday: true, // 从昨天开始计算
          last_days: 30, // 指定最近7天，优先级最高
        },
        default: '', // 默认选中时间，不写默认可选范围的最后一天
      },
      
    ] // 没有任何选择
  },
  chart: [
    {
      mode: 'card', // 使用什么图表
      label: '数据一', // 小标题
      cardStyle: 'default', // 样式二
      maxColCnt: 3,
      getData(filters, renderChart) { // 处理数据部分
        renderChart({ret: 'loading'}) // 绘制loading
        setTimeout(() => { // 替换为对应的数据接口
          renderChart({
            ret: 'succ',
            data: mockData.getCardData(3)
          }) // 绘制图标
        }, 500)
      }
    },
    {
      mode: 'card', // 使用什么图表
      label: '数据二', // 小标题
      cardStyle: 'vertical', // 样式二
      maxColCnt: 3,
      getData(filters, renderChart) { // 处理数据部分
        renderChart({ret: 'loading'}) // 绘制loading
        setTimeout(() => { // 替换为对应的数据接口
          renderChart({
            ret: 'succ',
            data: mockData.getCardData(2)
          }) // 绘制图标
        }, 500)
      }
    }
  ],
}
