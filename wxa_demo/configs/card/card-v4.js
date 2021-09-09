const mockData = require('./mockdata')

console.log("mockData", mockData.getCardData(2))
module.exports = {
  title: { // 标题部分
    label: '含维度选择', // 标题
    icon: false,
  },
  control: {
    singleSelectedReturnObj: true, // maxOptional=1的时候是否返回 obj
    filter: [
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
          }
        ],
      }
    ] // 没有任何选择
  },
  chart: [
    {
      mode: 'card', // 使用什么图表
      label: null, // 小标题
      maxColCnt: 3,
      getData(filters, renderChart) { // 处理数据部分
        console.log("filters", filters)
        // sourcePicker 是 control.filter[x].alias 指定的
        if(filters.sourcePicker.value === 'value2') {
          renderChart({ret: 'empty'})
        } else if (filters.sourcePicker.value === 'value3') {
          renderChart({ret: 'error', data: '获取数据异常'})
        } else {
          renderChart({ret: 'loading'}) // 绘制loading
          setTimeout(() => { // 替换为对应的数据接口
            renderChart({
              ret: 'succ',
              data: mockData.getCardData(3)
            }) // 绘制图标
          }, 500)
        }
      }
    }
  ],
}
