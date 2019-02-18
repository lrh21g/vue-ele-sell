<template>
  <div class="goods">
    <div class="menu-wrapper" ref="menuWrapper">
      <ul>
        <li class="menu-item" ref="menuList"
          v-for="(item, index) in goods" :key="index"
          :class="{'current': currentIndex === index}"
          @click="selectMenu(index, $event)">
          <span class="text border-1px">
            <span v-show="item.type > 0" class="icon" :class="classMap[item.type]"></span>
            {{item.name}}
          </span>
        </li>
      </ul>
    </div>
    <div class="foods-wrapper" ref="foodsWrapper">
      <ul>
        <li class="food-list" ref="foodList"
          v-for="(item, index) in goods" :key="index">
          <h1 class="title">{{item.name}}</h1>
          <ul>
            <li class="food-item border-1px"
              v-for="(food, index) in item.foods" :key="index"
              @click="selectFood(food, $event)">
              <div class="icon">
                <img width="57" height="57" :src="food.icon" alt="">
              </div>
              <div class="content">
                <h2 class="name">{{food.name}}</h2>
                <p class="desc">{{food.description}}</p>
                <div class="extra">
                  <span class="count">月售{{food.sellCount}}</span>
                  <span>好评{{food.rating}}</span>
                </div>
                <div class="price">
                  <span class="now">￥{{food.price}}</span>
                  <span class="old" v-show="food.oldPrice">￥{{food.oldPrice}}</span>
                </div>
                <div class="cartcontrol-wrapper">
                  <cartcontrol :food="food" @add="addFood"></cartcontrol>
                </div>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <shopcart ref="shopcart"
      :selectFoods="selectFoods"
      :deliveryPrice="seller.deliveryPrice"
      :minPrice="seller.minPrice"></shopcart>
    <food ref="food" @add="addFood" :food="selectedFood"></food>
  </div>
</template>

<script>
  import shopcart from 'components/shopcart/shopcart'
  import food from 'components/food/food'
  import cartcontrol from 'components/cartcontrol/cartcontrol'
  import { getGoods } from 'api'
  import BScroll from 'better-scroll'

  export default {
    components: {
      shopcart, cartcontrol, food
    },
    props: {
      seller: Object
    },
    data () {
      return {
        goods: [],
        selectedFood: {}, // 选中的单个食品数据
        listHeight: [], // 用于存储每个食品分类节点的高度，此数组为递增数组
        scrollY: 0 // 用于存储食品列表滚动的高度，为正数
      }
    },
    computed: {
      // 用于与分类目录相连接，获取 listHeight的 index，使对应分类目录的 index 高亮
      currentIndex () {
        for (let i = 0; i < this.listHeight.length; i++) {
          let height1 = this.listHeight[i]
          let height2 = this.listHeight[i + 1]
          // height1 - height2 为对应分类的区间
          // 当食品列表滚动的高度在 [height1, height2]区间 内则返回对应的 i
          // 如果 i 为最后一个，i + 1则超出 listHeight数组的长度，height2 为 undefined
          // 需要对 height2 进行判断，如果 i 为最后一个，或者在 [height1, height2] 区间，则返回 i
          if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {
            this._followScroll(i)
            return i
          }
        }
        return 0
      },
      // 选中食品的数组
      selectFoods () {
        let foods = []
        this.goods.forEach((good) => {
          good.foods.forEach((food) => {
            if (food.count) {
              foods.push(food)
            }
          })
        })
        return foods
      }
    },
    created () {
      this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee']
      this.__getGoods()
    },
    methods: {
      selectMenu (index, event) {
        // 当页面切换为PC端模式的时候，点击事件会触发两次
        // better-scroll 设置 click:true 的时候，会派发一个点击事件，在PC端页面原生点击事件也可以被监听到
        // 针对better-scroll的事件,事件 event 中有属性 _constructed 进行标识，为 true 时，表示为 better-scroll 的派发事件
        // 原生事件中没有属性 _constructed
        // 在 PC 端通过  _constructed 标识将 better-scroll 派发的事件禁用，使用原生事件
        if (!event._constructed) {
          return
        }
        let foodList = this.$refs.foodList
        let el = foodList[index]
        this.foodsScroll.scrollToElement(el, 300)
      },
      addFood (target) {
        this._drop(target)
      },
      selectFood (food, event) {
        if (!event._constructed) {
          return
        }
        this.selectedFood = food
        this.$refs.food.show()
      },
      _drop (target) {
        // 体验优化，异步执行小球下落动画
        this.$nextTick(() => {
          this.$refs.shopcart.drop(target)
        })
      },
      __getGoods () {
        getGoods().then((goods) => {
          this.goods = goods
          this.$nextTick(() => {
            this._initScroll()
            this._calculateHeight()
          })
        })
      },
      _initScroll () {
        this.menuScroll = new BScroll(this.$refs.menuWrapper, {
          click: true
        })
        this.foodsScroll = new BScroll(this.$refs.foodsWrapper, {
          click: true,
          probeType: 3
        })
        // 监听商品列表滚动，并记录Y轴的滚动距离
        this.foodsScroll.on('scroll', (pos) => {
          // pos.y <= 0， 用于判断滑动方向，避免下拉时分类高亮错误（如:第一个分类商品数量为1时，下拉使得第二分类高亮）
          if (pos.y <= 0) {
            this.scrollY = Math.abs(Math.round(pos.y))
            // pos.y 为负值，需要通过 Math.abs() 取正数
            // Math.round() 方法可把一个数字舍入为最接近的整数
            // Math.abs() 方法可返回数的绝对值
          }
        })
      },
      _calculateHeight () {
        let foodList = this.$refs.foodList // 获取商品列表下，商品分类标题的DOM数组
        let height = 0 // 商品列表下，第一个分类标题距离容器内顶部的距离为 0
        this.listHeight.push(height)
        for (let i = 0; i < foodList.length; i++) {
          let item = foodList[i]
          height += item.clientHeight // clientHeight 元素内部高度，包含内边距，但不包括水平滚动条、边框和外边距
          this.listHeight.push(height)
        }
      },
      _followScroll (index) {
        let menuList = this.$refs.menuList
        let el = menuList[index]
        this.menuScroll.scrollToElement(el, 300, 0, -100)
      }
    }
  }
</script>

<style lang='stylus' scoped>
  @import "~common/stylus/mixin.styl"

  .goods
    display flex
    position absolute
    top 174px
    bottom 46px
    width 100%
    overflow hidden
    .menu-wrapper
      flex 0 0 80px
      width 80px
      background #f3f5f7
      .menu-item
        display table
        height 54px
        width 56px
        padding 0 12px
        line-height 14px
        &.current
          position relative
          margin-top -1px
          font-weight 700
          background #fff
          .text
            border-none()
        .icon
          display inline-block
          vertical-align top
          width 12px
          height 12px
          margin-right 2px
          background-size 12px 12px
          background-repeat no-repeat
          &.decrease
            bg-image('decrease_3')
          &.discount
            bg-image('discount_3')
          &.guarantee
            bg-image('guarantee_3')
          &.invoice
            bg-image('invoice_3')
          &.special
            bg-image('special_3')
        .text
          display table-cell
          width 56px
          vertical-align middle
          border-1px(rgba(7, 17, 27, 0.1))
          font-size 12px
    .foods-wrapper
      flex 1
      .title
        padding-left 14px
        height 26px
        line-height 26px
        border-left 2px solid #d9dde1
        font-size 12px
        color rgb(147, 153, 159)
        background #f3f5f7
      .food-item
        display flex
        margin 18px
        padding-bottom 18px
        border-1px(rgba(7, 17, 27, 0.1))
        &:last-child
          border-none()
          margin-bottom 0
        .icon
          flex 0 0 57px
          margin-right 10px
        .content
          flex 1
          .name
            margin 2px 0 8px 0
            height 14px
            line-height 14px
            font-size 14px
            color rgb(7, 17, 27)
          .desc, .extra
            line-height 10px
            font-size 10px
            color rgb(147, 153, 159)
          .desc
            line-height 12px
            margin-bottom 8px
          .extra
            .count
              margin-right 12px
          .price
            font-weight 700
            line-height 24px
            .now
              margin-right 8px
              font-size 14px
              color rgb(240, 20, 20)
            .old
              text-decoration line-through
              font-size 10px
              color rgb(147, 153, 159)
          .cartcontrol-wrapper
            position absolute
            right 0
            bottom 12px
</style>
