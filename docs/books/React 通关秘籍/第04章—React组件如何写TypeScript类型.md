现在写 React 组件都是基于 TypeScript，所以如何给组件写类型也是很重要的。

这节我们就来学下 React 组件如何写 TypeScript 类型。

用 cra 创建个项目：

```
npx create-react-app --template typescript react-ts
```

![](./images/3a06a833a02342fa9bbd6e0a6d09d937~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

我们平时用的类型在 @types/react 这个包里，cra 已经帮我们引入了。

![](./images/70a001ebbcd74459a4a0a0eca4b6b14b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

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

![](./images/af1f13bc560e46bb9840a75b40aedfbe~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

React 函数组件默认返回值就是 JSX.Element。

我们看下 JSX.Element 的类型定义：

```javascript
const content: JSX.Element = <div>aaa</div>
```
![](./images/26c662972489430698a287aedb432561~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

可以看到它就是 React.ReactElement。

也就是说，如果你想描述一个 jsx 类型，就用 React.ReactElement 就好了。

比如 Aaa 组件有一个 content 的 props，类型为 ReactElement：

![](./images/37a609f702e54e06aa99a9e10eac076f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这样就只能传入 JSX。

跑一下：
```
npm run start
```

![](./images/7358b1f4c4ee4a858a9bb87176609c41~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

ReactElement 就是 jsx 类型，但如果你传入 null、number 等就报错了：

![](./images/ad3cfd438f61454c8a07367f9a5957c1~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/6713b88bee6b4c3996833dcc435d2948~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

那如果有的时候就是 number、null 呢？

换成 ReactNode 就好了：

![](./images/f4375cc818344992b9c7dc14fcb1ff48~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

看下它的类型定义：

![](./images/739c7c079ec84a9fa6f14a1923370a73~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

ReactNode 包含 ReactElement、或者 number、string、null、boolean 等可以写在 JSX 里的类型。

这三个类型的关系 ReactNode > ReactElement > JSX.Element。

所以，一般情况下，如果你想描述一个参数接收 JSX 类型，就用 ReactNode 就行。

## 函数组件的类型

前面的函数组件，我们都没明确定义类型：

![](./images/9b496b77eb774ae882319a548e79c8f7~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

其实它的类型是 FunctionComponent：

![](./images/0394b3b32a99425e8204a8bc3be39e45~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

```javascript
const Aaa: React.FunctionComponent<AaaProps> = (props) => {
  return <div>aaa, {props.name}{props.content}</div>
}
```

看下它的类型定义：

![](./images/31af367a957b4f6186f8df0f4bcb5fa7~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

可以看到，FC 和 FunctionComponent 等价，参数是 Props，返回值是 ReactNode。

而且函数组件还可以写几个可选属性，这些用到了再说。

## hook 的类型

接下来过一下 hook 的类型：

### useState

先从 useState 开始：

一般用推导出的类型就行：

![](./images/81fda4ec23b447a78459f275a59de784~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

也可以手动声明类型：

![](./images/e6360b69158440b68be7c2043d776b88~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

useEffect 和 useLayoutEffect 这种没有类型参数的就不说了。

### useRef

useRef 我们知道，可以保存 dom 引用或者其他内容。

所以它的类型也有两种。

保存 dom 引用的时候，参数需要传个 null：

![](./images/2d2a680752614e78ab7391a26eec900f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

不然会报错：

![](./images/1a5a7789771144309c0b0e1bfbf2fcec~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

而保存别的内容的时候，不能传 null，不然也会报错，说是 current 只读：

![](./images/f41dbf1da46e43e1afa31e3b45465a5c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/760491ca046d4369aeca68e16c633248~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

为什么呢？

看下类型就知道了：

当你传入 null 的时候，返回的是  RefObject，它的 current 是只读的：

![](./images/2a076b4afb7e450fa29646955aca4abc~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/c03177f418e6499d86e7855a8a376ea8~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这很合理，因为保存的 dom 引用肯定不能改呀。

而不传 null 的时候，返回的 MutableRefObject，它的 current 就可以改了：

![](./images/521b681a404542708922c520666aa246~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/e8b7017a29b64726877d15c2ff881980~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

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

![](./images/54851a11e0904c00bf02a066fe1327fb~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

其实 forwardRef 也是这两个类型参数，所以写在 forwardRef 上也行：

![](./images/b810feacb37f4e1f892b443ff92c247f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

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

![](./images/de49d22a23d14af390755b798ed60a55~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

useImperativeHanlde 传入的函数的返回值就要求满足第二个类型参数的类型

不过一般没必要写，因为传进来的 ref 就已经是有类型的了，直接用默认推导的就行。

![](./images/325bc2607a7b4522bf884c82b65d0182~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

### useReducer

useReducer 可以传一个类型参数也可以传两个：

![](./images/34513b19f0524fe7bcece9d37d23bf05~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/8020481fe85f47f0bc5fbcfb44dd86d0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

当传一个的时候，是 Reducer<xx,yy> 类型，xx 是 state 的类型，yy 是 action 的类型。

![](./images/b91a697c2e7f4e4fa06daaaf00f94fd4~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

当传了第二个的时候，就是传入的初始化函数参数的类型。

![](./images/5dce530abe9344688f93353469ddcd4b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

### 其余 hook

剩下的 hook 的类型比较简单，我们快速过一遍：

useCallback 的类型参数是传入的函数的类型：

![](./images/306888df90d449d6b1fee62d4021d0c7~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

useMemo 的类型参数是传入的函数的返回值类型：

![](./images/9caf01c8c888462dba7291abf74dfdf6~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

useContext 的类型参数是 Context 内容的类型：

![](./images/21fb9f3abe244e9880ced421112effad~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

当然，这些都没必要手动声明，用默认推导的就行。

再就是 memo：

它可以直接用包裹的函数组件的参数类型：

![](./images/a2ac84404bb1485bb5a69fe40d2b3a00~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

也可以在类型参数里声明：

![](./images/0b4853f14ae34c7095460b72d1761f54~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

## 参数类型

回过头来，我们再来看传入组件的 props 的类型。

### PropsWithChildren

前面讲过，jsx 类型用 ReactNode，比如这里的 content 参数：

![](./images/857cedbf20584091958556a8e66083bc~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)


![](./images/1cc0a0ab989e4083a228e66916395869~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

如果你不想通过参数传入内容，可以在 children 里：

![](./images/62214b3f27e543658e5efb2999e66c9b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这时候就要声明 children 的类型为 ReactNode：

![](./images/0adb78933ab14db9960151343df506b4~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/4f873d6f0aa442f9bb45e94828f0eaa6~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

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

![](./images/492c175d83464ed69a6682ed0654d6b5~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

但其实没有必要自己写，传 children 这种情况太常见了，React 提供了相关类型：

![](./images/c29f67f6098744d4a509a2a0dd26fc8b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

```javascript
type CccProps = PropsWithChildren<{
  content: ReactNode,
}>
```
看下它的类型定义：

![](./images/9fc5583334354131a01f9d3e210d28e0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

就是给 Props 加了一个 children 属性。

### CSSProperties

有时候组件可以通过 props 传入一些 css 的值，这时候怎么写类型呢？

用 CSSProperties。

比如加一个 color 参数：

![](./images/2cbc9d356c52449384cf6d60b9e9dc18~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

或者加一个 styles 参数：

![](./images/446fa299b8a24f3d922502f19b73ab38~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

可以看到，提示出了 css 的样式名，以及可用的值：

![](./images/51145fe5f9d448eda877ae3e4ab1527f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

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

![](./images/b2d3ffd6cf624098b0263a4a9052b9bf~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

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

![](./images/1e7dcfd5c2e1418ca2724e4747754e3a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

当然，继承 HTMLAttributes 只有 html 通用属性，有些属性是某个标签特有的，这时候可以指定 FormHTMLAttributes、AnchorHTMLAttributes 等：

![](./images/74e4bab0162d495ebea8e5ca43b19877~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

比如 a 标签的属性，会有 href：

![](./images/3e39d3c9360f4a9ea57fe47f4c2d61d8~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

### ComponentProps

继承 html 标签的属性，前面用的是 HTMLAttributes：

![](./images/50004ec749274b17ba849602ba485852~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

其实也可以用 ComponentProps：

![](./images/de8abe65d228464da421f49e477a597a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/6e040bf8dc474f849415449f3426e1e6~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

效果一样。

ComponentProps 的类型参数是标签名，比如 a、div、form 这些。

## EventHandler

很多时候，组件需要传入一些事件处理函数，比如 clickHandler：

![](./images/5c8165aeff374200b521fb702dec5a26~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

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

![](./images/4ac760e40c3f4786b3f24ba6d4f72bc9~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

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