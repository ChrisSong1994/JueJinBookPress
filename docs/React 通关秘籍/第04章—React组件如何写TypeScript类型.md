# 第04章—React组件如何写TypeScript类型

﻿现在写 React 组件都是基于 TypeScript，所以如何给组件写类型也是很重要的。

这节我们就来学下 React 组件如何写 TypeScript 类型。

用 cra 创建个项目：

```
npx create-react-app --template typescript react-ts
```

![](./images/ef69c253d7a6da833502ccbb886ecd87.webp )

我们平时用的类型在 @types/react 这个包里，cra 已经帮我们引入了。

![](./images/1c6d4ee42611c3976d7914c8da8d8317.webp )

## JSX 的类型

在 App.tsx 里开始练习 TypeScript 类型：

```javascript
interface AaaProps {
  name: string;
}

function Aaa(props: AaaProps) {
  return <div>aaa, {props.name}</div>
}

function App() {
  return <div>
    <Aaa name="guang"></Aaa>
  </div>
}

export default App;
```

其实组件我们一般不写返回值类型，就用默认推导出来的。

![](./images/110a28277f1d341b9f416c635d626595.webp )

React 函数组件默认返回值就是 JSX.Element。

我们看下 JSX.Element 的类型定义：

```javascript
const content: JSX.Element = <div>aaa</div>
```
![](./images/91c0040bddc130e74f19c65d9b7e9dc7.webp )

可以看到它就是 React.ReactElement。

也就是说，如果你想描述一个 jsx 类型，就用 React.ReactElement 就好了。

比如 Aaa 组件有一个 content 的 props，类型为 ReactElement：

![](./images/7a7635b88ca9cc0164830cf734bff563.webp )

这样就只能传入 JSX。

跑一下：
```
npm run start
```

![](./images/fbfb3e0ebe0dbe188a6cc89d83ba0460.webp )

ReactElement 就是 jsx 类型，但如果你传入 null、number 等就报错了：

![](./images/9035f5f97a82a4e0574407c4225c0b1f.webp )

![](./images/2f166dc229dcbc078751d6dfa96e3b52.webp )

那如果有的时候就是 number、null 呢？

换成 ReactNode 就好了：

![](./images/53a9d01e1ed21941a4a190ed9328021f.webp )

看下它的类型定义：

![](./images/03754e6dfe67b38766f0219fd8adfc1e.webp )

ReactNode 包含 ReactElement、或者 number、string、null、boolean 等可以写在 JSX 里的类型。

这三个类型的关系 ReactNode > ReactElement > JSX.Element。

所以，一般情况下，如果你想描述一个参数接收 JSX 类型，就用 ReactNode 就行。

## 函数组件的类型

前面的函数组件，我们都没明确定义类型：

![](./images/70c59dcdeb7a0770f37931cdfd225131.webp )

其实它的类型是 FunctionComponent：

![](./images/681e71a6259881e4ca688fda9547c590.webp )

```javascript
const Aaa: React.FunctionComponent<AaaProps> = (props) => {
  return <div>aaa, {props.name}{props.content}</div>
}
```

看下它的类型定义：

![](./images/82606186c8aa2a881045aa734696bf30.webp )

可以看到，FC 和 FunctionComponent 等价，参数是 Props，返回值是 ReactNode。

而且函数组件还可以写几个可选属性，这些用到了再说。

## hook 的类型

接下来过一下 hook 的类型：

### useState

先从 useState 开始：

一般用推导出的类型就行：

![](./images/9ef056d448ba726bf8036a16afdb2965.webp )

也可以手动声明类型：

![](./images/6a3a87f825cd959e84c10d96b04ab21f.webp )

useEffect 和 useLayoutEffect 这种没有类型参数的就不说了。

### useRef

useRef 我们知道，可以保存 dom 引用或者其他内容。

所以它的类型也有两种。

保存 dom 引用的时候，参数需要传个 null：

![](./images/31a2862b0055521e120e282d931efce7.webp )

不然会报错：

![](./images/b036513275ff7d3291de14d3b5eab0f6.webp )

而保存别的内容的时候，不能传 null，不然也会报错，说是 current 只读：

![](./images/b51f2cc4e995acd73ca60eaeede3f2dc.webp )

![](./images/da63cfd3a1f945440630fd78726b734a.webp )

为什么呢？

看下类型就知道了：

当你传入 null 的时候，返回的是  RefObject，它的 current 是只读的：

![](./images/1e0d4ef9d8fe17c87965e119b378027e.webp )

![](./images/ab51b8e44cc4f70f3ca0cbf7159bedad.webp )

这很合理，因为保存的 dom 引用肯定不能改呀。

而不传 null 的时候，返回的 MutableRefObject，它的 current 就可以改了：

![](./images/791bddbf47221f1b0949b7724dd067b1.webp )

![](./images/e98caaced0f71489f56e38a309bd6416.webp )

因为 ref 既可以保存 dom 引用，又可以保存其他数据，而保存 dom 引用又要加上 readonly，所以才用 null 做了个区分。

传 null 就是 dom 引用，返回 RefObject，不传就是其他数据，返回 MutableRefObject。

所以，这就是一种约定，知道传 null 和不传 null 的区别就行了。

### useImperativeHandle

我们前面写过 forwardRef + useImperativeHandle 的例子，是这样的：
```javascript
import { useRef } from 'react';
import { useEffect } from 'react';
import React from 'react';
import { useImperativeHandle } from 'react';

interface GuangProps {
  name: string;
}

interface GuangRef {
  aaa: () => void;
}

const Guang: React.ForwardRefRenderFunction<GuangRef, GuangProps> = (props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => {
    return {
      aaa() {
        inputRef.current?.focus();
      }
    }
  }, [inputRef]);

  return <div>
    <input ref={inputRef}></input>
    <div>{props.name}</div>
  </div>
}

const WrapedGuang = React.forwardRef(Guang);

function App() {
  const ref = useRef<GuangRef>(null);
 
  useEffect(()=> {
    console.log('ref', ref.current)
    ref.current?.aaa();
  }, []);

  return (
    <div className="App">
      <WrapedGuang name="guang" ref={ref}/>
    </div>
  );
}

export default App;
```

forwardRef 包裹的组件会额外传入 ref 参数，所以它不是 FunctionComponent 类型，而是专门的 ForwardRefRenderFunction 类型。

它有两个类型参数，第一个是 ref 内容的类型，第二个是 props 的类型：

![](./images/7ff9080a295c2f948eb1ca63359f74d0.webp )

其实 forwardRef 也是这两个类型参数，所以写在 forwardRef 上也行：

![](./images/342cc10fba9bda67e50f815dd875ef17.webp )

```javascript
import { useRef } from 'react';
import { useEffect } from 'react';
import React from 'react';
import { useImperativeHandle } from 'react';

interface GuangProps {
  name: string;
}

interface GuangRef {
  aaa: () => void;
}

const WrapedGuang = React.forwardRef<GuangRef, GuangProps>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => {
    return {
      aaa() {
        inputRef.current?.focus();
      }
    }
  }, [inputRef]);

  return <div>
    <input ref={inputRef}></input>
    <div>{props.name}</div>
  </div>
});

```

useImperativeHanlde 可以有两个类型参数，一个是 ref 内容的类型，一个是 ref 内容扩展后的类型。

![](./images/56241c32a0cd49030797f9f5cb32a4dc.webp )

useImperativeHanlde 传入的函数的返回值就要求满足第二个类型参数的类型

不过一般没必要写，因为传进来的 ref 就已经是有类型的了，直接用默认推导的就行。

![](./images/2a89540403995fcab740ef069d4d5c48.webp )

### useReducer

useReducer 可以传一个类型参数也可以传两个：

![](./images/78e912e8393fd42bbfab5e496ed118d5.webp )

![](./images/9cf06c9c33343f64742e5775e97c8d61.webp )

当传一个的时候，是 Reducer<xx,yy> 类型，xx 是 state 的类型，yy 是 action 的类型。

![](./images/8a480d2f614835bdbfa224a14ab1ec7a.webp )

当传了第二个的时候，就是传入的初始化函数参数的类型。

![](./images/117cb687f5fd5b5a89600733d1be4996.webp )

### 其余 hook

剩下的 hook 的类型比较简单，我们快速过一遍：

useCallback 的类型参数是传入的函数的类型：

![](./images/d654f7a4bdc483a4fcbf6af39abc8ba0.webp )

useMemo 的类型参数是传入的函数的返回值类型：

![](./images/6f3bf1707df10945c84a783b6a1943d8.webp )

useContext 的类型参数是 Context 内容的类型：

![](./images/043ec54a95c9113ff3b04318ef2cd0ff.webp )

当然，这些都没必要手动声明，用默认推导的就行。

再就是 memo：

它可以直接用包裹的函数组件的参数类型：

![](./images/da93ba8d2a3ac265f155c73c72e8fc2d.webp )

也可以在类型参数里声明：

![](./images/eab76bd9cbd8381bbad0577dc24d510e.webp )

## 参数类型

回过头来，我们再来看传入组件的 props 的类型。

### PropsWithChildren

前面讲过，jsx 类型用 ReactNode，比如这里的 content 参数：

![](./images/b0f6459f32e548da079cdb8ca119243b.webp )


![](./images/cbc52ee7b6eeaa790daf271e473a8fe1.webp )

如果你不想通过参数传入内容，可以在 children 里：

![](./images/214641a415197f8cee4c7c57eca044e0.webp )

这时候就要声明 children 的类型为 ReactNode：

![](./images/e3284868a2f8e4d3f747032769f42890.webp )

![](./images/1a602fcae7922102242f606a33173123.webp )

```javascript
import React, { ReactNode } from "react";

interface CccProps {
  content: ReactNode,
  children: ReactNode
}

function Ccc(props: CccProps) {
  return <div>ccc,{props.content}{props.children}</div>
}

function App() {

  return <div>
    <Ccc content={<div>666</div>}>
      <button>7777</button>
    </Ccc>
  </div>
}

export default App;
```

![](./images/74441d44217fcfb4c86f08f619ce2526.webp )

但其实没有必要自己写，传 children 这种情况太常见了，React 提供了相关类型：

![](./images/789753d9ac1b019fcc2616ed6cbef4a7.webp )

```javascript
type CccProps = PropsWithChildren<{
  content: ReactNode,
}>
```
看下它的类型定义：

![](./images/7f848d16581716beeb6e45203b2a6e6b.webp )

就是给 Props 加了一个 children 属性。

### CSSProperties

有时候组件可以通过 props 传入一些 css 的值，这时候怎么写类型呢？

用 CSSProperties。

比如加一个 color 参数：

![](./images/4c0ad0b03990a280dc72327da81eb907.webp )

或者加一个 styles 参数：

![](./images/313be3af22d2ef31ff9fa79791e5f24d.webp )

可以看到，提示出了 css 的样式名，以及可用的值：

![](./images/32ed7e911c9fb99f9c29c1fdbd80a2d7.webp )

```javascript
import React, { CSSProperties, PropsWithChildren, ReactNode } from "react";

type CccProps = PropsWithChildren<{
  content: ReactNode,
  color: CSSProperties['color'],
  styles: CSSProperties
}>


function Ccc(props: CccProps) {
  return <div>ccc,{props.content}{props.children}</div>
}

function App() {

  return <div>
    <Ccc content={<div>666</div>} color="yellow" styles={{
      backgroundColor: 'blue'
    }}>
      <button>7777</button>
    </Ccc>
  </div>
}

export default App;
```

## HTMLAttributes

如果你写的组件希望可以当成普通 html 标签一样用，也就是可以传很多 html 的属性作为参数呢？

那可以继承 HTMLAttributes：

![](./images/c4103f56a8126954553a3487548ad33a.webp )

上图中可以看到，提示了很多 html 的属性。

```javascript
import React, { HTMLAttributes } from "react";

interface CccProps extends HTMLAttributes<HTMLDivElement>{

    } 

function Ccc(props: CccProps) {
  return <div>ccc</div>
}

function App() {

  return <div>
    <Ccc p>
      <button>7777</button>
    </Ccc>
  </div>
}

export default App;
```

那 HTMLAttributes 的类型参数是干嘛的呢？

是其中一些 onClick、onMouseMove 等事件处理函数的类型参数：

![](./images/22e29259e49c748196808b4a0b620cab.webp )

当然，继承 HTMLAttributes 只有 html 通用属性，有些属性是某个标签特有的，这时候可以指定 FormHTMLAttributes、AnchorHTMLAttributes 等：

![](./images/8618c0768168433d9080c78c4c7f9d52.webp )

比如 a 标签的属性，会有 href：

![](./images/bc9e48a1d2ab4b6c1fac02fb064ad070.webp )

### ComponentProps

继承 html 标签的属性，前面用的是 HTMLAttributes：

![](./images/78e1797d7f48dc22153ec3853eb141bf.webp )

其实也可以用 ComponentProps：

![](./images/2d9f369004ce3e7a2681da179a9f9158.webp )

![](./images/733aa5398c9dfa3f3d39053f8b2e56ae.webp )

效果一样。

ComponentProps 的类型参数是标签名，比如 a、div、form 这些。

## EventHandler

很多时候，组件需要传入一些事件处理函数，比如 clickHandler：

![](./images/3404e0827953d3a2756df18b7c19998c.webp )

```javascript
import React, { HTMLAttributes, MouseEventHandler } from "react";

interface CccProps {
  clickHandler: MouseEventHandler
} 

function Ccc(props: CccProps) {
  return <div onClick={props.clickHandler}>ccc</div>
}

function App() {

  return <div>
    <Ccc clickHandler={(e) => {
      console.log(e);
    }}></Ccc>
  </div>
}

export default App;
```
这种参数就要用 xxxEventHandler 的类型，比如 MouseEventHandler、ChangeEventHandler 等，它的类型参数是元素的类型。

或者不用 XxxEventHandler，自己声明一个函数类型也可以：

![](./images/32cdbf27d3abb97a7a03ac5950a6c6be.webp )

```javascript
interface CccProps {
  clickHandler: (e: MouseEvent<HTMLDivElement>) => void
} 
```
案例代码上传了[小册仓库](https://github.com/QuarkGluonPlasma/react-course-code/tree/main/react-ts)。

## 总结

我们过了一遍写 React 组件会用到的类型：

- **ReactNode**：JSX 的类型，一般用 ReactNode，但要知道 ReactNode、ReactElement、JSX.Element 的关系

- **FunctionComonent**：也可以写 FC，第一个类型参数是 props 的类型

- **useRef 的类型**：传入 null 的时候返回的是 RefObj，current 属性只读，用来存 html 元素；不传 null 返回的是 MutableRefObj，current 属性可以修改，用来存普通对象。

- **ForwardRefRenderFunction**：第一个类型参数是 ref 的类型，第二个类型参数是 props 的类型。forwardRef 和它类型参数一样，也可以写在 forwardRef 上

- **useReducer**：第一个类型参数是 Reducer<data 类型, action 类型>，第二个类型参数是初始化函数的参数类型。

- **PropsWithChildren**：可以用来写有 children 的 props

- **CSSProperties**： css 样式对象的类型

- **HTMLAttributes**：组件可以传入 html 标签的属性，也可以指定具体的 ButtonHTMLAttributes、AnchorHTMLAttributes。

- **ComponentProps**：类型参数传入标签名，效果和 HTMLAttributes 一样

- **EventHandler**：事件处理器的类型

后面写 React 组件的时候，会大量用到这些 typescript 的类型。