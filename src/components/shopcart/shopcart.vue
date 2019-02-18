<template>
  <div>
    <div class="shopcart">
      <div class="content" @click="toggleList">
        <div class="content-left">
          <div class="logo-wrapper">
            <div class="logo" :class="{'highlight': totalCount > 0}">
              <i class="icon-shopping_cart" :class="{'highlight': totalCount > 0}"></i>
            </div>
            <div class="num" v-show="totalCount > 0">{{totalCount}}</div>
          </div>
          <div class="price" :class="{'highlight': totalPrice > 0}">￥{{totalPrice}}</div>
          <div class="desc">另需配送费￥{{deliveryPrice}}</div>
        </div>
        <div class="content-right" @click.stop.prevent="pay">
          <div class="pay" :class="payClass">{{payDesc}}</div>
        </div>
      </div>
      <div class="ball-container">
        <div v-for="(ball, index) in balls" :key="index">
          <transition name="drop"
            @before-enter="beforeDrop"
            @enter="dropping"
            @after-enter="afterDrop">
            <div class="ball" v-show="ball.show">
              <div class="inner inner-hook"></div>
            </div>
          </transition>
        </div>
      </div>
      <transition name="fold">
        <div class="shopcart-list" v-show="listShow">
          <div class="list-header">
            <h1 class="title">购物车</h1>
            <span class="empty" @click="empty">清空</span>
          </div>
          <div class="list-content" ref="listContent">
            <ul>
              <li class="food" v-for="(food, index) in selectFoods" :key="index">
                <span class="name">{{food.name}}</span>
                <div class="price">
                  <span>￥{{food.price * food.count}}</span>
                </div>
                <div class="cartcontrol-wrapper">
                  <cartcontrol @add="addFood" :food="food"></cartcontrol>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>
    <transition name="fade">
      <div class="list-mask" @click="hideList" v-show="listShow"></div>
    </transition>
  </div>
</template>

<script>
  import BScroll from 'better-scroll'
  import cartcontrol from 'components/cartcontrol/cartcontrol'

  const BALL_LEN = 10 // 动画小球个数
  const innerClsHook = 'inner-hook'

  // 创建小球数组
  function createBalls () {
    let balls = []
    for (let i = 0; i < BALL_LEN; i++) {
      balls.push({ show: false })
    }
    return balls
  }

  export default {
    components: {
      cartcontrol
    },
    props: {
      selectFoods: {
        type: Array,
        default () {
          return [{
            price: 10,
            count: 1
          }]
        }
      },
      deliveryPrice: {
        type: Number,
        default: 0
      },
      minPrice: {
        type: Number,
        default: 0
      }
    },
    data () {
      return {
        balls: createBalls(),
        dropBalls: [],
        fold: false
      }
    },
    computed: {
      // 选择商品的总价格
      totalPrice () {
        let total = 0
        this.selectFoods.forEach((food) => {
          total += food.price * food.count
        })
        return total
      },
      // 选择商品的数量
      totalCount () {
        let count = 0
        this.selectFoods.forEach((food) => {
          count += food.count
        })
        return count
      },
      // 支付描述
      payDesc () {
        if (this.totalPrice === 0) {
          return `￥${this.minPrice}元起送`
        } else if (this.totalPrice < this.minPrice) {
          let diff = this.minPrice - this.totalPrice
          return `还差￥${diff}起送`
        } else {
          return '去结算'
        }
      },
      // 支付描述 绑定class
      payClass () {
        if (this.totalPrice < this.minPrice) {
          return 'not-enough'
        } else {
          return 'enough'
        }
      },
      // 控制购物车列表的显示和隐藏
      listShow: {
        get () {
          if (!this.totalCount) {
            // 如果选择食品数量为 0 ，则不显示
            return false
          }
          return this.fold
        },
        set () {
          if (!this.totalCount) {
            this.fold = false
          }
          // 创建 better-scroll 实例或者 refresh
          if (!this.fold) {
            this.$nextTick(() => {
              if (!this.scroll) {
                this.scroll = new BScroll(this.$refs.listContent, {
                  click: true
                })
              } else {
                this.scroll.refresh()
              }
            })
          }
        }
      }
    },
    methods: {
      // 购物车栏点击
      toggleList () {
        if (!this.totalCount) {
          return
        }
        this.listShow = false // 主要目的创建 better-scroll 实例或者 refresh
        this.fold = !this.fold // 通过 this.fold 的修改，控制计算属性 lisShow，从而控制购物车列表的显隐
      },
      // 购物车添加商品数量
      addFood (target) {
        this.drop(target)
      },
      // 清空购物车
      empty () {
        this.selectFoods.forEach((food) => {
          food.count = 0
        })
        this.listShow = false // 隐藏购物车列表
      },
      // 购物车遮罩层点击
      hideList () {
        this.fold = false
      },
      // 支付
      pay () {
        if (this.totalPrice < this.minPrice) {
          return
        }
        window.alert(`支付${this.totalPrice}元`)
      },
      // 驱动小球动画。
      // 小球动画原理：
      // 1. 在底部购物栏购物 logo 创建 10 小球，通过获取 cart-control 对应的增加商品数量按钮DOM，
      // 2. 从而通过 getBoundingClientRect 获取增加商品数量按钮DOM相对视口的位置，
      // 3. 然后控制小球从增加商品数量按钮DOM的位置移动到底部购物栏购物logo位置
      // 此事件由组件 goods组件，通过 $ref 获取本组件（shop-cart）ref，然后获取组件内 drop() 方法触发
      // 触发drop事件过程：
      // 1. 触发cart-control增加商品数量按钮DOM的add事件 向 goods组件 触发 $emit事件（onAdd）
      // 2. goods组件 通过 $ref 获取 shop-cart组件 ref（shopCart），获取shop-cart组件的 drop() 方法触发
      drop (el) {
        // el 为 cart-control 中增加商品数量按钮DOM
        // console.log('el', el)
        for (let i = 0; i < this.balls.length; i++) {
          let ball = this.balls[i]
          if (!ball.show) {
            ball.show = true
            ball.el = el
            this.dropBalls.push(ball)
            return
          }
        }
      },
      beforeDrop (el) {
        console.log('beforeDrop')
        const ball = this.dropBalls[this.dropBalls.length - 1] // 获取存放落入小球的数组的最后一个，最后一个是最新的一个
        const rect = ball.el.getBoundingClientRect() // 获取 cart-control 对应的增加商品数量按钮DOM的位置信息
        // getBoundingClientRect()方法返回元素的大小及其相对于视口的位置
        const x = rect.left - 32 // rect.left - 32 为底部购物栏 购物logo 中心位置，rect.left为DOM距离视口左边边框框的位置
        const y = -(window.innerHeight - rect.top - 22)
        // rect.top 为DOM距离视口顶部边框框的位置
        // y 需要取负值的原因是，底部购物栏 购物logo 相对于小球DOM ，处于小球的下方，y应该为负值
        el.style.display = 'block' // 清空display
        console.log('beforeDrop el.style.transform', el.style.transform)
        el.style.transform = el.style.webkitTransform = `translate3d(0, ${y}px, 0)`
        // transform 属性向元素应用 2D 或 3D 转换。该属性允许我们对元素进行旋转、缩放、移动或倾斜
        // webkitTransform 为为了进行兼容
        // translate3d 移动
        // 处理内层动画
        const inner = el.getElementsByClassName(innerClsHook)[0]
        inner.style.transform = inner.style.webkitTransform = `translate3d(${x}px, 0, 0)`
      },
      dropping (el, done) {
        console.log('dropping')
        console.log('dropping el', el)
        // 浏览器对于重绘是有要求并且是有队列完成的,这是主要为了性能,虽然动画隐藏了小球display none,但没有触发html重绘,或者说没有立即触发html重绘,所以需要手动
        this._reflow = document.body.offsetHeight // 手动触发html重绘的方法
        el.style.transform = el.style.webkitTransform = `translate3d(0, 0, 0)`
        const inner = el.getElementsByClassName(innerClsHook)[0]
        inner.style.transform = inner.style.webkitTransform = `translate3d(0, 0, 0)`
        el.addEventListener('transitionend', done) // 监听 transitionend 事件，表示该动画已经结束，之后触发 afterDrop 方法
      },
      afterDrop (el) {
        console.log('afterDrop')
        const ball = this.dropBalls.shift() // shift() 方法用于把数组的第一个元素从其中删除，并返回第一个元素的值。
        if (ball) {
          ball.show = false
          el.style.display = 'none'
        }
      }
    }
  }
</script>

<style lang='stylus' scoped>
  @import "~common/stylus/mixin.styl"

  .shopcart
    position fixed
    left 0
    bottom 0
    z-index 50
    width 100%
    height 48px
    .content
      display flex
      font-size 0
      color rgba(255, 255, 255, 0.4)
      background #141d27
      .content-left
        flex 1
        .logo-wrapper
          display inline-block
          vertical-align top
          position relative
          top -10px
          margin 0 12px
          padding 6px
          width 56px
          height 56px
          box-sizing border-box
          border-radius 50%
          background #141d27
          .logo
            width 100%
            height 100%
            border-radius 50%
            text-align center
            background #2b343c
            &.highlight
              background rgb(0, 160, 220)
            .icon-shopping_cart
              line-height 44px
              font-size 24px
              color #80858a
              &.highlight
                color #fff
          .num
            position absolute
            top 0
            right 0
            width 24px
            height 16px
            line-height 16px
            text-align center
            border-radius 16px
            font-size 9px
            font-weight 700
            color #ffffff
            background rgb(240, 20, 20)
            box-shadow 0 4px 8px 0 rgba(0, 0, 0, 0.4)
        .price
          display inline-block
          vertical-align top
          margin-top 12px
          line-height 24px
          padding-right 12px
          box-sizing border-box
          border-right 1px solid rgba(255, 255, 255, 0.1)
          font-size 16px
          font-weight 700
          &.highlight
            color #fff
        .desc
          display inline-block
          vertical-align top
          margin 12px 0 0 12px
          line-height 24px
          font-size 10px
      .content-right
        flex 0 0 105px
        width 105px
        .pay
          height 48px
          line-height 48px
          text-align center
          font-size 12px
          font-weight 700
          &.not-enough
            background #2b333b
          &.enough
            background #00b43c
            color #fff
    .ball-container
      .ball
        position fixed
        left 32px
        bottom 22px
        z-index 200
        transition all 0.4s cubic-bezier(0.49, -0.29, 0.75, 0.41)
        .inner
          width 16px
          height 16px
          border-radius 50%
          background rgb(0, 160, 220)
          transition all 0.4s linear
    .shopcart-list
      position absolute
      left 0
      top 0
      z-index -1
      width 100%
      transform translate3d(0, -100%, 0)
      &.fold-enter-active, &.fold-leave-active
        transform all 0.5s
      &.fold-enter, &.fold-leave-active
        transform translate3d(0, 0, 0)
      .list-header
        height 40px
        line-height 40px
        padding 0 18px
        border-bottom 1px solid rgba(7, 17, 27, 0.1)
        background #f3f5f7
        .title
          float left
          font-size 14px
          color rgb(7, 17, 27)
        .empty
          float right
          font-size 12px
          color rgb(0, 160, 220)
      .list-content
        padding 0 18px
        max-height 217px
        overflow hidden
        background #fff
        .food
          position relative
          padding 12px 0
          box-sizing border-box
          border-1px(rgba(7, 17, 27, 0.1))
          .name
            line-height 24px
            font-size 14px
            color rgb(7, 17, 27)
          .price
            position absolute
            right 90px
            bottom 12px
            line-height 24px
            font-size 14px
            font-weight 700
            color rgb(240, 20, 20)
          .cartcontrol-wrapper
            position absolute
            right 0
            bottom 6px
  .list-mask
    position fixed
    top 0
    left 0
    width 100%
    height 100%
    z-index 40
    backdrop-filter blur(10px)
    opacity 1
    background rgba(7, 17, 27, 0.6)
    &.fade-enter-active, &fade-leave-active
      transition all 0.5s
    &.fade-enter, &.fade-leave-active
      opacity 0
      background rgba(7, 17, 27, 0)
</style>
