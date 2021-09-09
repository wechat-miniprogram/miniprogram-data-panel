const Utils = require('../dist/utils/util')

module.exports = {
  title: { // 标题部分
    label: '标题', // 不要标题k
    icon: false,
  },
  style: {
    noMargin: false, // 不要默认边距
  },
  control: {
    // filter: [], // 可以为空
    filter: [
      {
        label: '选择日期',
        alias: 'date', // 标记性字段
        mode: 'date',
        format: 'yyyy-MM-dd hh:mm', // yyyy-MM-DD HH:mm:SS
        limit: {
          // start: '2019-01-01', // 选择范围
          // end: '2019-07-01',  // 选择范围
          begin_yesterday: true, // 从昨天开始计算
          last_days: 30, // 指定最近7天，优先级最高
        },
        default: '2018-11-11', // 默认选中时间，不写默认可选范围的最后一天
      },
      {
        alias: 'sourcePicker', // 标记性字段
        mode: 'dimension', // 维度
        style: 'btn', // 维度的模式，picker 或者 btn
        label: '访问场景',
        isComp: false,
        maxOptional: 1, // 最多可选几个，默认2个
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
    singleSelectedReturnObj: true, // maxOptional=1的时候是否返回 obj
  },
  chart: [
    {
      mode: 'card', // 使用什么图表
      label: null, // 小标题
      maxColCnt: 3,
      getData(filters, renderChart) { // 处理数据部分
        // console.log("example-cardConfig filters", filters)
        renderChart({ret: 'loading'}) // 绘制loading
        setTimeout(() => { // 替换为对应的数据接口
          // const testData = ['测试1', '测试2', '测试3', '测试4']
          const testData = ['测试1', '测试2', '测试3', '测试4', '测试5']
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
          renderChart({ret: 'succ', data}) // 绘制图标
        }, 500)
      }
    }
  ],
}
