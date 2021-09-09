import * as Utils from '../utils/util'

module.exports = {
  title: { // 标题部分
    label: '某个数据板块的标题',
  },
  control: {
    filter: [
      {
        label: '选择日期',
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
            label: '自定义', grain: '-', value: -1, showDateRange: true
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
        alias: 'sourcePicker', // 标记性字段
        mode: 'dimension', // 维度
        style: 'picker', // 维度的模式，picker 或者 btn
        label: '对比场景',
        maxOptional: 2, // 最多可选几个，默认2个
        isComp: true,
        option: [ // array类型：固定已知的维度列表
          {
            label: '场景1',
            value: 'value1',
          },
          {
            label: '场景2',
            value: 'value2',
          },
          {
            label: '场景3',
            value: 'value3',
          },
          {
            label: '场景4',
            value: 'value4',
          },
          {
            label: '场景5',
            value: 'value5',
          },
        ],
      }
    ],
    cmpFilter: null,
  },
  chart: [
    {
      mode: 'linechart', // 使用什么图表
      label: null, // 小标题
      echartsOption: {
        // color: ["#32d3eb", '#00C777', "#32d3eb", "#5bc49f", '#feb64d'], // 颜色
        yAxis: {
          x: 'center',
          type: 'value',
          scale: true,
          minInterval: 1, // 最小间隔
          // interval: 3, // 固定间隔
          splitNumber: 2, // 分割几份，不能严格控制，涉及Y轴数据美化的问题
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#dbd7d7', // 虚线的颜色
            }
          },
          axisLine: {
            // show: false, // 不展示
            lineStyle: {
              color: '#fff', // 坐标轴的颜色
              // width:8,
            },
          },
          // 改变x轴字体颜色和大小
          axisLabel: {
            textStyle: {
              color: '#939393', // 字体的颜色
              fontSize: '11'
            },
            formatter(value) {
              // console.log("linechart formaterr", value)
              return Utils.getFormatNumer(value, 2)
            }
          },
          show: true,
        },
      }, // echart的Option
      getData(filters, renderChart) { // 处理数据部分
        console.log('example-cardConfig filters', filters)
        setTimeout(() => {
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
        }, 100)
      }
    },
  ],
}
