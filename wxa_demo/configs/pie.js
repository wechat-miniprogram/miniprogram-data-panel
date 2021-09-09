// const Utils = require('/components/data-components/utils/util')

module.exports = {
  title: { // 标题部分
    label: '环形图',
  },
  control: {
    filter: [
      {
        alias: 'index', // 标记性字段
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

      {
        label: '日期范围',
        mode: 'date-range',
        alias: 'daterange', // 标记性字段
        btnOptionsShow: true,
        btnOptions: [ // 快捷时间切换选项
          {
            label: '昨天', grain: 'day', value: 1, showDateRange: false
          },
          {
            label: '近7天', grain: 'day', value: 7, showDateRange: false
          },
          {
            label: '近30天', grain: 'day', value: 30, showDateRange: false
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
    ],
    cmpFilter: null,
  },
  chart: [
    {
      mode: 'piechart', // 使用什么图表
      label: null, // 小标题
      tableHeader: ['类目', '用户数', '占比'],
      showTable: true,
      hasLegend: true, // 控制是否有图例
      echartsOption: {
        color: ['#32d3eb', '#5bc49f', '#FB7373', '#FA9D3B', '#576B95', '#FA9D3B']
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
    }
  ],
}
