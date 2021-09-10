const Utils = require('../../dist/utils/util')

export const getCardData = (dataCnt) => {
  dataCnt = dataCnt || 1
  const data = new Array(dataCnt)
  for (let i = 0; i < dataCnt; i++) {
    data[i] = {
      label: '测试' + (i + 1),
      // value: Math.floor(Math.random() * Math.floor(1000000), // 如果是数字内部会处理
      value: `$${Utils.getFormatNumer(Math.floor(Math.random() * Math.floor(1000000)))}`,
      ext: [
        {label: '日', value: Math.random()},
        {label: '周', value: -Math.random()},
        {label: '月', value: Math.random()},
      ]
    }
  }
  return data
}

export const getFullTime = (datatime) => {
  return Utils.getFullTime(datatime)
}

