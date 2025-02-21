# 第40章—组件库实战：构建esm和cjs产物，发布到npm

﻿我们已经写了很多组件了，比如 Calendar、Watermark、OnBoarding 等，但都是用 cra 或者 vite 单独创建项目来写的。

这节我们把它们整合一下，加上构建脚本，发布到 npm，做成和 Ant Design 一样的组件库。

组件库的构建我们上节分析过，就是构建出 esm、commonjs、umd 3 种格式的代码，再加上 css 的构建就好了。

![](./images/5762a6b65d84dfeaceaba93de020db95.png )

ant design、arco design、semi design 都是这样。

我们再看几个组件库：

```
mkdir tmp
cd tmp
npm init -y
```
![](./images/dfee7795076e4a765d377a65521a7557.png )

安装 react-bootstrap：

```
pnpm install react-bootstrap
```
（用 pnpm 安装，node_modules 下目录比较简洁）

看下 node_modules/react-bootstrap 的 package.json

![](./images/37dd2864d9a6c2cae10d79b5b93be1c2.png )

可以看到，它也有 main 和 module，也就是 commonjs 和 es module 两种入口。

当你 import 的时候，引入的是 esm 的代码。

当你 require 的时候，引入的是 commonjs 的代码。

看一下 esm 和 cjs 下的代码：

![](./images/c093c996f280cb366f3ed4d24d948a97.png )

![](./images/7ae9f3ece836a552e92920737fcb1a8f.png )

当然，它也是支持 umd 的：

![](./images/4377b3356ea63cf273ca017cd2ea50b8.png )
 
看下 [build 脚本](https://github.com/react-bootstrap/react-bootstrap/blob/master/tools/build.js#L101-L103)：

![](./images/2832e100151e6d87a2dfb12ccdddc0bf.png )

就是分别用 babel 编译出 commonjs 和 esm 的代码就可以了：

![](./images/dd2e97574899c771e1d4d6ccdaefc554.png )

用 tsc 也行。

umd 格式代码也同样是 [webpack 打包的](https://github.com/react-bootstrap/react-bootstrap/blob/master/tools/build.js#L64)：

![](./images/c8f51b83d258ef70ff0540eac5538252.png )

不同于 antd、arco design 和 semi design，它就没有用 gulp 来组织流程。

gulp 本来就不是必须的，可用可不用。

甚至连单独的脚本都不需要，直接 tsc 编译就行：

比如这个 [blueprint 组件库](https://github.com/palantir/blueprint/blob/develop/packages/table/package.json#L22-L25)：

![](./images/39d24ce84a4291525625bee0480b9d90.png )

之前总结的组件库的构建流程是没问题的：

![](./images/5762a6b65d84dfeaceaba93de020db95.png )

然后我们新建一个项目来试一下：

```
npx create-vite guang-components
```

![](./images/d09a7a4afb986f749f8a4b06309bd51b.png )

进入项目，复制几个之前的组件过来：

![](./images/90195adeb724e562615fc59e22d9267b.png )

![](./images/5e0b7679b8d307ac528522e41dde7c48.png )

![](./images/00596a79f7359277c25fa0313655a292.png )

复制 Calendar、Watermark、Message 这三个组件：

![](./images/ad70b283c9d83367790c83bb41e55f13.png )

然后安装下依赖：

```
npm install

npm install --save react-transition-group lodash-es dayjs classnames

npm i --save-dev @types/react-transition-group
```
然后去掉 Calendar 和 Message 组件里样式的引入，css 和 js 是分开编译的：

![](./images/4a6721c1612144b5b92bfed64ab020fa.png )

![](./images/e5706cd66998a452954fb0100caa48a7.png )

把这些没用的文件删掉：

![](./images/8e79dc6dde0c6328069dbefe4b8da315.png )

加一个 index.ts 来导出组件：

![](./images/aef9da2a048087461e09e91f1fa64e82.png )

```javascript
import Calendar, { CalendarProps } from './Calendar';
import Watermark, { WatermarkProps } from './Watermark';
import { MessageProps, Position, MessageRef} from './Message';
import { useMessage } from './Message/useMessage';
import { ConfigProvider } from './Message/ConfigProvider';

export {
    Calendar,
    Watermark,
    ConfigProvider,
    useMessage
}

export type {
    CalendarProps,
    WatermarkProps,
    MessageProps,
    Position,
    MessageRef
}
```
接下来加上 tsc 和 sass 的编译：

添加一个 tsconfig.build.json 的配置文件：

```json
{
    "compilerOptions": {
      "declaration": true,
      "allowSyntheticDefaultImports": true,
      "target": "es2015",
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "Node",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "jsx": "react-jsx",  
      "allowImportingTsExtensions":null,
      "strict": true,
    },
    "include": [
      "src"
    ],
    "exclude": [
      "src/**/*.test.tsx",
      "src/**/*.stories.tsx"
    ]
}
```
然后编译下：

```bash
npx tsc -p tsconfig.build.json --module ESNext --outDir dist/esm

npx tsc -p tsconfig.build.json --module commonjs --outDir dist/cjs
```

![](./images/15dcb6c9bc57e8e236db6ad221b991c3.png )

看下 dist 的产物：

![](./images/282d85d944fc6b83fcc6af7fa5d81ff9.png )

![](./images/d1055e4e0c9b57583f23f67a5757d679.png )

![](./images/b5491406fb78ce16864fe891e71cd87b.png )

没啥问题，esm 和 commonjs 格式的代码都生成了。

然后再编译下样式：

```
npx sass ./src/Calendar/index.scss ./dist/esm/Calendar/index.css

npx sass ./src/Calendar/index.scss ./dist/cjs/Calendar/index.css

npx sass ./src/Message/index.scss ./dist/esm/Message/index.css

npx sass ./src/Message/index.scss ./dist/cjs/Message/index.css
```
![](./images/68cc26acd7e2a99420a6a12f1446eee5.png )

看下产物：

![](./images/897d96002a555a2f0bc42a629d4a9796.png )

![](./images/25f4da8ca4077d8b21bbfceeefd37a73.png )

没问题。

当然，sass 文件多了以后你可以写个 node 脚本来自动查找所有 sass 文件然后编译。

接下来只要把这个 dist 目录发到 npm 仓库就可以了。

![](./images/021b21537d21cc88df13000bafdf9850.png )

```javascript
"main": "dist/cjs/index.js",
"module": "dist/esm/index.js",
"types": "dist/esm/index.d.ts",
"files": [
    "dist",
    "package.json",
    "README.md"
],
```
main 和 module 分别是 commonjs 和 es module 的入口。

types 是 dts 的路径。

files 是哪些文件发布到 npm 仓库，没列出来的会被过滤掉。

并且，还需要把 private: true 和 type: module 的字段给去掉。

然后我们来发布 npm 包：

```
npm adduser
```
执行 npm adduser 命令，会打印一个链接让你登录或者注册：

![](./images/08bed2e6a737143af873282e325f5201.png )

登录后就可以 npm publish 了：

```javascript
npm publish
```

![](./images/27c066050cd3a1b62899a0c6351be69e.png )

发布完之后，在 https://www.npmjs.com 就可以搜索到：

![](./images/97be0b0b62a757cfa64d9c89d9c8eae1.png )

我们新建个项目来用用看：

```
npx create-vite guang-test
```

![](./images/6af67f6505952728e8559e43af7b2b0e.png )

安装依赖：

```
pnpm install

pnpm install guang-components
```
在 App.tsx 里用一下：

```javascript
import { Watermark } from 'guang-components';

const App = () => {
  return <Watermark
    content={['测试水印', '神说要有光']}
  >
   <div style={{height: 800}}>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
   </div>
  </Watermark>
};

export default App;
```
跑下开发服务：

```
npm run dev
```
![](./images/dbabf8732878c67213dec131d1a89929.png )

浏览器访问下：

![](./images/431a3a53b71f7bc519ff8b41cd6a40f3.png )

再试下另外两个组件：

```javascript
import dayjs from 'dayjs';
import {Calendar} from 'guang-components';
import 'guang-components/dist/esm/Calendar/index.css';

function App() {
  return (
    <div>
      <Calendar value={dayjs('2024-07-01')}></Calendar>
    </div>
  );
}

export default App;
```
这里用到了 dayjs：

```
pnpm install dayjs
```

![](./images/3ab88d440fec73d47bafb7bccf2487ac.png )

这里样式受 index.css 影响了，去掉就好了：

![](./images/f37eabd6e34187d280c6fb574ebd026a.png )

![](./images/26d7b40cc20dea79354218000143aeeb.png )

再来试下 Message 组件：

```javascript
import { ConfigProvider, useMessage } from "guang-components"
import 'guang-components/dist/esm/Message/index.css';

function Aaa() {
  const message = useMessage();

  return <button onClick={() =>{
    message.add({
      content:'请求成功'
    })
  }}>成功</button>
}

function App() {

  return (
    <ConfigProvider>
      <div>
        <Aaa></Aaa>
      </div>
    </ConfigProvider>
  );
}

export default App;
```

![](./images/df1531d2190d81fa9cb17c60c95cb99a.gif )

没啥问题。

然后我们优化下依赖：

其实用到 guang-components 的项目都会安装 react 和 react-dom 包，不需要把它放在 dependencies 里。

![](./images/4019a6553c449afeff7ebe615b44ee4f.png )

而是放在 peerDependencies 里：

![](./images/028b3585052b5b9acdd2775508a6852a.png )

它和 dependencies 一样，都是依赖，但是 dependencies 是子级，而 peerDependencies 是平级。

如果和其他 react 包的版本冲突时，dependencies 会保留一份副本，而 peerDependencies  会提示开发者去解决冲突，不会保留副本。

改下版本号，重新 npm publish：

![](./images/da535134a1aed7433de49f98675feb2b.png )

这样，我们的组件库的 npm 包就发布成功了！

再测试下 commonjs 的代码。

用 cra 创建个项目：

```
npx create-react-app --template=typescript tmp4
```

![](./images/7023ca1745dfaec7a83f24d266983c0d.png )

进入项目，安装组件库：

```
npm install --save guang-components
```

在 App.tsx 用一下：

```javascript
const { Watermark } = require('guang-components');

const App = () => {
  return <Watermark
    content={['测试水印', '神说要有光']}
  >
   <div style={{height: 800}}>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
   </div>
  </Watermark>
};

export default App;
```
注意，这次用 require 引入代码。

然后把开发服务跑起来：

```
npm run start
```
浏览器里看一下：

![](./images/df5cebcead8de190c812280d262c92ae.png )

没啥问题。

案例代码上传了[小册仓库](https://github.com/QuarkGluonPlasma/react-course-code/tree/main/guang-components)。

## 总结

今天我们把之前写过的部分组件封装成了组件库并发布到了 npm 仓库。

可以直接在项目里引入来用，和 antd 等组件库一样。

构建部分我们分析过很多组件库，都是一样的：

- commonjs 和 esm 的代码通过 tsc 或者 babel 编译产生
- umd 代码通过 webpack 打包产生
- css 代码通过 sass 或者 less 等编译产生
- dts 类型也是通过 tsc 编译产生

我们在 package.json 里配置了 main 和 module，分别声明 commonjs 和 es module 的入口，配置了 types 指定类型的入口。

然后通过 npm adduser 登录，之后 npm publish 发布到 npm。

这样，react 项目里就可以引入这个组件库来用了，之前写过的所有组件都可以加到这个组件库里。
