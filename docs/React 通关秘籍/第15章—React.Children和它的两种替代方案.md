# 第15章—React.Children和它的两种替代方案

﻿JSX 的标签体部分会通过 children 的 props 传给组件：

![](./images/d23705131196f3ba9441884bb062ccbe.webp )

在组件里取出 props.children 渲染：

![](./images/93f66beb771966016de36ca37039596e.webp )

但有的时候，我们要对 children 做一些修改。

比如 Space 组件，传入的是 3 个 .box 的 div：

![](./images/d23705131196f3ba9441884bb062ccbe.webp )

但渲染出来的 .box 外面包了一层：

![](./images/4ca8c412ec1239f8d46950a9f1ad0bc1.webp )

这种就需要用 React.Children 的 api 实现。

有这些 api：

- Children.count(children)
- Children.forEach(children, fn, thisArg?)
- Children.map(children, fn, thisArg?)
- Children.only(children)
- Children.toArray(children)

我们来试一下。

用 cra 创建个 react 项目：

```shell
npx create-react-app --template=typescript children-test
```
![](./images/df15408490cc164788969020b8677912.webp )

进入项目，改下 index.tsx

```javascript
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(<App />);
```
然后在 App.tsx 里测试下 Children 的 api：

```javascript
import React, { FC } from 'react';

interface AaaProps {
  children: React.ReactNode
}

const Aaa: FC<AaaProps> = (props) => {
  const { children } = props;

  return <div className='container'>
    {
      React.Children.map(children, (item) => {
        return <div className='item'>{item}</div>
      })
    }
  </div>
}

function App() {
  return <Aaa>
    <a href="#">111</a>
    <a href="#">222</a>
    <a href="#">333</a>
  </Aaa>
}

export default App;
```
在传入的 children 外包了一层 .item 的 div。

跑一下：

```shell
npm run start
```
可以看到，渲染出的 children 是修改后的：

![](./images/032c095f3cb0ee9fab0b20705bcce413.webp )

有的同学说，直接用数组的 api 可以么？

我们试试：

![](./images/f0247a6dec1108b5176c31f098e09bfd.webp )

```javascript
interface AaaProps {
  children: React.ReactNode[]
}

const Aaa: FC<AaaProps> = (props) => {
  const { children } = props;

  return <div className='container'>
    {
      // React.Children.map(children, (item) => {
      children.map(item => {
        return <div className='item'>{item}</div>
      })
    }
  </div>
}
```
要用数组的 api 需要把 children 类型声明为 ReactNode[]，然后再用数组的 map 方法：


![](./images/da5c0a93491a2a8cea83f21f900a5655.webp )

看起来结果貌似一样？

其实并不是。

首先，因为要用数组方法，所以声明了 children 为 ReactNode[]，这就导致了如果 children 只有一个元素会报错：

![](./images/24ba4054b37927d63e66cfc67dabdc76.webp )

更重要的是当 children 传数组的时候：

![](./images/b8750d007d63dd756e9eaf583325cf14.webp )

```javascript
function App() {
  return <Aaa>
    {
        [
            <span>111</span>,
            <span>333</span>,
            [<span>444</span>, <span>222</span>]
        ]
    }
  </Aaa>
}
```
数组的 map 处理后是这样的：

![](./images/5bdab58c029701e8114784ee2a7199b7.webp )

换成 React.Children.map 是这样的：

![](./images/b36a55b37c1c77a4d667ae386392c5bb.webp )

![](./images/0d3d1a007eee39ffb723a41f8765d409.webp )

React.Children.map 会把 children 拍平，而数组的方法不会。

还有一点，有时候直接调用数组的 sort 方法会报错：

```javascript
import React, { FC } from 'react';

interface AaaProps {
  children: React.ReactNode[]
}

const Aaa: FC<AaaProps> = (props) => {
  const { children } = props;

  console.log(children.sort());

  return <div className='container'>
  </div>
}

function App() {
  return <Aaa>
    {33}
    <span>hello world</span>
    {22}
    {11}
  </Aaa>
}

export default App;

```

![](./images/73882e364ffa267d927a29abe24eff44.webp )

因为 props.children 的元素是只读的，不能重新赋值，所以也就不能排序。

这时候只要用 React.Children.toArray 转成数组就好了：

![](./images/b91f4b14b9515a6ad862511b010b42e3.webp )

（这里不用 children 数组方法了，就直接声明为 ReactNode 类型了）

```javascript
interface AaaProps {
  children: React.ReactNode
}

const Aaa: FC<AaaProps> = (props) => {
  const { children } = props;

  const arr = React.Children.toArray(children);
  
  console.log(arr.sort());

  return <div className='container'>
  </div>
}
```

![](./images/2efbcf2b977556eb77b0805324c93f5d.webp )

综上，直接用数组方法操作 children 有 3 个问题：

- 用数组的方法需要声明 children 为 ReactNode[] 类型，这样就必须传入多个元素才行，而 React.Children 不用
- 用数组的方法不会对 children 做拍平，而 React.Children 会
- 用数组的方法不能做排序，因为 children 的元素是只读的，而用 React.Children.toArray 转成数组就可以了

当然，不用记这些区别，只要操作 children，就用 React.Children 的 api 就行了。

然后再试下其它 React.Children 的 api：

```javascript
import React, { FC, useEffect } from 'react';

interface AaaProps {
  children: React.ReactNode
}

const Aaa: FC<AaaProps> = (props) => {
  const { children } = props;

  useEffect(() => {
    const count = React.Children.count(children);
  
    console.log('count', count);
    
    React.Children.forEach(children, (item, index) => {
      console.log('item' + index, item);
    });
  
    const first = React.Children.only(children);
    console.log('first', first);
  }, []);

  return <div className='container'>
  </div>
}

function App() {
  return <Aaa>
    {33}
    <span>hello world</span>
    {22}
    {11}
  </Aaa>
}

export default App;
```

![](./images/5b38daae6639f853baab1057bd1db251.webp )

React.Children.count 是计数，forEach 是遍历、only 是如果 children 不是一个元素就报错。

这些 api 都挺简单的。

有的同学可能会注意到，Children 的 api 也被放到了 Legacy 目录下，并提示用 Children 的 api 会导致代码脆弱，建议用别的方式替代：

![](./images/825314493ebb3788f46199d795a3b1db.webp )

我们先看看这些替代方式：

首先，我们用 React.Children 来实现这样的功能：

```javascript
import React, { FC } from 'react';

interface RowListProps {
  children?: React.ReactNode
}

const RowList: FC<RowListProps> = (props) => {
  const { children } = props;

  return <div className='row-list'>
    {
      React.Children.map(children, item => {
        return <div className='row'>
          {item}
        </div>
      })
    }
  </div>
}

function App() {
  return <RowList>
    <div>111</div>
    <div>222</div>
    <div>333</div>
  </RowList>
}

export default App;
```
对传入的 children 做了一些修改之后渲染。

结果如下：

![](./images/a694a861b1f1d81a3202623f090308f7.webp )

第一种替代方案是这样的：

```javascript
import React, { FC } from 'react';

interface RowProps{
  children?: React.ReactNode
}

const Row: FC<RowProps> = (props) => {
  const { children } = props;
  return <div className='row'>
    {children}
  </div>
}

interface RowListProps{
  children?: React.ReactNode
}

const RowList: FC<RowListProps> = (props) => {
  const { children } = props;

  return <div className='row-list'>
    {children}
  </div>
}

function App() {
  return <RowList>
    <Row>
      <div>111</div>
    </Row>
    <Row>
      <div>222</div>
    </Row>
    <Row>
      <div>333</div>
    </Row>
  </RowList>
}

export default App;
```
就是把对 children 包装的那一层封装个组件，然后外面自己来包装。

跑一下：

![](./images/672718ee2f8327e80e58865ca11df463.webp )

这样是可以的。

当然，这里的 RowListProps 和 RowProps 都是只有 children，我们直接用内置类型 PropsWithChildren 来简化下：

![](./images/ba114e53ac645499e9a060888f2a77f7.webp )

```javascript
import React, { FC, PropsWithChildren } from 'react';

const Row: FC<PropsWithChildren> = (props) => {
  const { children } = props;
  return <div className='row'>
    {children}
  </div>
}

const RowList: FC<PropsWithChildren> = (props) => {
  const { children } = props;

  return <div className='row-list'>
    {children}
  </div>
}

function App() {
  return <RowList>
    <Row>
      <div>111</div>
    </Row>
    <Row>
      <div>222</div>
    </Row>
    <Row>
      <div>333</div>
    </Row>
  </RowList>
}

export default App;
```

第二种方案不使用 chilren 传入具体内容，而是自己定义一个 prop：

```javascript
import { FC, PropsWithChildren, ReactNode } from 'react';

interface RowListProps extends PropsWithChildren {
  items: Array<{
    id: number,
    content: ReactNode
  }>
}

const RowList: FC<RowListProps> = (props) => {
  const { items } = props;

  return <div className='row-list'>
      {
        items.map(item => {
          return  <div className='row' key={item.id}>{item.content}</div>
        })
      }
  </div>
}

function App() {
  return <RowList items={[
    {
      id: 1,
      content: <div>111</div>
    },
    {
      id: 2,
      content: <div>222</div>
    },
    {
      id: 3,
      content: <div>333</div>
    }
  ]}>
  </RowList>
}

export default App;

```
我们声明了 items 的 props，通过其中的 content 来传入内容。

效果是一样的：

![](./images/63890d1978c98d0c41e53de3a1cae52d.webp )

而且还可以通过 render props 来定制渲染逻辑：

![](./images/4a971e87ab5df35774e2d19126bad26a.webp )

```javascript
import { FC, PropsWithChildren, ReactNode } from 'react';

interface Item {
  id: number,
  content: ReactNode
}

interface RowListProps extends PropsWithChildren {
  items: Array<Item>,
  renderItem: (item: Item) => ReactNode
}

const RowList: FC<RowListProps> = (props) => {
  const { items, renderItem } = props;

  return <div className='row-list'>
      {
        items.map(item => {
          return renderItem(item);
        })
      }
  </div>
}

function App() {
  return <RowList items={[
    {
      id: 1,
      content: <div>111</div>
    },
    {
      id: 2,
      content: <div>222</div>
    },
    {
      id: 3,
      content: <div>333</div>
    }
  ]}
  renderItem={(item) => {
    return <div className='row' key={item.id}>
      <div className='box'>
          {item.content}
      </div>
    </div>
  }}
  >
  </RowList>
}

export default App;
```
![](./images/34f897b94b15a39914f29293eb6639e9.webp )

综上，替代 props.children 有两种方案：

- 把对 children 的修改封装成一个组件，使用者用它来手动包装 
- 声明一个 props 来接受数据，内部基于它来渲染，而且还可以传入 render props 让使用者定制渲染逻辑

但是这些替代方案使用起来和 React.Children 还是不同的。

React.Children 使用起来是无感的：

![](./images/f5c59131d30bd9d712c1d13fb10fd14e.webp )

而这两种替代方案使用起来是这样的：

![](./images/c50a7f3d5a17c0d6bcb570b3aff912d2.webp )

![](./images/9cbc5baf67e2d699a442fb78f2a59282.webp )


![](./images/51a528c795118ab1308d094f08a80175.webp )

虽然能达到同样的效果，但是还是用 React.Children 内部修改 children 的方式更易用一些。

而且现在各大组件库依然都在大量用 React.Children

比如 semi design 的代码：

![](./images/2a76061ec22247e943b801a1ee2c8312.webp )

arco design 的代码：

![](./images/15deea2488a0de537d0da1b1e538e6e2.webp )

ant design 的代码：

![](./images/269f8d550a84f585741186e31318798c.webp )

比如我们上节写过的 Space 组件：

![](./images/7b81fa12e2fd254f3fe1a3333893ebf5.webp )

所以 React.Children 还是可以继续用的，因为这些替代方案和 React.Children 还是有差距。

案例代码上传了[小册仓库](https://github.com/QuarkGluonPlasma/react-course-code/tree/main/children-test)。
## 总结

我们学了用 React.Children 来修改 children，它有 map、forEach、toArray、only、count 等方法。

不建议直接用数组方法来操作，而是用 React.Children 的 api。

原因有三个：

![](./images/1cf920a945547f9ef142129496b1239a.webp )

当然，Children 的 api 被放到了 legacy 目录，可以用这两种方案来替代：

![](./images/21e9e2d7f29b03b55515e91e17d0f12b.webp )

不过，这两种替代方案易用性都不如 React.Children，各大组件库也依然大量使用 React.Children 的 api。

所以，遇到需要修改渲染的 children 的情况，用 React.Children  的 api，或是两种替代方案（抽离渲染逻辑为单独组件、传入数据 + render props）都可以。
