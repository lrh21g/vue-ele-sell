<template>
  <div class="star" :class="starType">
    <!-- 通过 v-for 渲染 itemClasses数组，渲染评分星数 -->
    <span class="star-item" :class="itemClass"
      v-for="(itemClass, index) in itemClasses"
      :key="index"
      ></span>
  </div>
</template>

<script>
  const LENGTH = 5
  const CLS_ON = 'on' // 全星
  const CLS_HALF = 'half' // 半星
  const CLS_OFF = 'off' // 透明星（空星）

  export default {
    props: {
      size: Number, // star尺寸
      score: Number // 评分
    },
    computed: {
      // 评分类型 star-48、star-36、star-24
      starType () {
        return 'star-' + this.size
      },
      // 评分 转换为 star数组，示例：3.3分 --> ['CLS_ON', 'CLS_ON', 'CLS_ON', 'CLS_HALF', 'CLS_OFF', 'CLS_OFF']
      itemClasses() {
        let result = []
        let score = Math.floor(this.score * 2) / 2
        // Math.floor() 返回小于或等于一个给定数字的最大整数，向下取整
        // 计算分数示例：
        // 4.0分 —— 通过计算，score 为 4.0 分
        // 4.3分 —— 通过计算，score 为 4.5 分
        // 4.5分 —— 通过计算，score 为 4.5 分
        // 4.8分 —— 通过计算，score 为 4.5 分
        // 5.0分 —— 通过计算，score 为 5.0 分
        let hasDecimal = score % 1 !== 0 // 判断是否存在半星
        let integer = Math.floor(score) // 获取全星个数
        for (let i = 0; i < integer; i++) {
        // 3.3分，则数组 result 中，前 3 个元素为 CLS_ON（全星）
          result.push(CLS_ON)
        }
        // 3.3分，通过 hasDecimal 判断（即取余，为 0.3），为 true，则第4个元素为 CLS_HALF（半星）
        if (hasDecimal) {
          result.push(CLS_HALF)
        }
        // 当返回的数组长度小于评分长度，则填充为 CLS_OFF（透明星）
        while (result.length < LENGTH) {
          result.push(CLS_OFF)
        }
        return result
      }
    }
  }
</script>

<style lang='stylus' scoped>
  @import "~common/stylus/mixin.styl"

  .star
    font-size 0
    .star-item
      display inline-block
      background-repeat no-repeat
    &.star-48
      .star-item
        width 20px
        height 20px
        margin-right 22px
        background-size 20px 20px
        &:last-child
          margin-right: 0
        &.on
          bg-image('star48_on')
        &.half
          bg-image('star48_half')
        &.off
          bg-image('star48_off')
    &.star-36
      .star-item
        width 15px
        height 15px
        margin-right 6px
        background-size 15px 15px
        &:last-child
          margin-right 0
        &.on
          bg-image('star36_on')
        &.half
          bg-image('star36_half')
        &.off
          bg-image('star36_off')
    &.star-24
      .star-item
        width 10px
        height 10px
        margin-right 3px
        background-size 10px 10px
        &:last-child
          margin-right 0
        &.on
          bg-image('star24_on')
        &.half
          bg-image('star24_half')
        &.off
          bg-image('star24_off')
</style>
