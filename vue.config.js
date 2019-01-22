const webpack = require('webpack')
const path = require('path')
const appData = require('./data.json')
const seller = appData.seller
const goods = appData.goods
const ratings = appData.ratings

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  // css: {
  //   loaderOptions: {
  //     stylus: {
  //       'resolve url': true,
  //       'import': [
  //         './src/theme'
  //       ]
  //     }
  //   }
  // },
  // webpack-dev-server 相关配置
  devServer: {
    // webpack-dev-server before钩子：提供在服务器内部所有其他中间件之前执行自定义中间件的能力。可用作接口调试
    before (app) {
      // app 是一个 express 实例
      // app.get(path, callback [, callback ...]) 路由HTTP GET请求到有特殊回调的特殊路径
      // app.get('/', function (req, res) { // ...代码块... })
      // >>> Request 对象 - request 对象表示 HTTP 请求，包含了请求查询字符串，参数，内容，HTTP 头部等属性。
      // >>> Response 对象 - response 对象表示 HTTP 响应，即在接收到请求时向客户端发送的 HTTP 响应数据。
      app.get('/api/seller', function (req, res) {
        // res.json() 发送一个JSON格式的响应。这个方法等同于使用 res.send()响应(传送HTTP响应) 一个对象或数组。
        res.json({
          errno: 0,
          data: seller
        })
      })
      app.get('/api/goods', function (req, res) {
        res.json({
          errno: 0,
          data: goods
        })
      })
      app.get('/api/ratings', function (req, res) {
        res.json({
          errno: 0,
          data: ratings
        })
      })
    }
  },
  chainWebpack (config) {
    config.resolve.alias
      .set('components', resolve('src/components'))
      .set('common', resolve('src/common'))
      .set('api', resolve('src/api'))

    config.plugin('context')
      .use(webpack.ContextReplacementPlugin,
        [/moment[/\\]locale$/, /zh-cn/])
  }
}
