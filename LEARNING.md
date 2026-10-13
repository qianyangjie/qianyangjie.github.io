# 从页面元素到滚动动画

阅读项目时沿着这条链：**HTML 元素 → CSS 样式 → JavaScript DOM → GSAP timeline → ScrollTrigger 滚动动画**。

## HTML：页面里有什么

index.html 中，section 定义章节，h2 定义标题，a 定义链接。id 让导航找到章节。

```html
<section id="about">
  <h2 data-i18n="about.title1">Driven by Curiosity.</h2>
</section>
```

这些元素在 JavaScript 加载前就存在，保证首屏有可读内容。

## CSS：元素看起来怎样

global.css 控制颜色、字号和排列。class 连接 HTML 与 CSS。

```css
.section-heading {
  font-size: clamp(42px, 5.6vw, 78px);
  line-height: 1.08;
}
```

clamp 用最小值、随屏宽变化的值和最大值控制字号；Grid 排列卡片；@media 在手机上切换成一列。

## JavaScript DOM：找到并改变元素

DOM 是浏览器对 HTML 的对象表示。querySelector 找到元素，textContent 修改文字。

```javascript
const heading = document.querySelector('[data-i18n="about.title1"]');
heading.textContent = '以好奇心探索，';
```

本项目用 content.js 的两份 translations 字典管理文案。切换时不删除元素，动画仍有效。localStorage 记住语言偏好。

## GSAP timeline：组织变化先后

```javascript
const timeline = gsap.timeline();
timeline.to('.hero-copy', { opacity: 0, y: -65, duration: .3 }, 0);
timeline.to('.radar-wrap', { scale: 1.35, duration: .5 }, .1);
```

to 表示“变化到什么状态”。最后的 0 和 .1 是开始位置，因此两段动画可以重叠。timeline 让变化组成连续叙事。

## ScrollTrigger：让滚动成为时间轴

```javascript
const timeline = gsap.timeline({
  scrollTrigger: {
    trigger: '#home',
    start: 'top top',
    end: '+=1200',
    pin: '.hero-stage',
    scrub: .65,
  },
});
```

trigger 指定测量元素；start 定义起点；end 定义距离；pin 在叙事期间固定视觉；scrub 将滚动进度映射到时间轴并稍微平滑变化。往回滚动时动画倒放。

本项目保留浏览器原生滚动。手机与减少动态模式取消 pin。

## Canvas：画面如何跟随进度

research.js 的 state.progress 是 0–1 的数字。timeline 改变数字，draw 根据数字绘制同一组模拟信号。绘制的是像素，不会每帧新增 HTML 节点。

建议练习：修改一条双语介绍，再改一个颜色变量，最后调整标题渐入的 duration。每次只改一处，用 npm run dev 观察结果。先理解元素、样式和 DOM 的连接，再学习完整时间轴。
