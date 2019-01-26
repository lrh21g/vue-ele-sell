<template>
  <div class="cartcontrol">
    <transition name="move">
      <div class="cart-decrease"
        v-show="food.count > 0"
        @click.stop.prevent="decreaseCart">
        <span class="inner icon-remove_circle_outline"></span>
      </div>
    </transition>
    <div class="cart-count" v-show="food.count > 0">{{food.count}}</div>
    <div class="cart-add icon-add_circle" @click.stop.prevent="addCart"></div>
  </div>
</template>

<script>
  import Vue from 'vue'

  export default {
    props: {
      food: Object
    },
    methods: {
      addCart () {
        if (!this.food.count) {
          // Vue.set( target, key, value ) 向响应式对象中添加一个属性，并确保这个新属性同样是响应式的，且触发视图更新。
          // 它必须用于向响应式对象上添加新属性，因为 Vue 无法探测普通的新增属性
          Vue.set(this.food, 'count', 1)
        } else {
          this.food.count++
        }
        this.$emit('add', event.target)
      },
      decreaseCart () {
        if (this.food.count) {
          this.food.count--
        }
      }
    }
  }
</script>

<style lang='stylus' scoped>
  .cartcontrol
    font-size 0
    .cart-decrease
      display inline-block
      padding 6px
      transition all 0.4s linear
      &.move-transition
        opacity 1
        transform translate3d(0, 0, 0) // 使用 translate3d 可以开启硬件加速，使动画更加流畅
      .inner
        display inline-block
        line-height 24px
        font-size 24px
        color rgb(0, 160, 220)
        // transition: property duration timing-function delay
        // transition-property：规定设置过渡效果的 CSS 属性的名称
        // >>> none 没有属性会获得过渡效果。
        // >>> all 所有属性都将获得过渡效果。
        // >>> property 定义应用过渡效果的 CSS 属性名称列表，列表以逗号分隔
        // transition-duration：规定完成过渡效果需要多少秒或毫秒
        // transition-timing-function： 规定速度效果的速度曲线
        // >>> linear：规定以相同速度开始至结束的过渡效果
        // >>> ease：规定慢速开始，然后变快，然后慢速结束的过渡效果
        // >>> ease-in：规定以慢速开始的过渡效果
        // >>> ease-out：规定以慢速结束的过渡效果
        // >>> ease-in-out：规定以慢速开始和结束的过渡效果
        // >>> cubic-bezier(n,n,n,n)：在 cubic-bezier 函数中定义自己的值。可能的值是 0 至 1 之间的数值。
        // transition-delay：定义过渡效果何时开始
        transition all 0.4s linear
        transform rotate(0)
      &.move-enter-active, &.move-leave-active
        transition all 0.4s linear
      &.move-enter, &.move-leave-active
        opacity 0
        transform translate3d(24px, 0, 0)
        .inner
          transform rotate(180deg) // rotate 定义 2D 旋转，在参数中规定角度
    .cart-count
      display inline-block
      vertical-align top
      width 12px
      padding-top 6px
      line-height 24px
      text-align center
      font-size 10px
      color rgb(147, 153, 159)
    .cart-add
      display inline-block
      padding 6px
      line-height 24px
      font-size 24px
      color rgb(0, 160, 220)
</style>
