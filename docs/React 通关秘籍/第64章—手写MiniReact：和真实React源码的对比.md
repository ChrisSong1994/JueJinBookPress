# 第64章—手写MiniReact：和真实React源码的对比

﻿上节我们写了 mini react。

它和真实的 react 渲染流程是否一样呢？

这节我们就调试下 react 源码，对比下两者的差别。

用 cra 创建个 react 项目：

```
npx create-react-app --template=typescript react-source-debug
```

![](./images/568e352801082a60b9795f7a88997026.png )

把开发服务跑起来：

```
npm run start
```
![](./images/f7f4b851c900c238247912a109a3d92e.png )

浏览器访问下：

![](./images/d9b4da314d7f908f5ec22f705cfd664e.png )

没啥问题。

点击 create a launch.json file 创建个调试配置：

![](./images/046db4271c59f89201f618fbd5bf99db.png )

![](./images/a88d5caf3a47b595695d57e07960fcc9.png )

```json
{
    "type": "chrome",
    "request": "launch",
    "name": "Launch Chrome against localhost",
    "url": "http://localhost:3000",
    "webRoot": "${workspaceFolder}"
}
```
在 App.tsx 打个断点：

![](./images/236b9119d515f6f586259105ad6a53a6.png )

点击调试启动：

![](./images/d006dc25109ca826374cd94523976086.gif )

代码会在这里断住。

前面讲过，jsx 会编译成 render function，然后执行后产生 React Element：

![](./images/be23631286693935a179bad5468db147.png )

关掉 sorucemap 重新调试：

![](./images/2607b83c1632c8304e614aa348217ab9.png )

可以看到这个 jsxDEV 就是 render function：

![](./images/c8d5520847e4d553acb7e0c9948b3cde.png )

它是从 react 包引入的：

![](./images/92a1bcc1757c17596cf4152c71e02316.png )

和我们在 babel playground 里看到的结果一样：

![](./images/be4bd2a92acbd8bc868f680005a56475.png )

在这里打个断点：

![](./images/0349fe3f75ab75da9ed5df9fca2b3354.png )

然后点击跳断点执行和进入函数内部：

![](./images/83e2a232ae4362f90c41d9df5d4e4d40.png )

![](./images/d83e4a9e51d9c0c0b3204294c3129e72.gif )

在返回值这里打个断点：

![](./images/b0168a8169145c08565d2eee5f2e4b44.png )

可以看到，render function 返回的是一个 React Element，有 type、props 等属性。

我们的 mini react 里也实现了 render function：

![](./images/5aa31d20ffbee657600beacc27c2f2a5.png )

接下来再看 schedule 和 reconcile 部分：

![](./images/ad576f2b5d1f43e8cbf04f10dfac6d21.png )

打开 sourcemap，重新跑调试：

![](./images/a124baa0e4c16918d3d6ca3346560403.png )

在调用栈可以看到 workLoop：

![](./images/4ee7004c884726bc4313734bca5f3b42.png )

这个是 schduler 包里的，这个包是 react 实现的类似 requestIdleCallback 的功能。

可以看到，每次取一个任务的回调来跑：

![](./images/4975db5f510ef8697adade67d910391d.png )

然后回调里会判断是否要用时间分片：

![](./images/ea675bfc497124b85e653580f393aebf.png )

时间分片前面讲过，就是把 reconcile 过程分散到多个宏任务中跑：

![](./images/1e0309c5ad61943648a2e43791744978.png )

在 scheduler 里搜一下，可以看到，这个时间分片是 5ms：

![](./images/2fae969f2168600bfae8b3880c202624.png )

也就是说，如果超过 5ms，就会放到下个任务里跑。

这就是为啥 performance 看到的 event loop 是这样的：

![](./images/1e0309c5ad61943648a2e43791744978.png )

react 并发渲染的时候，就通过时间片是否到了来判断是否继续 reconcile：

![](./images/bdab74640757baa98d462c6a656df07c.png )

当然，我们实现的时候没有自己实现 schduler 的时间分片，而是直接用的浏览器的 requestIdleCallback 的 api，效果一样：

![](./images/c78c0ea4f1bb5a6da8da21cfa21f85d5.png )

接下来看下 reconcile 的过程：

![](./images/2fa1692d0cab0bf102b3db76b3acf1a1.png )

在 react 源码里，处理每个 fiber 节点的时候，会先调用 beginWork 处理，等 fiber 节点全部处理完，也就是没有 next 的 fiber 节点时，再调用 completeWork 处理。

那 beginWork 和 completeWork 里都做了啥呢？

![](./images/a7657f1010308b0ae16582b3bcd74052.png )

可以看到，根据 fiber 节点的类型来走了不同的分支，我们只处理了 FunctionComponent 和 HostComponent 类型。

看下 FunctionComponent 的处理：

![](./images/dc1b280717931828c6c7dc5ddd053c44.png )

也是调用函数组件，拿到 children 之后继续 reconcileChildren。

reconcileChildren 里要对比新旧 fiber，做下 diff，打上增删改的标记：

![](./images/e56d7d8ae852c02bb96584f33d9f1db2.png )

diff 之后，会分别打上 Place、ChildDeletion 等标记：

![](./images/b484bfa5d5e93821789556a4a7c9af4e.png )

![](./images/8eb0be30369f4a243beb4eb7ee1c54ec.png )

这部分和我们 mini react 实现的 reconcile 逻辑差不多。

![](./images/393ba2995a7002c644df90e8d682044e.png )

那 completeWork 是干啥的呢？

看下 HostComponent 的 reconcile 逻辑，你会发现它并没有创建 dom：

![](./images/e60ff0372ac16f6553d200fab2f0266e.png )

而我们的 mini react 里是创建了 dom 的。

![](./images/66e4f208fb48e2506b892da739ef39a1.png )

其实不是没有创建，而是这部分逻辑在 completeWork 里。

![](./images/6194e580f308090fb8abdea867a5f533.png )

completeWork 里处理到 HostComponent 就会创建对应的 dom，保存在 fiber.stateNode 属性上：

![](./images/f3012de0fae0bf907c45afd75b9a7326.png )

为什么要分为 beginWork 和 completeWork 两个阶段呢？

其实也很容易搞懂，比如创建 dom 这件事，需要先把所有子节点的 dom 都创建好，然后 appendChild 才行。

所以就需要 beginWork 处理完所有 fiber 之后，再递归从下往上处理。

![](./images/b2ce0fccf1d219bf152633b511236b49.png )

然后是 commit 阶段，在 react 源码里可以看到，这个阶段分为了 before mutation、mutation、layout 这三个小阶段：

![](./images/0c38d680ab0c69bf9acb4fbe360605e0.png )

mutation 阶段就是更新 dom 的：

![](./images/a0ed380ce3bd06f3623412f3c359482e.png )

![](./images/638aff63fcc0bf6fa53058d9bb145933.png )

![](./images/cca7c1ed1c5f4677001310c0656814c3.png )

![](./images/bee098e15bcf5ae9a87c49b5c61387f5.png )

可以看到，mutation 阶段会把 reconcile 阶段创建好的 dom 更新到 dom 树。

那啥时候执行的 effect呢？

![](./images/87aa5fb542fd4473d2d6e35ce3723e2a.png )

刚进入 commitRoot 的时候，就会调度所有的 useEffect 的回调异步执行。

还有，useState、useEffect 等 hook 在 react 源码里是怎么实现的呢？

添加几个 hook：

![](./images/614c3c98baf013b564797d3db04205a4.png )

在 return 那里打个断点，可以看到现在的 fiber 是这样的：

![](./images/45b35ce84669358e5fddf088598b10bf.png )

在 fiber 上有个 memoizedState 的链表，每个节点保存一个 hook 的信息。

调用 useState、useRef、useEffect 等 hook 的时候，会往对应的链表节点上存取内容。

hook 链表的创建分为 mount、update 两个阶段，第一次创建链表节点，第二次更新链表节点。

比如 useRef 就是在对应 hook 节点的 momoizedState 属性保存一个有 current 属性的对象，第二次调用返回这个对象：

![](./images/a5526efe8c0dd25abad2651df6b546f0.png )

比如 useCallback 就是在对应 hook 节点的 momoizedState 属性保存一个数组，再次调用判断下 deps 是否一样，一样的话就返回之前的数组的第一个元素，否则更新：

![](./images/ed64c2508f80b394027460d35be6e9d2.png )

useMemo 和 useCallback 实现差不多，只不过保存的是函数的值：

![](./images/daad5967d7d15ce4015ff60ab05ae88b.png )

这样，和 mini react 对应的 react 源码里的实现就理清了。

## 总结

我们调试了下 react 源码，和前面写的 mini react 对比了下。

实现 render function 返回 React Element。

React Element 树经过 reconcile 变成 fiber 树，reconcile 的时候根据不同类型做不同处理，然后 commit 阶段执行 dom 增删改和 effect 等。

这些都差不多。

只不过 react 源码里 render 阶段 reconcile 分成了 beginWork、completeWork 两个小阶段，dom 的创建和组装是在 completeWork 里做的。

commit 阶段分成了 before mutation、mutation、layout 这三个小阶段。

react 的调度也是用自己实现的 schduler 做的，实现了时间分片，而我们用的 requestIdleCallback 做的调度。

react 的 hook 的值是存放在 fiber.memoizedState 链表上的，每个 hook 对应一个节点，在其中存取值，而我们是用的别的属性。

包括保存 dom 的节点，在 react 里是用 fiber.stateNode 属性保存。

但总体来说，流程上是差不多的，通过学习 mini react，能够很好的帮你理解 react 的实现原理。
