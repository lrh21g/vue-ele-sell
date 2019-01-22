import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'

import 'common/stylus/index.styl'
import createRouter from './router/router' //  引入 router 配置文件

const router = createRouter()

Vue.use(VueRouter)
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
