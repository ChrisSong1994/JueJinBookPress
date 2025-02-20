组件库一般都有 Popover 和 Tooltip 这两个组件，它们非常相似。

![](./images/c98607761ead4b62a7dcb368119b3013~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/483824efb3fa44e3bc85049134652ee4~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

不过应用场景是有区别的：

![](./images/d5ffd0767e4047a68e5f51b6c564b624~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

Tooltip（文字提示） 是用来代替 title 的，做一个文案解释。

而 Popover（气泡卡片）可以放更多的内容，可以交互：

![](./images/9e5efa61cacf4e0898590b6993368d8e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

所以说，这俩虽然长得差不多，但确实要分为两个组件来写。

这个组件看起来比较简单，但实现起来很麻烦。

![](./images/bc6f8039878e408c95207df6d11e1c2b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

你可能会说，不就是写好样式，然后绝对定位到元素上面么？

不只是这样。

首先，placement 参数可以指定 12 个方向，top、topleft、topright、bottom 等：

![](./images/09569079742748cc9923b74402b705fa~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这些不同方向的位置计算都要实现。

而且，就算你指定了 left，当左边空间不够的时候，也得做下处理，展示在右边：

![](./images/14fc65b129094835ad40bbca3c8e45cd~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

而且当方向不同时，箭头的显示位置也不一样：

![](./images/a8044225179942678cf1a5011713aea0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/50ba7a55adad49148e757ade0a0a49ae~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

所以要实现这样一个 Popover 组件，光计算浮层的显示位置就是不小的工作量。

不过好在这种场景有专门的库做了封装，完全没必要自己写。

它就是 [floating-ui](https://floating-ui.com/)。

![](./images/bd0c51403961461fb7a8c044b9f83eb2~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

看介绍就可以知道，它是专门用来创建 tooltip、popover、dropdown 这类浮动的元素的。

它的 logo 也很形象：

![](./images/f235a16f02024372bdafe0550c28be66~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

那它怎么用呢？

我们新建个项目试试看：

```
npx create-vite
```
![](./images/7ab22ae4ff5c499591597b861a8b1220~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

用 create-vite 创建个 react 项目。

进入项目，安装依赖，然后把服务跑起来：

```
npm install
npm run dev
```

![](./images/89ada9c5558a4bcbbd55332fb971a481~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/497ac1eadb864b638380003f8e3f7f81~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

没啥问题。

改下 main.tsx，去掉 index.css，并且把 StrictMode 去掉，它会导致重复渲染：

![](./images/a81f633ac8dc41758b497a7aaf49f438~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

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

![](./images/c8038d65c3bb4c6b8a18fc8be125897b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

可以看到，hover 的时候浮层会在下面出现。

看下代码：

![](./images/bb9b9312509a498e8fc61fe621100a06~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

首先，用到了 useFloating 这个 hook，它的作用就是计算浮层位置的。

给它相对的元素、浮层元素的 ref，它就会计算出浮层的 style 来。

它可以指定浮层出现的方向：

![](./images/192478acb40d47bba8590fc81ca72737~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

比如当 placement 指定为 right 时，效果就是这样的：

![](./images/c10b7cc935bf4197b99fbbdd9460cff3~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

再就是 useInteractions 这个 hook：

![](./images/efa582f8594a42679dbe1bfc83270741~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

你可以传入 click、hover 等交互方式，然后把它返回的 props 设置到元素上，就可以绑定对应的交互事件。

比如把交互事件换成 click：

![](./images/31855b1a82b54460bb9cdae1195dd74b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

现在就是点击的时候浮层出现和消失了：

![](./images/34b27dbf135b45c99e34bfe868c117ba~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

不过现在有个问题：

![](./images/abb95c82d3c04fe68d59ebddc92bb69c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

只有点击按钮，浮层才会消失，点击其他位置不会。

这时候可以加上 dismiss 的处理：

![](./images/8d6af128bc844883815274c77edf347f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

现在点击其它位置，浮层就会消失，并且按 ESC 键也会消失：

![](./images/890198602c6a43e295dbdecad7c49240~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

也就是说 **useFloating 是用来给浮层确定位置的，useInteractions 是用来绑定交互事件的**。

有的同学会说，这也不好看啊。

我们加一下样式就好了：

![](./images/a5a1e23a33734c99941e986243514e0b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

加上 className，然后在 App.css 里写下样式：

```css
.popover-floating {
  padding: 4px 8px;
  border: 1px solid #000;
  border-radius: 4px;
}
```
引入看下：

![](./images/a26d4a4301a1455c9a162ea7cb7ab02c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/153bd2dcfd5a40c99caf8eabd64d947b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

但是现在的定位有点问题，离着太近了，能不能修改下定位呢？

可以。

加一个 offset 的 middleware 就好了：

![](./images/01b96436263d464a98861cf5bd03a1da~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

它的效果就是修改两者距离的：

![](./images/ffd325b8bcd047b4b423aef52438d91e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/11ce185cb6ab4a6aba4293bcb094a28a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

箭头也不用自己写，有对应的中间件：

![](./images/23c904d1596e495b8d15ad11bd5d3dc0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

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
![](./images/a9d5a8a4c1d841bb96a38bb6542cfff8~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这样箭头就有了。

只不过样式不大对，我们修改下：

```javascript
<FloatingArrow ref={arrowRef} context={context} fill="#fff" stroke="#000" strokeWidth={1}/>
```
![](./images/92045d0610e445eaa9e9370122b3b80b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这样，箭头位置就有了。

给 button 加一些 margin，我们试试其它位置的 popover 对不对：

![](./images/622d58aef9a1479a948c47280c557bd8~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

分别设置不同 placement：

![](./images/07ccabd81fc94a39a7cca0b9bc465e31~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

top-end

![](./images/2b634a7ab0204d87a54661432cf35bfd~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

left-start

![](./images/c29ab0ae2d744ab19240904b780d9a1a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

left

![](./images/c8c10d828d594f1d8d045643b39bf77d~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

都没问题。

不过现在并没有做边界的处理：

![](./images/02a22f65f3ec43078355336750298611~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

设置 top 的时候，浮层超出可视区域，这时候应该显示在下面。

加上 flip 中间件就好了：

![](./images/3d6f65adc4094bd195a250d2d0cee92c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/207d3da0d05b495793d7f720d0a04c4c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

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

![](./images/4a4d5df388594cae82ce7f064403f8ec~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

参数继承 PropsWithChildren，可以传入 children 参数。

可以传入 content，也就是浮层的内容。

trigger 参数是触发浮层的方式，可以是 click 或者 hover。

placement 就是 12 个方向。

而 open、onOpenChange 则是可以在组件外控制 popover 的显示隐藏。

className 和 style 设置到内层的 span 元素上：

![](./images/3a84290765f549d1b16ab15dab8b3c72~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

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
![](./images/b288d14a1a794aea878df4a55d56c4a9~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这样，Popover 组件的基本功能就完成了。

但现在 Popover 组件还有个问题：

![](./images/2a3cfe6b95f44168adcecfb8dad49fb4~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

浮层使用 position：absolute 定位的，应该是相对于 body 定位，但如果中间有个元素也设置了 position: relative 或者 absolute，那样定位就是相对于那个元素了。

所以，要把浮层用 createPortal 渲染到 body 之下。

![](./images/a5dc4e2d748c451590223c2a5bff0578~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

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

![](./images/587c2e8d62124c12bf049c4570797f44~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

至此，Popover 组件就封装完了。

其实 floating-ui 用的非常多，比如下一节会讲的 click-to-react-component，它就用到了 floating-ui 来实现的：

![](./images/997df95e386e4cad902a7553702a74f7~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

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
