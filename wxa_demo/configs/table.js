// const Utils = require('../utils/util')

module.exports = {
  title: { // 标题部分
    label: 'table实例',
  },
  control: {
    filter: [],
    cmpFilter: null,
  },
  chart: [
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
  ],
}
