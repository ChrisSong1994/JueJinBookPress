# 第44章—Historyapi和ReactRouter实现原理

﻿Router 是开发 React 应用的必备功能，那 React Router 是怎么实现的呢？

今天我们就来读一下 React Router 的源码吧！

首先，我们来学一下 History API，这是基础。

什么是 history 呢？

就是这个东西：

![](./images/4fee4e6f088b97f5bfcec2db58010bea.png )

我打开了一个新的标签页、然后访问 baidu.com、sougou.com、taobao.com。

长按后退按钮，就会列出历史记录，这就是 history。

现在在这里：

![](./images/62fa9c1d175de2cb68d1f04547a70cdd.png )

history.length 是 5

![](./images/5b2c33fd2a7cbcdfd43006640f35bcfb.png )

点击两次后退按钮，或者执行两次 history.back()

![](./images/4ccd64e8a59cc53d0fc94ebd07c2e897.png )

就会回到这里：

![](./images/5736a5969ca6ca02e704f91f5ab5d599.png )

这时候 history.length 依然是 5

![](./images/23e0b2624eb22d044add4152f6cdcbaf.png )

因为前后的 history 都还保留着：

![](./images/419042c9872125fab44b1cdd76fdc108.png )

![](./images/4b3b4f850b9cade92f43b1b6764d6172.png )

除了用 history.back、history.forward 在 history 之间切换外，还可以用 history.go

参数值是 delta：

history.go(0) 是刷新当前页面。

history.go(1) 是前进一个，相当于 history.forward()

history.go(-1) 是后退一个，相当于 history.back()

当然，你还可以 history.go(-2)、histroy.go(3) 这种。

![](./images/d6ec2840b8331737a25c0805fe194743.png )

比如当我执行 history.go(-2) 的时候，能直接从 taobao.com 跳到 sogou.com

![](./images/92d31343cf98975ff832e3de1448a34d.png )

你还可以通过 history.replaceState 来替换当前 history：

![](./images/46bde5dafd98ca46f938d7d7460a3afb.png )

```javascript
history.replaceState({aaa:1}, '', 'https://www.baidu.com?wd=光')
```
第一个参数是 state、第二个参数是 title，第三个是替换的 url。

不过第二个参数基本都不支持，state 倒是能拿到。

比如我在 https://www.baidu.com 那页 replaceState 为一个新的 url：

![](./images/948c769be83ef1b2ff94f4ab731198f3.png )

前后 history 都没变，只有当前的变了：

![](./images/7808262405841b84b6361e5e4a00a9d5.png )

也就是这样：

![](./images/cc3f027cc7617b4db6cad51691df9e5c.png )

当然，你还可以用 history.pushState 来添加一个新的 history：

```javascript
history.pushState({bbb:1}, '', 'https://www.baidu.com?wd=东');
```

![](./images/1bfa120ca9cc65f220ccb15fd5ab7392.png )

但有个现象，就是之后的 history 都没了：

![](./images/7fc62d8a7e068dc4519b6897409619e5.png )

![](./images/c71c05f65ba91fd2641c78733549da09.png )

也就是变成了这样：

![](./images/534c55527cd331131b8ec775cb37752e.png )

为什么呢？

因为你是 history.pushState 的时候，和后面的 history 冲突了，也就是分叉了：

![](./images/14c39ae1cdc83612e66535f0c4eff850.png )

这时候自然只能保留一个分支，也就是最新的那个。

这时候 history.length 就是 3 了。

![](./images/3a2a22376b10919ccadc9df75616e097.png )

至此，history 的 length、go、back、forward、pushState、replaceState、state 这些 api 我们就用了一遍了。

还有个 history.scrollRestoration 是用来保留滚动位置的：

有两个值 auto、manual，默认是 auto，也就是会自动定位到上次滚动位置，设置为 manual 就不会了。

比如我访问百度到了这个位置：

![](./images/1e1dc995733212c991c271ff07b3896b.png )

打开个新页面，再退回来：

![](./images/ba92ef7bd71b5a54283f8d27555e31cc.png )

依然是在上次滚动到的位置。

这是因为它的 history.scrollRestoration 是 auto

![](./images/080c7be06360d154469df610005600f8.png )

我们把它设置为 manual 试试看：

![](./images/ae71967759b247001859c6df318df548.png )

![](./images/14823437e5457ba4b7e4189f80b91082.png )

这时候就算滚动到了底部，再切回来也会回到最上面。

此外，与 history 相关的还有个事件：popstate

**当你在 history 中导航时，popstate 就会触发，比如 history.forwad、histroy.back、history.go。**

**但是 history.pushState、history.replaceState 这种并不会触发 popstate。**

我们测试下：

![](./images/150c4762d5776d100a3a8560381ac364.png )

```javascript
history.pushState({aaa:1}, '', 'https://www.baidu.com?#/aaa');

history.pushState({bbb:2}, '', 'https://www.baidu.com?#/bbb');
```
我在 www.baidu.com 这个页面 pushState 添加了两个 history。

加上导航页一共 4 个：

![](./images/f7e1b58eedbd58c4263e624c8167bf45.png )

然后我监听 popstate 事件：

![](./images/150ca592d95fec7a76816ce29e8a043c.png )

```javascript
window.addEventListener('popstate', event => {console.log(event)});
```
执行 history.back 和 history.forward 都会触发 popstate 事件：

![](./images/3e85033d8896616e6591bd5a647f3e6c.png )

事件包含 state，也可以从 target.location 拿到当前 url

![](./images/9b9a5f9cf44d16768b146ac4f5ae47dd.png )

但是当你 history.pushState、history.replaceState 并不会触发它：

![](./images/25fe969a06ad631b338397bb29f9a1f9.png )

也就是说**添加、修改 history 不会触发 popstate，只有在 history 之间导航才会触发。**

综上，history api 和 popstate 事件我们都过了一遍。

基于这些就可以实现 React Router。

有的同学说，不是还有个 hashchange 事件么？

确实，那个就是监听 hash 变化的。

![](./images/f319452e894a02d47a15899c2560ad86.png )

![](./images/cd39469e167b895d2b0cd85c02cc8746.png )

基于它也可以实现 router，但很明显，hashchange 只能监听 hash 的变化，而 popstate 不只是 hash 变化，功能更多。

所以用 popstate 事件就足够了。

其实在 react router 里，就只用到了 popstate 事件，没用到 hashchange 事件：

![](./images/8b6c4c609f1e12ed850ba47f9940c199.png )

![](./images/def905dd36e544e67670caee16be02c7.png )

接下来我们就具体来看下 React Router 是怎么实现的吧。

创建个 react 项目：

```
npx create-react-app react-router-test
```
![](./images/943244b08102b318d113e3bcb2fabd17.png )

安装 react-router 的包：

```
npm install react-router-dom
```
然后在 index.js 写如下代码：

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  Link,
  Outlet,
  RouterProvider,
} from "react-router-dom";

function Aaa() {
  return <div>
    <p>aaa</p>
    <Link to={'/bbb/111'}>to bbb</Link>
    <br/>
    <Link to={'/ccc'}>to ccc</Link>
    <br/>
    <Outlet/>
  </div>;
}

function Bbb() {
  return 'bbb';
}

function Ccc() {
  return 'ccc';
}

function ErrorPage() {
  return 'error';
}

const routes = [
  {
    path: "/",
    element: <Aaa/>,
    errorElement: <ErrorPage/>,
    children: [
      {
        path: "bbb/:id",
        element: <Bbb />,
      },
      {
        path: "ccc",
        element: <Ccc />,
      }    
    ],
  }
];
const router = createBrowserRouter(routes);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RouterProvider router={router} />);
```
通过 react-router-dom 包的 createBrowserRouter 创建 router，传入 routes 配置。

然后把 router 传入 RouterProvider。

有一个根路由 /、两个子路由 /bbb/:id 和 /ccc

把开发服务跑起来：

```
npm run start
```

测试下：

![](./images/a13cdad35d246dd177394976fefe777b.png )

子路由对应的组件在 \<Outlet/> 处渲染。

当没有对应路由的时候，会返回错误页面：

![](./images/23f8949bcf219f354ebc18d4cb6038fa.png )

那它是怎么实现的呢？

我们断点调试下：

![](./images/2137c119285d7b8dc472f82e4c0b7d40.png )

创建调试配置文件 launch.json，然后创建 chrome 类型的调试配置：

![](./images/e2c917137f3dffce375f80843122202b.png )

在 createBrowserRouter 的地方打个断点：

![](./images/4d17f5422d22e899ebd3fdcdaccdf7d3.png )

点击 debug：

![](./images/9b03e76426ba2ba57fecbdaeb7d62b11.png )

代码会在这里断住：

![](./images/337f74afa4197bcfcb28853f32eddc5f.png )

点击 step into 进入函数内部：

它调用了 createRouter：

![](./images/1c2d7fbb77568da641f8c16350084e90.png )

这里传入了 history。

这个不是原生的 history api，而是包装了一层之后的：

关注 listen、push、replace、go 这 4 个方法就好了：

![](./images/7597f9c8c22ed8fa3537929c60de0b9d.png )

![](./images/4348c2057695e71215de072909089732.png )

listen 就是监听 popstate 事件。

而 push、replace、go 都是对 history 的 api 的封装：

![](./images/9f88f095a7462ffa7a9a636632bf0c0f.png )

![](./images/e03d90b1a7068d243162c5daf0a7a14a.png )

此外，history 还封装了 location 属性，不用自己从 window 取了。

然后 createRouter 里会对 routes 配置和当前的 location 做一次 match：

![](./images/d858992df07bf37c20bed2c9fa5b10b4.png )

![](./images/c2a896df75467f508fe54dfcfa7c9ab0.png )

matchRoutes 会把嵌套路由拍平，然后和 location 匹配：

![](./images/f8f3393b72c092acf3a4ffbdb8046004.png )

然后就匹配到了要渲染的组件以及它包含的子路由：

![](./images/48fcfb6a7f4fea4110787a6311719316.png )

这样当组件树渲染的时候，就知道渲染什么组件了：

![](./images/c50c2b57c8feb6cdf98efd7c5fa89b3f.png )

就是把 match 的这个结果渲染出来。

这样就完成了路由对应的组件渲染：

![](./images/e09970133b733758e0f55571aff56a69.png )

也就是这样的流程：

![](./images/b84fb09c368a69f57e8ec63381ad5606.png )

当点击 link 切换路由的时候：

![](./images/ea3a8d999c5d8cac07a0dcaa6502ba38.png )

会执行 navigate 方法：

![](./images/5eeb0a3a47473de9ec2e96649c5990c3.png )

![](./images/2eac56952d7f738d8a51f14571a53370.png )

然后又到了 matchRoutes 的流程：

![](./images/1a194dee6aab20dbf27fb6934ed2f9e2.png )

match 完会 pushState 或者 replaceState 修改 history，然后更新 state：

![](./images/e30744c13ed371bff77a4aac2d9b6eee.png )

然后触发了 setState，组件树会重新渲染：

![](./images/bf82ae6e1f7c19713183eb3cff5abf2e.png )

![](./images/9cc9d2a06232f5ac43337f9389489ce7.png )

也就是这样的流程：

![](./images/4812fbb0b176992df6b19e8c70972eb7.png )

router.navigate 会传入新的 location，然后和 routes 做 match，找到匹配的路由。

之后会 pushState 修改 history，并且触发 react 的 setState 来重新渲染，重新渲染的时候通过 renderMatches 把当前 match 的组件渲染出来。

而渲染到 Outlet 的时候，会从 context 中取出当前需要渲染的组件来渲染：

![](./images/9acbe329bf747e7ff2382cded6bf6f6b.png )

![](./images/5a382fde75c5c0279532b15b18cd874d.png )

这就是 router 初次渲染和点击 link 时的渲染流程。

那点击前进后退按钮的时候呢？

这个就是监听 popstate，然后也做一次 navigate 就好了：

![](./images/af7d6c0b5d792711d50728a7c53e2802.png )

![](./images/4a573676f7fec5ad2bd5beaadf646d01.png )

![](./images/9ef536a8249fc4e6583d238dda0eca16.png )

后续流程一样。

![](./images/577b99a3986fef179e123881f4dcfd0b.png )

回过头来，其实 react router 的 routes 其实支持这两种配置方式：

![](./images/151d659890e343ee190132ecfb199b10.png )

![](./images/ffda540f2a129c1b011c9f4ed7cfcfa3.png )

效果一样。

看下源码就知道为什么了：

首先，这个 Route 组件就是个空组件，啥也没：

![](./images/c3ec610c9943fabdefdcba514bf7ec32.png )

而 Routes 组件里会从把所有子组件的参数取出来，变成一个个 route 配置：

![](./images/750bb4065369c455f979111ba91aa6e5.png )

![](./images/099efdd35b207a44b66f73f5680aa46d.png )

结果不就是和对象的配置方式一样么？

## 总结

我们学习了 history api 和 React Router 的实现原理。

history api 有这些：

- length：history 的条数
- forward：前进一个
- back：后退一个
- go：前进或者后退 n 个
- pushState：添加一个 history
- replaceState：替换当前 history
- scrollRestoration：保存 scroll 位置，取值为 auto 或者 manual，manual 的话就要自己设置 scroll 位置了

而且还有 popstate 事件可以监听到 history.go、history.back、history.forward 的导航，拿到最新的 location。

这里要注意 pushState、replaceState 并不能触发 popstate 事件。也就是 history 之间导航（go、back、forward）可以触发 popstate，而修改 history （push、replace）不能触发。

React Router 就是基于这些 history api 实现的。

首次渲染的时候，会根据 location 和配置的 routes 做匹配，渲染匹配的组件。

之后点击 link 链接也会进行 location 和 routes 的匹配，然后 history.pushState 修改 history，之后通过 react 的 setState 触发重新渲染。

前进后退的时候，也就是执行 history.go、history.back、history.forward 的时候，会触发 popstate，这时候也是同样的处理，location 和 routes 的匹配，之后通过 react 的 setState 触发重新渲染。

渲染时会用到 Outlet组件 渲染子路由，用到 useXxx 来取一些匹配信息，这些都是通过 context 来传递的。

这就是 React Router 的实现原理，它和 history api 是密不可分的。
 