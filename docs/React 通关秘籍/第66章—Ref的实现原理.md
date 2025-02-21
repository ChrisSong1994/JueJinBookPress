# 第66章—Ref的实现原理

﻿ref 是 React 里常用的特性，我们会用它来拿到 dom 的引用，或者用来保存渲染过程中不变的数据。

我们创建个项目试一下：

```
npx create-vite
```
![](./images/b56d56496a0454a6648d7554ba9fde1d.png )

去掉 index.css 和 StrictMode

![](./images/e205144a753173a65e4bc94cf696d7cb.png )

改下 App.tsx

```javascript
import { useRef, useEffect } from "react";

export default function App() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(()=> {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} type="text" />
}
```
把开发服务跑起来：

```
npm run dev
```

![](./images/4901e68765e6d7abbf85adaf901e6e88.png )

创建个调试配置：

![](./images/040c2c35b407c185acc06e95892820c9.png )

```json
{
    "type": "chrome",
    "request": "launch",
    "name": "Launch Chrome against localhost",
    "url": "http://localhost:5173",
    "webRoot": "${workspaceFolder}"
}
```

可以看到，useRef 可以拿到 dom 的引用：

![](./images/550713f9b4db82954adbf3ae1b83dabd.png )

此外，useRef 还可以保存渲染中不变的一些值：

```javascript
import { useEffect, useRef, useState } from "react";

export default function App() {
  const [num, setNum] = useState(0);
  const timerRef = useRef<number>();

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setNum(num => num + 1);
    }, 100);
  }, []);

  return <div>
    {num}
    <button onClick={() => {
      clearInterval(timerRef.current!);
    }}>停止</button>
  </div>
}
```
![](./images/84d6883fc0adfbed8f837602a52beacc.gif )

当传入 null 时，返回的是 RefObject 类型，用来保存 dom 引用：

![](./images/0fdd939357d4ae60c70e30cd0d00cddd.png )

传其他值返回的是 MutableRefObject，可以修改 current，保存其它值：

![](./images/84634eec3903c1a7698552f6401e9dad.png )

而在 class 组件里用 createRef：
```javascript
import React from "react";

export default class App  extends React.Component{
  constructor() {
    super();
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    this.inputRef.current.focus();
  }

  render() {
    return <input ref={this.inputRef} type="text" />
  }
}
```

![](./images/e6c131f56c12744ce41961768595fbe4.png )

如果想转发 ref 给父组件，可以用 forwardRef：

```javascript
import React, { useRef, forwardRef, useImperativeHandle, useEffect } from "react";

const ForwardRefMyInput = forwardRef<HTMLInputElement>((props, ref) => {
    return <input {...props} ref={ref} type="text" />
  }
)

export default function App() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [])

  return (
    <div className="App">
      <ForwardRefMyInput ref={inputRef} />
    </div>
  );
}
```

![](./images/3038643485de1a6499a8cf822bafca59.png )

而且还可以使用 useImperativeHandle 自定义传给父元素的 ref：

```javascript
import React, { useRef, forwardRef, useImperativeHandle, useEffect } from "react";

interface RefType {
  aaa: Function
}

const ForwardRefMyInput = forwardRef<RefType>((props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => {
      return {
        aaa() {
          inputRef.current?.focus();
        }
      }
    });
    return <input {...props} ref={inputRef} type="text" />
  }
)

export default function App() {
  const apiRef = useRef<RefType>(null);

  useEffect(() => {
    apiRef.current?.aaa();
  }, [])

  return (
    <div className="App">
      <ForwardRefMyInput ref={apiRef} />
    </div>
  );
}
```
![](./images/06158af6cdf56cc621f61da8eb513c74.png )

这就是我们平时用到的所有的 ref api 了。

小结一下：

- **函数组件里用 useRef 保存 dom 引用或者自定义的值，而在类组件里用 createRef**
- **forwardRef 可以转发子组件的 ref 给父组件，还可以用 useImperativeHandle 来修改转发的 ref 的值**

相信开发 React 项目，大家或多或少会用到这些 api。

那这些 ref api 的实现原理是什么呢？

下面我们就从源码来探究下：

我们通过 jsx 写的代码，最终会编译成 React.createElement 等 render function，执行之后产生 vdom：

![](./images/f58d020b9b4b6b7e7022f24ca03f50d1.png )

所谓的 vdom 就是这样的节点对象：

![](./images/fb1adf534b60752e22b9344975eb8d1c.png )

vdom 是一个 children 属性连接起来的树。

react 会先把它转成 fiber 链表：

![](./images/99ccaf3049cd496c9a34ca0d795f71e1.png )

vdom 树转 fiber 链表树的过程就叫做 reconcile，这个阶段叫 render。

render 阶段会从根组件开始 reconcile，根据不同的类型做不同的处理，拿到渲染的结果之后再进行 reconcileChildren，这个过程叫做 beginWork：

![](./images/5460bd255c0f01924487e8056f54a489.png )

比如函数组件渲染完产生的 vom 会继续 renconcileChildren：

![](./images/468eca60a30af7219df0748a104f65de.png )

beginWork 只负责渲染组件，然后继续渲染 children，一层层的递归。

全部渲染完之后，会递归回来，这个阶段会调用 completeWork：

![](./images/5f0fa42c425ea61c2a8722053d0c2d25.png )

这个阶段会创建需要的 dom，然后记录增删改的 tag 等，同时也记录下需要执行的其他副作用到 fiber 上。

之后 commit 阶段才会遍历 fiber 链表根据 tag 来执行增删改 dom 等 effect。

commit 阶段也分了三个小阶段，beforeMutation、mutation、layout：

![](./images/0c38d680ab0c69bf9acb4fbe360605e0.png )

它们都是消费的同一条 fiber 链表，但是每个阶段做的事情不同

mutation 阶段会根据标记增删改 dom，也就是这样的：

![](./images/71a864a6ab3bbd3b6534e7f430291c91.png )

所以这个阶段叫做 mutation，它之前的一个阶段叫做 beforeMutation，而它之后的阶段叫做 layout。

小结下 react 的流程：

**通过 jsx 写的代码会编译成 render function，执行产生 vdom，也就是 React Element 对象的树。**

**react 分为 render 和 commit 两个阶段:**

**render 阶段会递归做 vdom 转 fiber，beginWork 里递归进行 reconcile、reconcileChildren，completeWork 里创建 dom，记录增删改等 tag 和其他 effect**

**commit 阶段遍历 fiber 链表，做三轮处理，这三轮分别叫做 before mutation、mutation、layout，mutation 阶段会根据 tag 做 dom 增删改。**

ref 的实现同样是在这个流程里的。

首先，我们 ref 属性一般是加在原生标签上的，比如 input、div、p 这些，所以看 HostComponent 的分支就可以了，HostComponent 就是原生标签。

可以看到处理原生标签的 fiber 节点时，beginWork 里会走到这个分支：

![](./images/a0bdfb617658fa15d3e022bc347dcdbb.png )

里面调用 markRef 打了个标记：

![](./images/5d3d963751ff7373cf5210202103c93b.png )

![](./images/7f7a35809cfe0e56d4ad54be90c3abe3.png )

前面说的 tag 就是指这个 flags。

然后就到了 commit 阶段，开始根据 flags 做不同处理：

![](./images/653c7985ec737ab5ea61f4e23ab8a336.png )

在 layout 阶段，这时候已经操作完 dom 了，就会遍历 fiber 链表，给 HostComponent 设置新的 ref。

![](./images/b8213f8dfe42227ac87afa6dd5dce510.png )
![](./images/b948f850e917a0b21b9838cb061f8104.png )

ref 的元素就是在 fiber.stateNode 属性上保存的在 render 阶段就创建好了的 dom，：

![](./images/f3b06d538cfe2f6302c7e218c8bc9971.png )

这样，在代码里的 ref.current 就能拿到这个元素了：

![](./images/3288492981701deed285d27b85d24df3.png )

而且我们可以发现，他只是对 ref.current 做了赋值，并不管你是用 createRef 创建的、useRef 创建的，还是自己创建的一个普通对象。

我们试验一下：
 
![](./images/7de5779d273b1413e1cb9622d5efb66c.png )

我创建了一个普通对象，current 属性依然被赋值为 input 元素。

那我们用 createRef、useRef 的意义是啥呢？

看下源码就知道了：

![](./images/651dbd5741f1783661ee32d494aeee31.png )

createRef 也是创建了一个这样的对象，只不过 Object.seal 了，不能增删属性。

用自己创建的对象其实也没啥问题。

那 useRef 呢？

![](./images/473aeef2ed99c7b88569d1b1ce0a32df.png )

useRef 也是一样的，只不过是保存在了 fiber 节点 hook 链表元素的 memoizedState 属性上。

只是保存位置的不同，没啥很大的区别。

同样，用 forwardRef 转发的 ref 也很容易理解，只是保存的位置变了，变成了从父组件传过来的 ref：

![](./images/a5269cad35cec2cb39bb061cd615e8ce.png )

那 forwardRef 是怎么实现这个 ref 转发的呢？

我们再看下源码：

forwarRef 函数其实就是创建了个专门的 React Element 类型：

![](./images/ca2dfda18b14154bdc90595c547d0d8b.png )

然后 beginWork 处理到这个类型的节点会做专门的处理：

![](./images/8db9e6d54071e673693978bbba0b4cc6.png )

也就是把它的 ref 传递给函数组件：

![](./images/40a6a2f90936f8d3708f047073956446.png )

渲染函数组件的时候专门留了个后门来传第二个参数：

![](./images/8f81a6af2d0c810ce217f9b8627aa218.png )

所以函数组件里就可以拿到 ref 参数了：

![](./images/8bcff7afc7c5345eebcb15550ada12bd.png )

这样就完成了 ref 从父组件到子组件的传递：

![](./images/089984fd53207e7ce32073ddd75669b4.png )

那 useImperativeHandle 是怎么实现的修改 ref 的值呢？

![](./images/ecf83e8e97ace1ef33509852e97b044f.png )

源码里可以看到 useImperativeHandle 底层就是 useEffect，只不过是回调函数是把传入的 ref 和 create 函数给 bind 到 imperativeHandleEffect 这个函数了：

![](./images/70b5792506d7293bbcf822aa69235766.png )

而这个函数里就是更新 ref.current 的逻辑：

![](./images/8d8a2ec43b3fd00495d8812ff53e0477.png )

我们知道，useEffect 是在 commit 阶段异步调度的，在 layout 更新 dom 之后了，自然可以拿到新的 dom：

![](./images/87aa5fb542fd4473d2d6e35ce3723e2a.png )

更新了 ref 的值：

![](./images/4522c54a38e8419c14201b51c11e0847.png )

这样，useImperativeHandle 就成功修改了 forwardRef 传过来的 ref。

## 总结

我们平时会用到 createRef、useRef、forwardRef、useImperativeHandle 这些 api，而理解它们的原理需要熟悉 react 的运行流程，也就是 render（beginWork、completeWork） + commit（before mutation、mutation、layout）的流程。

**render 阶段处理到原生标签的也就是 HostComponent 类型的时候，如果有 ref 属性会在 fiber.flags 里加一个标记。**

**commit 阶段会在 layout 操作完 dom 后遍历 fiber 链表更新 HostComponent 的 ref，也就是把 fiber.stateNode 赋值给 ref.current。**

**react 并不关心 ref 是哪里创建的，用 createRef、useRef 创建的，或者 forwardRef 传过来的都行，甚至普通对象也可以，createRef、useRef 只是把普通对象 Object.seal 了一下。**

**forwarRef 是创建了单独的 React Element 类型，在 beginWork 处理到它的时候做了特殊处理，也就是把它的 ref 作为第二个参数传递给了函数组件，这就是它 ref 转发的原理。**

**useImperativeHandle 的底层实现就是 useEffect，只不过执行的函数是它指定的，bind 了传入的 ref 和 create 函数，这样在 layout 阶段调用 hook 的 effect 函数的时候就可以更新 ref 了。**

理解了 react 渲染流程之后，很多特性只是其中多一个 switch case 的分支而已，就比如 ref。
