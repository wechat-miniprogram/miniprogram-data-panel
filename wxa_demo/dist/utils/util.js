export const deepCopy = (obj) => {
  if (typeof obj !== 'object') return obj
  if (obj === null) return null

  const newObj = obj instanceof Array ? [] : {}
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      newObj[key] = deepCopy(obj[key])
    } else {
      newObj[key] = deepCopy(obj[key])
    }
  }
  return newObj
}

/**
 * 多层取值 防越界 (value = roomDynamicInfo.live_info.live_time)
 * @param obj 对象 e.g. roomDynamicInfo
 * @param path 获取value 的路径 e.g roomDynamicInfo.live_info.live_time
 */
export const getObjectValue = (obj, path) => {
  const keylist = path.split('.').slice(1)
  return keylist.reduce((target, key) => {
    if (target) {
      if (target[key] === 0) return 0
      else if (target[key]) return target[key]
      else return null
    } else {
      return null
    }
    // return target && target[key] ? target[key] : null
  }, obj)
}

export const addComma = (number) => number.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,')

/**
 * 格式化数据
 * @param number 数字
 * @param fixed 固定几位小数
 */
export const getFormatNumer = (number, fixed = 1) => {
  // 获取顶bar高度
  number = Number(number)
  if (number === null) return 0
  if (isNaN(number)) return '-'

  if (isNaN(fixed) || fixed === null) fixed = 1
  if (number > 99999999499) return `${Number((number / 100000000000).toFixed(fixed))}千亿`
  if (number > 99999499) return `${Number((number / 100000000).toFixed(fixed))}亿`
  if (number > 9999499) return `${Number((number / 10000000).toFixed(fixed))}千万`
  if (number >= 10000) return `${Number((number / 10000).toFixed(fixed))}万`
  if (number >= 3000) return `${Number((number / 1000).toFixed(fixed))}千`
  return Number(number.toFixed(fixed))
}

export const getFormatNumerUnit = (number) => {
  // 获取顶bar高度
  number = Number(number)
  if (number === null) return ''
  if (isNaN(number)) return ''
  if (number > 99999999499) return '千亿'
  if (number > 99999499) return '亿'
  if (number > 9999499) return '千万'
  if (number >= 10000) return '万'
  if (number >= 3000) return '千'
  return ''
}

export const formatNumberWithUnit = (value, outputUnit, fixed) => {
  // 1. 判断是否是数字，不是原物返回
  if (isNaN(value)) return value
  if (fixed === undefined) fixed = 0
  value = Number(value)

  if (outputUnit === undefined || outputUnit === '') return Number(value.toFixed(fixed))

  if (outputUnit === '千') {
    value = (value / 1000).toFixed(fixed)
    return Number(value) + outputUnit
  }
  if (outputUnit === '万') {
    value = (value / 10000).toFixed(fixed)
    return Number(value) + outputUnit
  }

  if (outputUnit === '千万') {
    value = (value / 10000000).toFixed(fixed)
    return Number(value) + outputUnit
  }
  if (outputUnit === '亿') {
    value = (value / 100000000).toFixed(fixed)
    return Number(value) + outputUnit
  }
  if (outputUnit === '千亿') {
    value = (value / 100000000000).toFixed(fixed)
    return Number(value) + outputUnit
  }
  return value
}

export const tipsSucc = () => {
  wx.showToast({icon: 'success'})
}

export const tipsErr = (title, content, callback) => {
  wx.showModal({
    title,
    content,
    showCancel: false,
    confirmText: '知道了',
    success: () => {
      if (callback) callback()
    }
  })
}
// 重拾
export const tipsRetry = (content, callback) => {
  wx.showModal({
    title: '异常',
    content,
    confirmText: '重试',
    cancelText: '取消',
    success: (ev) => {
      if (ev.confirm && callback) callback() // 点击重试
    }
  })
}

export const tipsSimple = (content, duration) => {
  wx.showToast({
    title: content,
    icon: 'none',
    duration: duration || 3000
  })
}

function _addZero(str) {
  const s = String(str)
  return s.length >= 2 ? s : `0${s}`
}

export function sprintf(...args) {
  let i
  let result = args[0] || ''
  let para
  let reg
  const length = args.length - 1

  if (length < 1) {
    return result
  }

  i = 1
  while (i < length + 1) {
    result = result.replace(/%s/, `{#${i}#}`)
    i++
  }
  result.replace('%s', '')

  i = 1
  while (true) {
    para = args[i]
    if (para === undefined) { // 0 也是可能的替换数字
      break
    }
    reg = new RegExp(`{#${i}#}`, 'g')
    result = result.replace(reg, para)
    i++
  }
  return result
}

export const getFullTime = (datetime) => {
  // console.log("getFullTime")
  if (+datetime < 1000000000) datetime *= 1000
  const mydate = new Date(datetime)
  return sprintf(
    '%s-%s-%s %s:%s:%s',
    mydate.getFullYear(),
    _addZero(mydate.getMonth() + 1),
    _addZero(mydate.getDate()),
    _addZero(mydate.getHours()),
    _addZero(mydate.getMinutes()),
    _addZero(mydate.getSeconds())
  )
}

export const delEmoji = (text) => {
  const newText = text.replace(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g, '') // 过滤emoji表情符号
  return newText
}

export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export const formatTimeStr = (date, format) => {
  let fmt = format
  let tmpDate = null

  if (!date) tmpDate = new Date()
  else if (Object.prototype.toString.call(date) === '[object Date]') tmpDate = date
  else tmpDate = new Date(date)

  const o = {
    'M+': tmpDate.getMonth() + 1, // 月份
    'D+': tmpDate.getDate(), // 日
    'd+': tmpDate.getDate(), // 日
    'H+': tmpDate.getHours(), // 小时
    'h+': tmpDate.getHours(), // 小时
    'm+': tmpDate.getMinutes(), // 分
    'S+': tmpDate.getSeconds(), // 秒
    's+': tmpDate.getSeconds(), // 秒
    // "q+": Math.floor((tmpDate.getMonth() + 3) / 3), //季度
    // "S": tmpDate.getMilliseconds() //毫秒
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (`${tmpDate.getFullYear()}`).substr(4 - RegExp.$1.length))
  for (const k in o) if (new RegExp(`(${k})`).test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : ((`00${o[k]}`).substr((`${o[k]}`).length)))
  return fmt
}

export const isNaNDate = (number) => isNaN(Date.parse(number))
