# 第31章—组件实战：Popover气泡卡片组件

﻿组件库一般都有 Popover 和 Tooltip 这两个组件，它们非常相似。

![](./images/f14239b10eddd9c0914c00bd541f5cdd.webp )

![](./images/a4791ac6183fc112564e6657618460ce.webp )

不过应用场景是有区别的：

![](./images/1e1ec31cb644e9c5895de1f719d38cba.webp )

Tooltip（文字提示） 是用来代替 title 的，做一个文案解释。

而 Popover（气泡卡片）可以放更多的内容，可以交互：

![](./images/362181309ca02b0ec58e55a50bfd1d35.webp )

所以说，这俩虽然长得差不多，但确实要分为两个组件来写。

这个组件看起来比较简单，但实现起来很麻烦。

![](./images/beecfb9a471356a15d505f9330986b4b.webp )

你可能会说，不就是写好样式，然后绝对定位到元素上面么？

不只是这样。

首先，placement 参数可以指定 12 个方向，top、topleft、topright、bottom 等：

![](./images/f2329d30f67ccaffe828a15fc136fdc9.webp )

这些不同方向的位置计算都要实现。

而且，就算你指定了 left，当左边空间不够的时候，也得做下处理，展示在右边：

![](./images/c9bc3b842d252fcab2eda8c9f57bf6eb.webp )

而且当方向不同时，箭头的显示位置也不一样：

![](./images/71e9c0914c1bc1e5e20bae4b8f3dfe99.webp )

![](./images/3a662cb5c80a2075d61e66caddfcbb24.webp )

所以要实现这样一个 Popover 组件，光计算浮层的显示位置就是不小的工作量。

不过好在这种场景有专门的库做了封装，完全没必要自己写。

它就是 [floating-ui](https://floating-ui.com/)。

![](./images/9314b4c0d49816944f211869720c1a98.webp )

看介绍就可以知道，它是专门用来创建 tooltip、popover、dropdown 这类浮动的元素的。

它的 logo 也很形象：

![](./images/7885a5b84c162cbf52a816b00f35baa8.webp )

那它怎么用呢？

我们新建个项目试试看：

```
npx create-vite
```
![](./images/5ce670a26467077f72b20f14a15950c1.webp )

用 create-vite 创建个 react 项目。

进入项目，安装依赖，然后把服务跑起来：

```
npm install
npm run dev
```

![](./images/c9da1c1114ff1ec986dc4403bfe39cb1.webp )

![](./images/bfaa803c0c7e17ece2c4fcdf04ab2d54.webp )

没啥问题。

改下 main.tsx，去掉 index.css，并且把 StrictMode 去掉，它会导致重复渲染：

![](./images/325feac158468a681ab9341068169a0e.webp )

然后安装下 floating-ui 的包：

```
npm install --save @floating-ui/react
```

改下 App.tsx
```javascript
import {
  useInteractions,
  useFloating,
  useHover,
} from '@floating-ui/react';
import { useState } from 'react';
 
export default function App() {
  const [isOpen, setIsOpen] = useState(false);
 
  const {refs, floatingStyles, context} = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen
  });
 
  const hover = useHover(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover
  ]);

  return (
    <>
      <button ref={refs.setReference} {...getReferenceProps()}>
        hello
      </button>
      {
        isOpen && <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            光光光光光
          </div>
      }
    </>
  );
}
```
先看看效果：

![](./images/bf030d23ff4f138aabb4c8619ec8acce.gif )

可以看到，hover 的时候浮层会在下面出现。

看下代码：

![](./images/c6c91a8d7cfbb27d4fe008e15afb31e4.webp )

首先，用到了 useFloating 这个 hook，它的作用就是计算浮层位置的。

给它相对的元素、浮层元素的 ref，它就会计算出浮层的 style 来。

它可以指定浮层出现的方向：

![](./images/3e3e9792ecd9834d6e541b88189ef1a0.webp )

比如当 placement 指定为 right 时，效果就是这样的：

![](./images/f34fb4a4d540b4006218f3349465a9ac.gif )

再就是 useInteractions 这个 hook：

![](./images/a9967bb842ef0d56f3dce372fc9d75a4.webp )

你可以传入 click、hover 等交互方式，然后把它返回的 props 设置到元素上，就可以绑定对应的交互事件。

比如把交互事件换成 click：

![](./images/f65075a84b490bca44e7110d59d3eb0c.webp )

现在就是点击的时候浮层出现和消失了：

![](./images/9620e4ad18fae544dbff620e21b5a943.gif )

不过现在有个问题：

![](./images/d29737d6b83c77094acf4d26de376d10.gif )

只有点击按钮，浮层才会消失，点击其他位置不会。

这时候可以加上 dismiss 的处理：

![](./images/9f815eb4cf7d8d6420e2324a14e420eb.webp )

现在点击其它位置，浮层就会消失，并且按 ESC 键也会消失：

![](./images/1ac9707272ba7124e967f64ee0a6e944.gif )

也就是说 **useFloating 是用来给浮层确定位置的，useInteractions 是用来绑定交互事件的**。

有的同学会说，这也不好看啊。

我们加一下样式就好了：

![](./images/ea0fcd4debaf04cb861a83045c2ca696.webp )

加上 className，然后在 App.css 里写下样式：

```css
.popover-floating {
  padding: 4px 8px;
  border: 1px solid #000;
  border-radius: 4px;
}
```
引入看下：

![](./images/fc97951529817d5637dfe9845bb157cb.webp )

![](./images/ce05f536f67af67a22bc3483e673bc27.gif )

但是现在的定位有点问题，离着太近了，能不能修改下定位呢？

可以。

加一个 offset 的 middleware 就好了：

![](./images/b1711e434a30cec9241a9575a9cfbb8c.webp )

它的效果就是修改两者距离的：

![](./images/12fc90b9492b3a769a9442f8ec31f261.webp )

![](./images/f8832b34c1771f92feb087f43d0dfbe1.gif )

箭头也不用自己写，有对应的中间件：

![](./images/c060c8d74025a57f71e9c7992444456e.webp )

```javascript
import {
  useInteractions,
  useFloating,
  useHover,
  useClick,
  useDismiss,
  offset,
  arrow,
  FloatingArrow,
} from '@floating-ui/react';
import { useRef, useState } from 'react';

import './App.css';
 
export default function App() {
  const arrowRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
 
  const {refs, floatingStyles, context} = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'right',
    middleware: [
      offset(10),
      arrow({
        element: arrowRef,
      }),
    ]
  });
 
  const click = useClick(context);
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss
  ]);

  return (
    <>
      <button ref={refs.setReference} {...getReferenceProps()}>
        hello
      </button>
      {
        isOpen && <div
            className='popover-floating'
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            光光光
            <FloatingArrow ref={arrowRef} context={context}/>
          </div>
      }
    </>
  );
}
```
![](./images/cdacfbe99c40f14d25633fdb83eb8514.gif )

这样箭头就有了。

只不过样式不大对，我们修改下：

```javascript
<FloatingArrow ref={arrowRef} context={context} fill="#fff" stroke="#000" strokeWidth={1}/>
```
![](./images/4631fcd7a248b4912e548e34d861c08c.gif )

这样，箭头位置就有了。

给 button 加一些 margin，我们试试其它位置的 popover 对不对：

![](./images/3b0103696c1190819013517a2f3a7f77.webp )

分别设置不同 placement：

![](./images/0b2d8f6f6eaacb8579566f13f0d13bfa.webp )

top-end

![](./images/b733badea19e28c5290f9459a4798d97.webp )

left-start

![](./images/6f7704e8c263ce214d41adeccb4aee15.webp )

left

![](./images/d51816286bd789a834efcaf5c536e1e2.webp )

都没问题。

不过现在并没有做边界的处理：

![](./images/eca7141e9b26201fe3e03dbea80b8157.gif )

设置 top 的时候，浮层超出可视区域，这时候应该显示在下面。

加上 flip 中间件就好了：

![](./images/f1377706315251f53ca1b65e550ff03e.webp )

![](./images/881157006f889f36f745665ff1495745.gif )

这样，popover 的功能就完成了。

我们封装下 Popover 组件。

新建 Popover/index.tsx

```javascript
import { CSSProperties, PropsWithChildren, ReactNode } from "react";
import {
    useInteractions,
    useFloating,
    useClick,
    useDismiss,
    offset,
    arrow,
    FloatingArrow,
    flip,
    useHover,
} from '@floating-ui/react';
import { useRef, useState } from 'react';
import './index.css';
  
type Alignment = 'start' | 'end';
type Side = 'top' | 'right' | 'bottom' | 'left';
type AlignedPlacement = `${Side}-${Alignment}`;

interface PopoverProps extends PropsWithChildren {
    content: ReactNode,
    trigger?: 'hover' | 'click'
    placement?: Side | AlignedPlacement,
    open?: boolean,
    onOpenChange?: (open: boolean) => void,
    className?: string;
    style?: CSSProperties
}

export default function Popover(props: PopoverProps) {

    const {
        open,
        onOpenChange,
        content,
        children,
        trigger = 'hover',
        placement = 'bottom',
        className,
        style
    } = props;

    const arrowRef = useRef(null);

    const [isOpen, setIsOpen] = useState(open);
     
    const {refs, floatingStyles, context} = useFloating({
      open: isOpen,
      onOpenChange: (open) => {
        setIsOpen(open);
        onOpenChange?.(open);
      },
      placement,
      middleware: [
        offset(10),
        arrow({
          element: arrowRef,
        }),
        flip()
      ]
    });
   
    const interaction = trigger === 'hover' ? useHover(context) : useClick(context);

    const dismiss = useDismiss(context);
  
    const { getReferenceProps, getFloatingProps } = useInteractions([
        interaction,
        dismiss
    ]);
  
    return (
      <>
        <span ref={refs.setReference} {...getReferenceProps()} className={className} style={style}>
          {children}
        </span>
        {
          isOpen && <div
              className='popover-floating'
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
            >
              {content}
              <FloatingArrow ref={arrowRef} context={context} fill="#fff" stroke="#000" strokeWidth={1}/>
            </div>
        }
      </>
    );
}

```
Popover/index.css

```css
.popover-floating {
    padding: 4px 8px;
    border: 1px solid #000;
    border-radius: 4px;
}
```
整体代码和之前差不多，有几处不同：

![](./images/5496ed023bd51df646a2ccc4f3e72d1e.webp )

参数继承 PropsWithChildren，可以传入 children 参数。

可以传入 content，也就是浮层的内容。

trigger 参数是触发浮层的方式，可以是 click 或者 hover。

placement 就是 12 个方向。

而 open、onOpenChange 则是可以在组件外控制 popover 的显示隐藏。

className 和 style 设置到内层的 span 元素上：

![](./images/1a8bd3941b3c93d8058cc4cd8f32816b.webp )

在 App.tsx 里引入下：

```javascript
import Popover from './Popover';

export default function App() {

  const popoverContent = <div>
    光光光
    <button onClick={() => {alert(1)}}>111</button>
  </div>;

  return <Popover
    content={popoverContent}
    placement='bottom'
    trigger='click'
    style={{margin: '200px'}}
  >
    <button>点我点我</button>
  </Popover>
}
```
![](./images/f7211c6f128aeba748bfa8aeb4be99d2.gif )

这样，Popover 组件的基本功能就完成了。

但现在 Popover 组件还有个问题：

![](./images/1038e77a8c61eeec5bc927b97ea011bf.webp )

浮层使用 position：absolute 定位的，应该是相对于 body 定位，但如果中间有个元素也设置了 position: relative 或者 absolute，那样定位就是相对于那个元素了。

所以，要把浮层用 createPortal 渲染到 body 之下。

![](./images/eb2395feb315a0766c4a693a0f30c5ea.webp )

```javascript
const el = useMemo(() => {
    const el = document.createElement('div');
    el.className = `wrapper`;

    document.body.appendChild(el);
    return el;
}, []);

const floating = isOpen && <div
    className='popover-floating'
    ref={refs.setFloating}
    style={floatingStyles}
    {...getFloatingProps()}
>
    {content}
    <FloatingArrow ref={arrowRef} context={context} fill="#fff" stroke="#000" strokeWidth={1}/>
</div>

return (
  <>
    <span ref={refs.setReference} {...getReferenceProps()} className={className} style={style}>
      {children}
    </span>
    {
      createPortal(floating, el)
    }
  </>
);
```

这样，Popover 浮层就渲染到了 body 下：

![](./images/b270c21c7f896b172c843bfe2b727a1a.webp )

至此，Popover 组件就封装完了。

其实 floating-ui 用的非常多，比如下一节会讲的 click-to-react-component，它就用到了 floating-ui 来实现的：

![](./images/9e98b4261f621387888376d900b5efaa.webp )

案例代码上传了[小册仓库](https://github.com/QuarkGluonPlasma/react-course-code/tree/main/popover-component)

## 总结

今天我们封装了 Popover 组件。

如果完全自己实现，计算位置还是挺麻烦的，有 top、right、left 等不同位置，而且到达边界的时候也要做特殊处理。

所以我们直接基于 floating-ui 来做，它是专门用于 tooltip、popover、dropdown 等浮动组件的。

用 useFloating 的 hook 来计算位置，用 useIntersections 的 hook 来处理交互。

它支持很多中间件，比如 offset 来设置偏移、arrow 来处理箭头位置，可以完成各种复杂的定位功能。

我们封装了一层，加了一些参数，然后把浮层用 createPortal 渲染到了 body 下。

这样就是一个功能完整的 Popover 组件了。

如果完全自己实现 Popover 组件，还是挺麻烦的，但是基于 floating-ui 封装，就很简单。
