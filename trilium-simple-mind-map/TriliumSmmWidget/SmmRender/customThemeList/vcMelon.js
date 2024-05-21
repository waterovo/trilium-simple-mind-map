// vcMelon
module.exports = {
    backgroundColor: 'rgb(124, 213, 200)',
    // 连线的颜色
    lineColor: 'rgb(51, 51, 51)',
    lineWidth: 3,
    // 概要连线的粗细
    generalizationLineWidth: 3,
    // 概要连线的颜色
    generalizationLineColor: 'rgb(51, 51, 51)',
    // 根节点样式
    root: {
      fillColor: 'rgb(252, 180, 71)',
      color: 'rgb(51, 51, 51)',
      borderColor: 'rgb(24, 24, 24)',
      borderWidth: 3,
      fontSize: 24,
      shape: 'roundedRectangle'
    },
    // 二级节点样式
    second: {
      fillColor: 'rgb(254, 225, 38)',
      color: 'rgb(51, 51, 51)',
      borderColor: 'rgb(24, 24, 24)',
      borderWidth: 3,
      fontSize: 18,
      shape: 'roundedRectangle'
    },
    // 三级及以下节点样式
    node: {
      fillColor: 'rgb(140, 198, 63)',
      color: 'rgb(51, 51, 51)',
      borderColor: 'rgb(24, 24, 24)',
      borderWidth: 2,
      fontSize: 14,
      shape: 'roundedRectangle'
    },
    // 概要节点样式
    generalization: {
      fontSize: 14,
      fillColor: 'rgb(255, 198, 70)',
      borderColor: 'rgb(26, 26, 26)',
      borderWidth: 1,
      color: 'rgb(26, 26, 26)'
    }
  }
  