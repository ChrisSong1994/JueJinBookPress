上节我们写了 mini react。

它和真实的 react 渲染流程是否一样呢？

这节我们就调试下 react 源码，对比下两者的差别。

用 cra 创建个 react 项目：

```
npx create-react-app --template=typescript react-source-debug
```

![](./images/1bdad2afea154136bbcc3dce253bc5a8~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

把开发服务跑起来：

```
npm run start
```
![](./images/21180866316540e7973267d54a24bcf7~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

浏览器访问下：

![](./images/fe56560e7c7e483fb25a5b0e330de184~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

没啥问题。

点击 create a launch.json file 创建个调试配置：

![](./images/067f7fbedd4d4cdb8a1d39adbb672638~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/63e97507a3784e0ebb5008421c533340~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

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

![](./images/94ad5c6399e546c198d528dbe41d8f68~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

点击调试启动：

![](./images/6e5002648b234f5f8b23420097fee976~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

代码会在这里断住。

前面讲过，jsx 会编译成 render function，然后执行后产生 React Element：

![](./images/2f95ad42f43846cbbd8e01da0987b76c~tplv-k3u1fbpfcp-watermark.image.png)

关掉 sorucemap 重新调试：

![](./images/462a743b321f4b6eb0fef477e4a8bd2d~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

可以看到这个 jsxDEV 就是 render function：

![](./images/838b7e519ef749bfb7f56127b074c7f0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

它是从 react 包引入的：

![](./images/c3586bf57a9449fd8945cb3c2a87b703~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

和我们在 babel playground 里看到的结果一样：

![](./images/9bbf95299c9c495f9224c30716666a52~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

在这里打个断点：

![](./images/8b3226f3238d454d85e85111a1c5de29~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

然后点击跳断点执行和进入函数内部：

![](./images/bd60b7935f614a0cb10a29526e97c243~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/d452a2fd54b2485282aaaa6dbb7d6fb2~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

在返回值这里打个断点：

![](./images/9609e532bcd949d0923e1a01ec1eb92e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

可以看到，render function 返回的是一个 React Element，有 type、props 等属性。

我们的 mini react 里也实现了 render function：

![](./images/d1113e34cfbd4ba3a391943b3cf26473~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

接下来再看 schedule 和 reconcile 部分：

![](./images/87a5006344964b639654a87a37c999d1~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

打开 sourcemap，重新跑调试：

![](./images/f89e9198958b4763a7d7f12d391a92f9~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

在调用栈可以看到 workLoop：

![](./images/1e6c70e037ad4759a34c1b937b0a93b8~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这个是 schduler 包里的，这个包是 react 实现的类似 requestIdleCallback 的功能。

可以看到，每次取一个任务的回调来跑：

![](./images/835df1f4e3ce48ee979fca2f9ca75252~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

然后回调里会判断是否要用时间分片：

![](./images/4c6f3a7080d64d08bcfaea1a2b2fb347~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

时间分片前面讲过，就是把 reconcile 过程分散到多个宏任务中跑：

![](./images/0ae6e3ebf9934b068dab509689f64b6e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

在 scheduler 里搜一下，可以看到，这个时间分片是 5ms：

![](./images/56cb5a44eecf4a919a375397e0628147~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

也就是说，如果超过 5ms，就会放到下个任务里跑。

这就是为啥 performance 看到的 event loop 是这样的：

![](./images/0ae6e3ebf9934b068dab509689f64b6e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

react 并发渲染的时候，就通过时间片是否到了来判断是否继续 reconcile：

![](./images/f259dcb682474ed88ffa87bfc8dec64a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

当然，我们实现的时候没有自己实现 schduler 的时间分片，而是直接用的浏览器的 requestIdleCallback 的 api，效果一样：

![](./images/5e050a681cee415ea5d8c8762e67850c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

接下来看下 reconcile 的过程：

![](./images/463e1b1a922f4422abe5f8859c029370~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

在 react 源码里，处理每个 fiber 节点的时候，会先调用 beginWork 处理，等 fiber 节点全部处理完，也就是没有 next 的 fiber 节点时，再调用 completeWork 处理。

那 beginWork 和 completeWork 里都做了啥呢？

![](./images/9d5153f63c4a400a9af63e8172a962a5~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

可以看到，根据 fiber 节点的类型来走了不同的分支，我们只处理了 FunctionComponent 和 HostComponent 类型。

看下 FunctionComponent 的处理：

![](./images/e1fdb0aa79a34af5a547583e449d9c59~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

也是调用函数组件，拿到 children 之后继续 reconcileChildren。

reconcileChildren 里要对比新旧 fiber，做下 diff，打上增删改的标记：

![](./images/34ada1d184b944c1aa5769349513193b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

diff 之后，会分别打上 Place、ChildDeletion 等标记：

![](./images/e8a72663ae7741d9ad2de9f1076e02fe~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/25b4eb306a074bfea96aa31a1838a3a0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这部分和我们 mini react 实现的 reconcile 逻辑差不多。

![](./images/6c54c4a281ca4ec0ac0f91d9d67862b0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

那 completeWork 是干啥的呢？

看下 HostComponent 的 reconcile 逻辑，你会发现它并没有创建 dom：

![](./images/6dafd4cbdd004da7ae764ed6b624b659~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

而我们的 mini react 里是创建了 dom 的。

![](./images/d634adb6a014437586a55affaf2d70da~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

其实不是没有创建，而是这部分逻辑在 completeWork 里。

![](./images/f2878ca12369444c86515fd33d7d9200~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

completeWork 里处理到 HostComponent 就会创建对应的 dom，保存在 fiber.stateNode 属性上：

![](./images/67f5e9abf25e4cb49b72135751b15bd8~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

为什么要分为 beginWork 和 completeWork 两个阶段呢？

其实也很容易搞懂，比如创建 dom 这件事，需要先把所有子节点的 dom 都创建好，然后 appendChild 才行。

所以就需要 beginWork 处理完所有 fiber 之后，再递归从下往上处理。

![](./images/97eb8e69ceff4e57abb16ef584d9e56b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

然后是 commit 阶段，在 react 源码里可以看到，这个阶段分为了 before mutation、mutation、layout 这三个小阶段：

![](./images/4f9df8d9eee54d5d9daa069291c23514~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

mutation 阶段就是更新 dom 的：

![](./images/d9c34a56964340b99a47e66cf9356998~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/b3264fc7e14e48208aff0ded6316e31b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/259ef8eeeb844e01a6469b811b134df4~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/6e14868e89854fad92e886cf5ac8854b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

可以看到，mutation 阶段会把 reconcile 阶段创建好的 dom 更新到 dom 树。

那啥时候执行的 effect呢？

![](./images/0150ee552a2a4dc79acc0fba554e8d70~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

刚进入 commitRoot 的时候，就会调度所有的 useEffect 的回调异步执行。

还有，useState、useEffect 等 hook 在 react 源码里是怎么实现的呢？

添加几个 hook：

![](./images/a06abb1236994bfcafc2b27994c7b35c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

在 return 那里打个断点，可以看到现在的 fiber 是这样的：

![](./images/a713f964199b43b09763f55a691ea96c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

在 fiber 上有个 memoizedState 的链表，每个节点保存一个 hook 的信息。

调用 useState、useRef、useEffect 等 hook 的时候，会往对应的链表节点上存取内容。

hook 链表的创建分为 mount、update 两个阶段，第一次创建链表节点，第二次更新链表节点。

比如 useRef 就是在对应 hook 节点的 momoizedState 属性保存一个有 current 属性的对象，第二次调用返回这个对象：

![](./images/30a10518722e4f01a39a0c1e79433f19~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

比如 useCallback 就是在对应 hook 节点的 momoizedState 属性保存一个数组，再次调用判断下 deps 是否一样，一样的话就返回之前的数组的第一个元素，否则更新：

![](./images/fd1e772193dd474d8fe58897e1dcb72b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

useMemo 和 useCallback 实现差不多，只不过保存的是函数的值：

![](./images/30196458be55497bb9e36302dd54185f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

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
