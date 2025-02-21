# 第24章—react-spring结合use-gesture手势库实现交互动画

﻿上节我们学了用 react-spring 做动画。

其实也简单，就是指定某些属性的开始值、结束值，动画的时长或者弹簧动画的一些参数，react-spring 就会实现这些属性的动画。

再就是多个元素可以设置并行、依次执行或者间隔一段时间执行的顺序。

但是很多情况下，动画不是直接触发的，而是由 drag、hover、scroll 等事件触发。

这节我们就结合事件来实现一些交互动画。

我们会用到一个手势库 @use-gesture/react

可能很多同学都没用过手势库，其实手势库里就是对 drag、hover、scroll 这些事件的封装：

![](./images/3776e91803aaf2ff9d7689bd9aab7803.png )

直接给元素绑定事件不行么，为啥还要加一个手势库呢？

那如果我想知道移动的方向、移动的距离、移动的速率呢？

自己算这些就很麻烦，而用了手势库，这些就都有了。

新建个项目来试下：

```shell
npx create-react-app --template=typescript use-gesture-test
```
![](./images/2484360c6d66cbdaca5fe5e962dc9dac.png )

我们来实现这样一个案例：

![](./images/3237c3b66668639bdfecfc6d4d0001c2.gif )

拖拽的时候触发动画，通过 use-gesture 实现拖动，拿到方向、距离等信息，然后用 react-spring 做属性变化的动画。

安装这两个包：

```shell
npm install --save @react-spring/web @use-gesture/react
```

改下 App.tsx

```javascript
import { useSprings, animated } from '@react-spring/web'

import './App.css';

const pages = [
  'https://images.pexels.com/photos/62689/pexels-photo-62689.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'https://images.pexels.com/photos/733853/pexels-photo-733853.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'https://images.pexels.com/photos/4016596/pexels-photo-4016596.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'https://images.pexels.com/photos/351265/pexels-photo-351265.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'https://images.pexels.com/photos/924675/pexels-photo-924675.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
]

function Viewpager() {
  const width = window.innerWidth;

  const [props, api] = useSprings(pages.length, i => ({
    x: i * width,
    scale: 1
  }));

  return (
    <div className='wrapper'>
      {props.map(({ x, scale }, i) => (
        <animated.div className='page' key={i} style={{ x }}>
          <animated.div style={{ scale, backgroundImage: `url(${pages[i]})` }} />
        </animated.div>
      ))}
    </div>
  )
}

export default Viewpager;
```
这里是多个元素并行的动画，用 useSprings。

然后改变 x 和 scale 属性。

x 的初始值是 width * i，也就是依次平铺。

所有接收动画属性的地方都要用 \<animated.div> ，这里用到 x 和 scale 属性的两个 div 换成 \<animated.div>

然后是 App.css：

```css
html,body,#root {
  height: 100%;
  width: 100%;
}

.wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.page {
  position: absolute;
  width: 100%;
  height: 100%;
  touch-action: none;
}

.page > div {
  touch-action: none;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  width: 100%;
  height: 100%;
  box-shadow: 0 0 50px #000;
}

```

这里图片要充满屏幕，从 html、body、#root 到 .wrapper、.page 都要设置宽高 100%：

![](./images/03a498340b40a1e85e6690108763c647.png )

touch-action 设置为 none 是禁止移动端的默认 touch 处理。

不然默认会导致页面的缩放和滑动：

![](./images/ecd781d9328a1306c84d642b60040294.png )

可以看到，渲染的结果是对的：

![](./images/3054df17c1d1edc428cdc637318144b4.png )

这里我们设置的 x，但是 react-spring 用 translate3d 来实现的，这是它内部做的性能优化。

接下来用 use-gesture 来加上手势的处理：

![](./images/7f3a6f4f2f9880ea56d8dff89adf163e.png )

```javascript
import { useRef } from 'react'
import { useSprings, animated } from '@react-spring/web'
import { useDrag } from '@use-gesture/react';

import './App.css';

const pages = [
  'https://images.pexels.com/photos/62689/pexels-photo-62689.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'https://images.pexels.com/photos/733853/pexels-photo-733853.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'https://images.pexels.com/photos/4016596/pexels-photo-4016596.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'https://images.pexels.com/photos/351265/pexels-photo-351265.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'https://images.pexels.com/photos/924675/pexels-photo-924675.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
]

function Viewpager() {
  const index = useRef(0);
  const width = window.innerWidth;

  const [props, api] = useSprings(pages.length, i => ({
    x: i * width,
    scale: 1
  }));

  const bind = useDrag(({ active, movement: [mx], direction: [xDir], cancel }) => {
  
  });

  return (
    <div className='wrapper'>
      {props.map(({ x, scale }, i) => (
        <animated.div className='page' {...bind()} key={i} style={{ x }}>
          <animated.div style={{ scale, backgroundImage: `url(${pages[i]})` }} />
        </animated.div>
      ))}
    </div>
  )
}

export default Viewpager;
```
用 useRef 保存当前的 index，初始值是 0。

用 use-gesture 也很简单，绑定啥事件就用 useXxx，比如 useDrag、useHover、useScroll 等。

![](./images/6a63ff334e1dd3fed445482f6b9d9de4.png )

或者用 useGesture 同时绑定多种事件：

![](./images/7f31d8e7a62a9d92ade0829d78230e44.png )

手势库最大的好处是可以拿到移动的方向、速率、距离等信息。

这里我们拿到的这几个参数：

![](./images/b34f7447e4447385b5c26961d21a2d40.png )

movement 是拖动距离 [x, y] 

direction 是拖动方向 [x, y]，1 代表向左（向上）、-1 代表向右（向下）。

active 是当前是否在拖动。

cancel 方法可以中止事件。

拖动时的处理如下：

```javascript
const bind = useDrag(({ active, movement: [mx], direction: [xDir], cancel }) => {
  if (active && Math.abs(mx) > width / 2) {
    let newIndex = index.current + (xDir > 0 ? -1 : 1);

    if(newIndex < 0) {
      newIndex = 0;
    }

    if(newIndex > pages.length - 1) {
      newIndex = pages.length - 1;
    }

    index.current =  newIndex;
    
    cancel()
  }
  api.start(i => {
    const x = (i - index.current) * width + (active ? mx : 0)
    const scale = active ? 1 - Math.abs(mx) / width : 1
    return { x, scale }
  })
});
```

当正在拖动并且拖动的距离超过了宽度的一半，就改变 index。

改变 index 之后调用 cancel，就不再处理后续 drag 事件了。

index 根据移动的方向来计算，xDir 大于 0，就是向左，index 减一，反之加一

然后根据拖动距离来计算每个元素的 x 和 scale：

x 根据和当前 index 的差值 * width 计算，然后加上拖动的距离。

比如当前 index 为 1，那 index 为 2 的 x 就是 (2 - 1) * width，而 index 为 0 的就是 (0 - 1) * width

而 scale 则是用拖动的距离除以 width 算一个比值，然后用 1 减去它，因为刚开始拖动的时候 scale 大。

![](./images/64ee736ac72ff839c02a7a42eb8abe3e.gif )

但是现在 scale 的变化范围有点大。

可以调整下：

![](./images/a616045bfe3f96de206f66f94fc782ab.png )

计算出来的比值除以 2  或者除以 3 就好了

![](./images/c9474f06dd8fa544b346ed0f4b833ed9.gif )

这样我们就完成了 use-gesture 手势库和 react-spring 动画库的结合使用的案例。

用 use-gesture 手势库处理拖拽等事件，拿到移动距离、方向、速率等信息，然后再根据这些信息用 react-spring 做动画。

use-gesture 文档里还有个案例也很有意思：
![](./images/665af2028152e84058998e1f0dff5fdd.gif )

如果拖动速度慢了，牌会回到原位置，只有快速拖动，牌才会移到一边。

它的实现就是用了 velocity 速率，也就是每 ms 移动的距离，如果大于 0.2 就算移到一边，设置对应的 x，否则就设置 0：

![](./images/444f69dad3ce631ee62ee9fba596048d.png )

具体流程都差不多，也是 use-gesture 和 react-spring 的结合使用，感兴趣可以[看看](https://codesandbox.io/p/sandbox/cards-stack-to6uf?file=%2Fsrc%2FApp.tsx%3A36%2C83-36%2C91)。

案例代码上传了[小册仓库](https://github.com/QuarkGluonPlasma/react-course-code/tree/main/use-gesture-test)

## 总结

这节我们学了手势库 use-gesture。

手势库也是处理 drag、scroll、hover 等事件，但是它封装了额外的信息，比如移动方向、距离、速率等。

用这些信息结合 react-spring 就可以实现各种交互动画。
