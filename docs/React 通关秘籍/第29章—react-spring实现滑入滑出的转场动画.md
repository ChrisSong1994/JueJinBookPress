# 第29章—react-spring实现滑入滑出的转场动画

﻿有的时候，直接展示一个组件会过于突兀，需要一些过渡效果。

比如这样：

![](./images/96e15ab914da55ce622bdf19a755f82e.gif )

点击结算的时候，展示结算页面的组件，点击返回的时候隐藏。

这里是通过滑入滑出的动画来实现的过渡。

这个效果是我公司的项目里真实在用的，这节我们来一起实现下。

我们说的转场动画、过渡动画是一个东西，你看下英文翻译就知道了：

![](./images/9c03b464bd7e3d348088ae28c88fcfb7.png )

![](./images/6481707fa8c686d9be80a51e8f8b8c33.png )

这里的过渡动画很明显可以用我们学过的 react-transition-group 或者 react-spring 来做。

我们就用 reac-spring 结合上节学的 styled-components 来实现下。

创建个 vite 项目：

```
npx create-vite slide-in-out-transition
```

![](./images/99e6115c4e8a5562632a3ab4b035b73f.png )

安装用到的包：

```
npm install

npm install --save @react-spring/web

npm install --save styled-components
```

要实现这样的效果：

![](./images/ef66037760f38bcd74f05cb58c1149a0.gif )

首先，我们需要一个 div 包裹它。

创建 src/Overlay.tsx

```javascript
import styled from "styled-components";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 10;
`;

export default Overlay;
```

然后在 src/SlideInOverlay.tsx 里用一下：

```javascript
import React, { FC, PropsWithChildren } from "react";
import { useTransition, animated } from "@react-spring/web";
import Overlay from "./Overlay";

const DURATION = 300;

interface SlideInOverlayProps extends PropsWithChildren {
  isVisible: boolean;
  from?: "right" | "bottom";
}

const SlideInOverlay: FC<SlideInOverlayProps> = (props) => {
  const { isVisible, from = "right", children } = props;

  const x = React.useMemo(
    () => (from === "right" ? window.screen.width : window.screen.height),
    [from]
  );

  const transitions = useTransition(isVisible, {
    x,
    opacity: 1,
    from: {
      x,
      opacity: 1,
    },
    enter: { x: 0, opacity: 1 },
    leave: { x, opacity: 0 },
    config: { duration: DURATION },
  });

  const translate = React.useCallback(
    (x: number) => {
      switch (from) {
        case "right":
          return `translateX(${x}px)`;
        case "bottom":
          return `translateY(${x}px)`;
      }
    },
    [from]
  );

  return (
    <>
      {transitions(
        (props, isVisible) =>
          isVisible && (
            <Overlay
              as={animated.div}
              style={{
                transform: props.x.to((x) => (x === 0 ? "none" : translate(x))),
                opacity: props.opacity,
              }}
            >
              {children}
            </Overlay>
          )
      )}
    </>
  );
};

export { SlideInOverlay, DURATION };
```

代码比较多，我们一部分一部分来看下：

首先，这个 SlideInOverlay 组件有 3 个 props：

![](./images/9c89b286834301bae573e96f9e8b188c.png )

isVisible 是是否展示。

from 是从右向左还是从下向上来运动，取值为 right 或 bottom。

children 传入具体的内容。

![](./images/978c87e6af658b8ac99d13acf26996d1.png )


用 react-spring 的 useTransition 来做动画，改变 x、opcity 属性。

设置初始值、from 的值、enter 的值，以及 leave 的值。

也就是进入动画开始、进入动画结束、离开动画结束的值。

然后下面的 div 使用 react-spring 传入的 x、opcity 来设置样式就好了。

![](./images/2571f00b51432c308c75987497d8835d.png )

Overlay 是样式组件，用 as 转为用 animated.div 渲染。

初始值 x 根据 from 参数是 right 还是 bottom 来设置 window.screen.width 或者 height。


这里用 useMemo 的好处是只要 from 参数没变，就直接用之前的值。

然后 react-spring 传入的 x 还需要根据 from 来转为 translateX 或者 translateY 的样式。

这样，转场动画就完成了。

我们来试一下：

去掉 main.tsx 的 StrictMode 和 index.css。

![](./images/3612a7f9207ce12fbaed301a427bdce8.png )

在 App.tsx 里用一下：

![](./images/b9ef9382d113b7d9956078e80824e281.png )

```javascript
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { SlideInOverlay } from "./SlideInOverlay";

function App() {
  const [count, setCount] = useState(0);
  const [show, setShow] = useState(false);

  return (
    <>
      <button
        onClick={() => {
          setShow(true);
        }}
      >
        开启
      </button>
      <SlideInOverlay
        isVisible={show}
        from="right"
        className={"guangguang"}
        style={{
          border: "2px solid #000",
        }}
      >
        <div>
          <button
            onClick={() => {
              setShow(false);
            }}
          >
            关闭
          </button>
          <a href="https://vitejs.dev" target="_blank">
            <img src={viteLogo} className="logo" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <img src={reactLogo} className="logo react" alt="React logo" />
          </a>
        </div>
        <h1>Vite + React</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </SlideInOverlay>
    </>
  );
}

export default App;
```

我们加了一个 state 来保存显示隐藏状态，加了两个 button，点击的时候切换。

跑一下：

```
npm run dev
```

![](./images/d78504d6fd9b7d297955158766eaf7ee.png )

![](./images/0eda34ad0d0a54176399eb4ecd22e277.gif )

可以看到，滑入滑出的转场动画（或者叫过渡动画）生效了。

而且因为只是改变了 translate，组件不会销毁，所以状态也可以保留。

再来试下另一种效果，把 from 改为 bottom：

![](./images/0c7ff28cc511655d793eaaa8250f54f7.gif )

完美！

用在真实项目里就是这样的：

![](./images/96e15ab914da55ce622bdf19a755f82e.gif )

然后我们再完善一下细节：

加上 className 和 style 两个 props。

![](./images/6307c8290dd2f602e5cc4d4de85ff104.png )

```javascript
interface SlideInOverlayProps extends PropsWithChildren {
  isVisible: boolean;
  from?: "right" | "bottom";
  className?: string | string[];
  style?: CSSProperties;
}
```

传入样式组件：

![](./images/51f77f1f663ee096edbf2551893ec193.png )

安装用到的 classnames 包

```
npm install --save classnames
```

测试下：

![d-14.png](./images/5dbe601fd9abd7529f29d75d7f086b95.png )

![](./images/75ce3ad9e78942fb870d09ce9b22bc2c.gif )

可以看到 style 生效了，className 也加上了。

我们继续完善，添加 onEnter 参数：

![](./images/6207aa9a011a0e6048079e31593bd391.png )

然后加一下处理逻辑：

![](./images/76e604ec04df64cf13bf57505c34a503.png )

```javascript
useEffect(() => {
  let timer = null;

  if (isVisible === true && onEnter != null) {
    timer = setTimeout(onEnter, DURATION);
  }

  return () => {
    if (timer != null) {
      clearTimeout(timer);
    }
  };
}, [isVisible, onEnter]);
```

因为我们设置了动画的时长是 DURATION 常量，所以这里用一个 setTimeout 就可以实现 onEnter

判断下 isVisible 是 true 的时候再执行 onEnter 的定时器。

并且当 isVisible、onEnter 变化的时候，销毁上次的定时器，重新跑。

测试下：

![](./images/4f5105aa119d2f7d13e96f01cb21800a.png )

![](./images/966b1f3f36bc4cc09947f656b9761f8a.gif )

没啥问题。

接下来继续实现 onExit。

![](./images/6ba4ee140e96f8c3c31405bd9c153418.png )

添加参数，然后加上 useEffect 通过 setTimeout 触发：

![](./images/97b9c72771d6e286fd86b272a5d1f18a.png )

```javascript
useEffect(() => {
  let timer = null;

  if (isVisible === false && onExit != null) {
    timer = setTimeout(onExit, DURATION);
  }

  return () => {
    if (timer != null) {
      clearTimeout(timer);
    }
  };
}, [isVisible, onExit]);
```

跑一下：

![](./images/4e081ca45d2e739bf8d057b9211f6975.png )

![](./images/4f0f20a571f29125068358075dc8e461.gif )

可以看到，滑入滑出时的回调没问题，但是最开始多回调了一次 onExit。

如何判断出最开始那一次呢？

记录下 isVisible 参数就可以了，如果是从 true 变为 false 才触发。

用 useRef 保存上次的 isVisible 参数的值，如果上次的是 true 而当前 isVisible 是 false 就触发。

![](./images/cda87f03a4de38718ab77e9d3c3ad5bc.png )

```javascript
const visibleRef = useRef(isVisible);

useEffect(() => {
    let timer = null;

    if (isVisible === false && visibleRef.current === true && onExit != null) {
      timer = setTimeout(onExit, DURATION);
    }

    visibleRef.current = isVisible;

    return () => {
      if (timer != null) {
        clearTimeout(timer);
      }
    };
}, [isVisible, onExit]);
```
测试下：

![](./images/8c195b9875ae44adee37324d14e3d9fd.gif )

可以看到，现在最开始多的一次调用就没有了。

这样，这个 SlideInOverlay 组件就完成了。

当然，你还可以做更多的扩展，比如点击商品的时候从下面滑入商品详情：

![](./images/d04907d54b78168b10833826eb0c40ef.png )

![](./images/b980478e271e3e104e9ac9d99d0bc52b.gif )

这里是距离顶部有一段距离的，这个距离也可以作为参数传入。

如果想实现这种和手势结合的动画呢？

![](./images/af42a933c83e24520a87758e2b1631db.png )

这个我们做过了呀，可以回去看看手势库那节。

拖动速度、方向、距离这类需求都可以用手势库搞定。

案例代码上传了[小册仓库](https://github.com/QuarkGluonPlasma/react-course-code/tree/main/slide-in-out-transition)

## 总结

很多场景下，加上转场动画会使交互体验更好。

这节我们用 react-spring 实现了滑入滑出的转场动画（或者叫过渡动画）。

支持了 isVisible、from、children、onExit、onEnter、className、style 参数。

from 可以设置 right 或 bottom，然后根据它来设置 x 参数初始值为 window.screen.width 或者 window.screen.height。

改变 x、opacity 就可以实现滑入滑出的动画。

我们通过 useRef 记录之前的参数来实现了 onExit 的回调。

用 styled-components 写了外层 div 的样式。

这样的 SlideInOverlay 组件就比较完善了，可以直接用在项目里。
