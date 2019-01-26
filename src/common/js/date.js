export function formatDate(date, fmt) {
  // date 为时间（通过 new Date() 转换了的）， fmt 为时间格式（如：yyyy-MM-dd hh:mm）
  if (/(y+)/.test(fmt)) {
    // 例如 fmt 格式为 'yyyy-MM-dd hh:mm' , 则 /(y+)/ 匹配 yyyy 年份
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    // RegExp.$1 为匹配到的第一个值，此处为 yyyy
    // 同时，获取时间的年份 替换 yyyy，如果 fmt 的格式为 'yy-MM-dd hh:mm',则只取年份的后两位进行替换
    // date.getFullYear() + '' 为将获取的时间的年份转换为字符串
    // substr() 方法可在字符串中抽取从 start 下标开始的指定数目的字符
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  // for...in 语句用于遍历数组或者对象的属性（对数组或者对象的属性进行循环操作）
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      // 匹配对应的正则，即 /(MM)/  /(dd)/  /(hh)/  /(ss)/
      let str = o[k] + '' // 将匹配对应的时间转换为字符串
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
      // 替换格式中对应的 MM  dd  hh  ss
      // RegExp.$1.length === 1 判断匹配的fmt格式的值的长度(即判断 MM dd hh ss,是否为M d h s)是否为 1
      // 例如 'yyyy-M-dd hh:mm'
      // 如果是则直接返回对应的时间，如果不是，则在前面添加 '0'
    }
  }
  return fmt
}

function padLeftZero(str) {
  // 示例，str 为 '12'，则从字符串 '0012' 中抽取从下标2开始到结束的字符串，包括下标2
  return ('00' + str).substr(str.length)
}
