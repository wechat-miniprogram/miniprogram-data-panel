const Utils = require('../utils/util')

module.exports = {
  title: { // 标题部分
    label: '某个数据板块的标题',
  },
  control: {
    // filter: [],
    filter: [
      {
        label: ' 选择日期',
        alias: 'date', // 标记性字段
        mode: 'date',
        format: 'YYYY-MM-DD', // 目前只支持 YYYY-MM-DD
        limit: {
          // start: '2019-01-01', // 选择范围
          // end: '2019-07-01',  // 选择范围
          begin_yesterday: true, // 从昨天开始计算
          last_days: 30, // 指定最近7天，优先级最高
        },
        default: '', // 默认选中时间，不写默认可选范围的最后一天
      },
      {
        alias: 'sourcePicker', // 标记性字段
        mode: 'dimension', // 维度
        style: 'picker', // 维度的模式，picker 或者 btn
        label: '访问来源',
        option: [ // array类型：固定已知的维度列表
          {
            label: '选择1',
            value: 'value1',
          },
          {
            label: '选择2',
            value: 'value2',
          }
        ],
        defaultIndex: 1,
      }
    ],
    cmpFilter: null,
  },
  chart: [
    {
      mode: 'card', // 使用什么图表
      label: null, // 小标题
      getData(filters, renderChart) { // 处理数据部分
        renderChart({data: {}, ret: 'loading'})
        setTimeout(() => {
          const testData = ['测试1', '测试2', '测试3', '测试4']
          const data = testData.map(item => ({
            label: item,
            // value: Math.floor(Math.random() * Math.floor(1000000), // 如果是数字内部会处理
            value: `$${Utils.getFormatNumer(Math.floor(Math.random() * Math.floor(1000000)))}`,
            ext: [
              {label: '日', value: Math.random()},
              {label: '周', value: -Math.random()},
              {label: '月', value: Math.random()},
            ]
          }))
          renderChart({data, ret: 'succ'})
        }, 500)
      }
    },
    {
      mode: 'linechart', // 使用什么图表
      label: null, // 小标题
      echartsOption: {
        color: ['#ff0000', '#32d3eb'], // 目前只支持hex格式
        // 其他不设置可以不写，会使用默认值
      }, // echart的Option
      getData(filters, renderChart) { // 处理数据部分
        console.log('example-cardConfig filters', filters)
        renderChart({ret: 'loading'})

        setTimeout(() => {
          const date = ['周一', '周二', '周三', '周四']
          const data = date.map((item) => ({
            date: item,
            value: Math.floor(Math.random() * Math.floor(1000))
          }))
          renderChart({data, ret: 'succ'})
        }, 500)
      }
    },
    {
      mode: 'table', // 使用什么图表
      label: null, // 小标题
      getData(filters, renderChart) { // 处理数据部分
        console.log('example-cardConfig filters', filters)
        setTimeout(() => {
          const header = [
            {style: 'text', value: '日期', canSort: 0},
            {
              style: 'number', value: '数据', canSort: 1, sortType: 'only-reduce'
            },
            {style: 'number', value: '占比', canSort: 0}
          ]
          const date = ['02月01日', '02月02日', '02月03日', '02月04日']
          const body = date.map(item => [
            {value: item},
            {value: Math.floor(Math.random() * Math.floor(1000))},
            {value: (Math.random()).toFixed(2), valueUnit: '%'}
          ])

          renderChart({data: {header, body}, ret: 'succ'})
        }, 100)
      }
    },
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
        console.log('example-cardConfig filters', filters)
        setTimeout(() => {
          const data = [
            {name: '类目一', value: '20'},
            {name: '类目二', value: '25'},
            {name: '类目三', value: '19'},
            {name: '类目四', value: '18'},
            {name: '未知', value: '15'}]
          renderChart({data, ret: 'succ'})
        }, 100)
      }
    }
  ],
}
