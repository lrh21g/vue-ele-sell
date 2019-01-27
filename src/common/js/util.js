// 解析 url 参数
// 示例：http://192.168.1.113:8080?id=123&num=456 => {id: 123, num: 456}
export function urlParse() {
  let url = window.location.search
  let obj = {}
  let reg = /[?&][^?&]+=[^?&]+/g
  // 第一次匹配到 ?id=123 ：[?&] 匹配到 ? ； [^?&]+ 匹配到 id ； = 匹配到 = ；[^?&]+ 匹配到 123
  // 第二次匹配到 &num=456 ：[?&] 匹配到 & ； [^?&]+ 匹配到 num ； = 匹配到 = ；[^?&]+ 匹配到 456
  let arr = url.match(reg) // ['?id=123', '&num=456']
  if (arr) {
    arr.forEach((item) => {
      let tempArr = item.substring(1).split('=') // '?id=123' => [id, 123]
      // substring(start,stop) 方法用于提取字符串中介于两个指定下标之间（即：[start,stop]）的字符
      let key = decodeURIComponent(tempArr[0])
      let val = decodeURIComponent(tempArr[1])
      obj[key] = val
    })
  }
  return obj
}
