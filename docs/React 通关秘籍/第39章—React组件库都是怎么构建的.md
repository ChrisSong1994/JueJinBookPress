# 第39章—React组件库都是怎么构建的

﻿大家都用过组件库，react 流行的组件库有阿里的 ant-design、字节的 semi-design、arco-design 等。

那这些组件库都是怎么打包的呢？

我们自己写个组件库的话，怎么写打包逻辑呢？

这篇文章我们就来探究下。

新建一个项目：

```
mkdir component-lib-test

cd component-lib-test

npm init -y
```

![](./images/14ffc7745658d8063a32f61bd42f4b2e.png )

分别安装 ant-design、arco-design、semi-design

```
pnpm install antd

pnpm install @douyinfe/semi-ui

pnpm install @arco-design/web-react
```
npm、yarn 会把所有依赖铺平，看着比较乱。而 pnpm 不会，node_modules 下很清晰：

![](./images/91f4cb51a19cbf9605cbd94ba9db5842.png )

首先看下 antd，分为了 lib、es、dist 3 个目录：

![](./images/4ae534d130505ef359b681c7275ad532.png )

分别看下这三个目录的组件代码：

lib 下的组件是 commonjs 的：

![](./images/24026fc5e10cf431b23b399df6d6f5fe.png )

es 下的组件是 es module 的：

![](./images/dcfb104ec0b64bc81c4a49a1acd41cd0.png )

dist 下的组件是 umd 的：

![](./images/8b213b1e133eaf094626f206fd4b4dc4.png )

然后在 package.json 里分别声明了 commonjs、esm、umd 还有类型的入口：

![](./images/fd4e8428ae8e88a3758ffc5ad4e499ab.png )

这样，当你用 require 引入的就是 lib 下的组件，用 import 引入的就是 es 下的组件。

而直接 script 标签引入的就是 unpkg 下的组件。

再来看看 semi-design 的：

![](./images/0ef0c0e3a548930d462bc26c34590713.png )

也是一样：

![](./images/993fb3d5c4bd4529b3675ffb0d890c5e.png )

只不过多了个 css 目录。

antd 没有这个目录是因为它已经换成 css in js 的方案了，不需要单独引入 css 文件。

然后是 arco-design 的：

![](./images/b0575ed497d26f5be60b5d09289c78aa.png )

也是一样：

![](./images/dbbfbf602c2234ef3bdf7ecdb3d9f958.png )

同样是 lib、es、dist 3 个目录，同样是分别声明了 esm、commonjs、umd 的入口。

也就是说，组件库都是这样的，分别打包出 3 份代码（esm、commonjs、umd），然后在 package.json 里声明不同模块规范的入口。

那问题来了，如果我有一个 esm 的模块，怎么分别构建出 esm、commonjs、umd 的 3 份代码呢？

这个问题很容易回答。

umd 的代码用 webpack 打包就行。

esm 和 commonjs 的不用打包，只需要用 tsc 或者 babel 编译下就好了。

我们分别看下这三个组件库都是怎么做的：

先是 arco-design 的：

它的构建逻辑在 arco-cli 的 arco-scripts 下：

![](./images/f89bcd7ce25079a1d5cf53b4e7a94082.png )

看下这个 index.ts

![](./images/8c0c3f6c3decee70d2adb742f2a3c69b.png )

分别有 build 3 种代码加上 build css 的方法。

我们分别看下：

![](./images/dbe7e42725239980d65e9dadb7bc0c6b.png )

esm 和 cjs 的编译它封装了一个 compileTS 的方法，然后传入不同的 type。

compileTS 里可以用 tsc 或者 babel 编译：

![](./images/0d19fd8903e1625abc527e864e49c9f9.png )

tsc 编译就是读取项目下的 tsconfig.json，然后 compile：

![](./images/46f274e8125800d76f48e52dcf4a6e24.png )

babel 编译是基于内置配置，修改了下产物 modules 规范，然后编译：

![](./images/bcb145bbbc8ccbb6428a572764d11e92.png )

babelConfig 里配置了 typescript 和 jsx 的编译：

![](./images/0fd318447a2334001b466843c81b6e75.png )

再就是 umd：

和我们分析的一样，确实是用 webpack 来打包：

![](./images/10ec6d198aba02dcf14579eb48037803.png )

webpack 配置里可以看到，确实是为了 unpkg 准备的，用了 ts-loader 和 babel-loader：

![](./images/34952635a9dc0cb1dd41ee76076c73cc.png )

而 css 部分则是用了 less 编译：

![](./images/11a051b3f80659ec56ec4731e63cb02b.png )

gulp 是用来组织编译任务的，可以让任务串行、并行的执行。

这里的 gulp.series 就是串行执行任务，而 gulp.parallel 则是并行。

所以说，那 3 种代码加上 css 文件是怎么打包的就很清晰了：

![](./images/760ada34ed302b98d7d7825c108778d7.png )

其中用到 gulp 只是用来组织编译任务的，可用可不用。

再来看下 semi-design 的：

![](./images/10374ee0e68598df639312ce82e046c6.png )

它就没有单独分一个 xx-scripts 包了，直接在 semi-ui 的 scripts 目录下。

它也是用到了 gulp 来组织任务。

![](./images/ef9b74cd722d98e83917765f3e76b80c.png )

看下这个 compileLib 的 gulp task：

![](./images/dce19a916d446a02374c4aae9cc613ff.png )

这里的 compileTSXForESM 和 ForCJS 很明显就是编译组件到 esm 和 cjs 两种代码的。

先用了 tsc 编译再用了 babel 编译：

![](./images/19bc2882ae01f989845658a7bcf6bbe1.png )

然后是 umd，也是用了 webpack：

![](./images/6c703011c4717828e8da255b6c7ffee1.png )

用了 babel-loader 和 ts-loader：

![](./images/eae74dbd9b48230ad5635ae9c546ccd1.png )

最后是 scss 的编译：

semi-design 把所有组件的 scss 都放在了 semi-foundation 这个目录下来维护：

![](./images/b6b6fcfbe2258a1d1841db866c4dc8bf.png )

所以编译的时候就是这样的：

![](./images/c9b6f6e379041e45a539c0962d08185f.png )

就是把 semi-foundation 这个目录下的所有 scss 编译后合并成了一个文件

![](./images/00f9031eb5adbf2c1e589422f8632204.png )

而 arco-design 的样式是在组件目录下维护的：

![](./images/84d8dfb65da4535e4a390627b54d57ec.png )

这个倒是没啥大的区别，只是编译的时候改下源码目录就好了。

这就是 semi-design 的 esm、cjs、umd、scss 是如何编译打包的。

![](./images/ec60dfa517219deff9eab97cd63f207d.png )

和 arco-design 的 scripts 区别大么？

不大，只不过没有单独做一个 xxx-scripts 的包，编译出 esm 和 cjs 代码用的是 tsc + babel，而且用的是 scss 不是 less 而已。

再来看看 ant-design 的：

它也是单独分了一个包来维护编译打包的 scripts，叫做 @ant-design/tools。

它也有个 gulpfile 定义了很多 task

比如 compile 的 task 是编译出 es 和 cjs 代码的：

![](./images/fd942e752f38516a319e949ef10a5168.png )

是不是很熟悉的感觉？

大家都是这么搞的。

它也是先用了 tsc 再用 babel 编译，最后输出到 es 或者 lib 目录：

![](./images/076bb631a1947200bfc9a4f55596a78e.png )

打包 umd 代码的时候也是用了 webpack：

![](./images/b239f79f719376884192d0a693d67118.png )

只不过它这个 webpack 配置文件是读取的组件库项目目录下的，而不像 arco-design 那样是内置的。

这就是这三个组件库的编译打包的逻辑。

区别大么？

不大，甚至可以说几乎一模一样。

## 总结

我们分析了 ant-design、semi-design、arco-design 组件库的产物和编译打包逻辑。

它们都有 lib、es、dist 目录，分别放着 commonjs、es module、umd 规范的组件代码。

并且在 package.json 里用 main、module、unpkg 来声明了 3 种规范的入口。

从产物上来看，三个组件库都是差不多的。

然后我们分析了下编译打包的逻辑。

ant-design 和 acro-design 都是单独抽了一个放 scripts 的包，而 semi-design 没有。

它们编译 esm 和 cjs 代码都用了 babel 和 tsc 来编译，只不过 arco-design 是用 tsc 或者 babel 二选一，而 ant-design 和 semi-design 是先用 tsc 编译再用 babel 编译。

打包出 umd 的代码，三个组件库都是用的 webpack，只不过有的是把 webpack 配置内置了，有的是放在组件库项目目录下。

而样式部分，ant-design 是用 css-in-js 的运行时方案了，不需要编译，而 arco-design 用的 less，样式放组件目录下维护，semi-design 用的 scss，单独一个目录来放所有组件样式。

并且编译任务都是用的 gulp 来组织的，它可以串行、并行的执行一些任务。

虽然有一些细小的差别，但从整体上来看，这三大组件库的编译打包逻辑可以说是一模一样的。

写这样的 scripts 麻烦么？

并不麻烦，umd 部分的 webpack 打包大家都会，而 esm 和 cjs 用 babel 或者 tsc 编译也不难，至于 scss、less 部分，那个就更简单了。

所以编译打包并不是组件库的难点。

如果你要写一个组件库，也可以这样来写 scripts。
