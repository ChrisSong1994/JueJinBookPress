# 第51章—基于react-dnd实现拖拽排序

﻿拖拽是常见的需求，在 react 里我们会用 react-dnd 来做。

这节我们通过一个拖拽排序的案例来入门下 react-dnd。

```javascript
npx create-react-app --template=typescript react-dnd-test
```
新建个 react 项目

![](./images/d5d38f6fe743a05b850ee5c00380c61b.webp )

安装 react-dnd 相关的包：

```
npm install react-dnd react-dnd-html5-backend
```
然后改一下 App.tsx

```javascript
import './App.css';

function Box() {
  return <div className='box'></div>
}

function Container() {
  return <div className="container"></div>
}

function App() {
  return <div>
    <Container></Container>
    <Box></Box>
  </div>
}

export default App;
```
css 部分如下：

```css
.box {
  width: 50px;
  height: 50px;
  background: blue;
  margin: 10px;
}

.container {
  width: 300px;
  height: 300px;
  border: 1px solid #000;
}
```

把它跑起来：

```
npm run start
```

是这样的：
![](./images/a299f07e05e24c0a15c2631cd63cd276.webp )

现在我们想把 box 拖拽到 container 里，用 react-dnd 怎么做呢？

dnd 是 drag and drop 的意思，api 也分有两个 useDrag 和 useDrop。

box 部分用 useDrag 让元素可以拖拽：

```javascript
function Box() {
  const ref = useRef(null);

  const [, drag]= useDrag({
    type: 'box',
    item: {
      color: 'blue'
    }
  });

  drag(ref);

  return <div ref={ref} className='box'></div>
}
```
用 useRef 保存 dom 引用，然后用 useDrag 返回的第二个参数处理它。

至于 type 和 item，后面再讲。

然后是 Container：

```javascript
function Container() {
  const ref = useRef(null);

  const [,drop] = useDrop(() => {
    return {
      accept: 'box',
      drop(item) {
        console.log(item);
      }
    }
  });
  drop(ref);

  return <div ref={ref} className="container"></div>
}
```
用 useDrop 让它可以接受拖拽过来的元素。

接收什么元素呢？

就是我们 useDrag 的时候声明的 type 的元素。

![](./images/0af2579917f82ac6623ae8d7d8bd83ac.webp )

在 drop 的时候会触发 drop 回调函数，第一个参数是 item，就是 drag 的元素声明的那个。

只是这样还不行，还要在根组件加上 Context：

![](./images/2340122e8dea826f67ab7ef0d7acb893.webp )

```javascript
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(<DndProvider backend={HTML5Backend}><App></App></DndProvider>);
```
之前是直接渲染 App，现在要在外面加上 DndProvider。

这个就是设置 dnd 的 context的，用于在不同组件之间共享数据。

然后我们试试看：

![](./images/5041bd3acaf8391e1d3959113607c75f.gif )

确实，现在元素能 drag 了，并且拖到目标元素也能触发 drop 事件，传入 item 数据。

那如果 type 不一样呢？

![](./images/d83ca199372caba25bbd4c600c8ca78c.webp )

![](./images/edbeaa15fd1795fb84826349b21b4093.gif )

那就触发不了 drop 了。

然后我们给 Box 组件添加一个 color 的 props，用来设置背景颜色：

![](./images/53650c02f6df161772a64c901afce8c5.webp )

并且给 item 的数据加上类型。

```javascript
interface ItemType {
  color: string;
}
interface BoxProps {
  color: string
}
function Box(props: BoxProps) {
  const ref = useRef(null);

  const [, drag]= useDrag({
    type: 'box',
    item: {
      color: props.color
    }
  });

  drag(ref);

  return <div ref={ref} className='box' style={
    { background: props.color || 'blue'}
  }></div>
}
```
添加几个 Box 组件试一下：

![](./images/0499f004bc02445772a28d7c1d7e01e8.webp )

![](./images/47bb6f5316b2bc46c2876b730088a9a6.webp )

没啥问题。

然后我们改下 Container 组件，增加一个 boxes 数组的 state，在 drop 的时候把 item 加到数组里，并触发渲染：

![](./images/e38df482231235ad1ecab6491520188b.webp )

```javascript
function Container() {
  const [boxes, setBoxes] = useState<ItemType[]>([]);

  const ref = useRef(null);

  const [,drop] = useDrop(() => {
    return {
      accept: 'box',
      drop(item: ItemType) {
        setBoxes((boxes) => [...boxes, item])
      }
    }
  });
  drop(ref);

  return <div ref={ref} className="container">
    {
      boxes.map(item => {
        return <Box color={item.color}></Box>
      })
    }
  </div>
}
```
这里 setBoxes 用了函数的形式，这样能拿到最新的 boxes 数组，不然会形成闭包，始终引用最初的空数组。

测试下：

![](./images/cf30daddad6bbb48f24127fa898f6f83.gif )

这样，拖拽到容器里的功能就实现了。

我们再加上一些拖拽过程中的效果：

![](./images/89108eb73d3969bfff734db88d511be4.webp )

useDrag 可以传一个 collect 的回调函数，它的参数是 monitor，可以拿到拖拽过程中的状态。

collect 的返回值会作为 useDrag 的返回的第一个值。

我们判断下，如果是在 dragging 就设置一个 dragging 的 className。

```javascript
function Box(props: BoxProps) {
  const ref = useRef(null);

  const [{dragging}, drag]= useDrag({
    type: 'box',
    item: {
      color: props.color
    },
    collect(monitor) {
      return {
        dragging: monitor.isDragging()
      }
    }
  });

  drag(ref);

  return <div ref={ref} className={ dragging ? 'box dragging' : 'box'} style={
    { background: props.color || 'blue'}
  }></div>
}
```
然后添加 dragging 的样式：

```css
.dragging {
  border: 5px dashed #000;
  box-sizing: border-box;
}
```

测试下：
 
![](./images/9b0dff40c6af4c4b4b9bb89c92c10289.gif )

确实，这样就给拖拽中的元素加上了对应的样式。

但如果我们想把这个预览的样式也给改了呢？

![](./images/1f559611d78918123ff87a97aa30f51b.webp )

这时候就要新建个组件了：

```javascript
const DragLayer = () => {
  const { isDragging, item, currentOffset} = useDragLayer((monitor) => ({
      item: monitor.getItem(),
      isDragging: monitor.isDragging(),
      currentOffset: monitor.getSourceClientOffset(),
    }));

    if (!isDragging) {
      return null;
    }
    return (
      <div className='drag-layer' style={{
        left: currentOffset?.x,
        top: currentOffset?.y
      }}>{item.color} 拖拖拖</div>
    );
}
```

useDragLayer 的参数是函数，能拿到 monitor，从中取出很多东西，比如 item、isDragging，还是有 clientOffset，也就是拖拽过程中的坐标。

其中 drag-layer 的样式如下：

```css
.drag-layer {
  position: fixed;
}
```
引入下这个组件：

![](./images/b052b2d26662bb134c2e4ad43e8a33b1.webp )

现在的效果是这样的：

![](./images/2427be57ffa0f1bf9e9e0e8f4ba53c2e.gif )

确实加上了自定义的预览样式，但是原来的还保留着。

这个也可以去掉：

![](./images/af08596d4eae6b5e5f6135ba68fd728a.webp )

useDrag 的第三个参数就是处理预览元素的，我们用 getEmptyImage 替换它，就看不到了。

```javascript
dragPreview(getEmptyImage())
```
这时候就只有我们自定义的预览样式了：

![](./images/2bd88c9c0c3955d8f09f7aa0f34d9347.gif )

但其实这种逻辑只要执行一次就行，我们优化一下：

```javascript
useEffect(() => {
    drag(ref);
    dragPreview(getEmptyImage(), { captureDraggingState: true });
}, [])
```

drop 的逻辑也同样：

```javascript
useEffect(()=> {
    drop(ref);
}, []);
```

这样，我们就学会了 react-dnd 的基本使用。

总结下：

- 使用 useDrag 处理拖拽的元素，使用 useDrop 处理 drop 的元素，使用 useDragLayer 处理自定义预览元素
- 在根组件使用 DndProvider 设置 context 来传递数据
- useDrag 可以传入 type、item、collect 等。type 标识类型，同类型才可以 drop。item 是传递的数据。collect 接收 monitor，可以取拖拽的状态比如  isDragging 返回。
- useDrag 返回三个值，第一个值是 collect 函数返回值，第二个是处理 drag 的元素的函数，第三个值是处理预览元素的函数
- useDrop 可以传入 accept、drop 等。accept 是可以 drop 的类型。drop 回调函数可以拿到 item，也就是 drag 元素的数据
- useDragLayer 的回调函数会传入 monitor，可以拿到拖拽的实时坐标，用来设置自定义预览效果

全部代码如下：

```javascript
import { useDrag, useDragLayer, useDrop } from 'react-dnd';
import './App.css';
import { useEffect, useRef, useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend'

interface ItemType {
  color: string;
}
interface BoxProps {
  color: string
}
function Box(props: BoxProps) {
  const ref = useRef(null);

  const [{dragging}, drag, dragPreview]= useDrag({
    type: 'box',
    item: {
      color: props.color
    },
    collect(monitor) {
      return {
        dragging: monitor.isDragging()
      }
    }
  });

  useEffect(() => {
    drag(ref);
    dragPreview(getEmptyImage());
  }, [])

  return <div ref={ref} className={ dragging ? 'box dragging' : 'box'} style={
    { background: props.color || 'blue'}
  }></div>
}

function Container() {
  const [boxes, setBoxes] = useState<ItemType[]>([]);

  const ref = useRef(null);

  const [,drop] = useDrop(() => {
    return {
      accept: 'box',
      drop(item: ItemType) {
        setBoxes((boxes) => [...boxes, item])
      }
    }
  });

  useEffect(()=> {
    drop(ref);
  }, []);

  return <div ref={ref} className="container">
    {
      boxes.map(item => {
        return <Box color={item.color}></Box>
      })
    }
  </div>
}


const DragLayer = () => {
  const { isDragging, item, currentOffset} = useDragLayer((monitor) => ({
      item: monitor.getItem(),
      isDragging: monitor.isDragging(),
      currentOffset: monitor.getSourceClientOffset(),
    }));

    if (!isDragging) {
      return null;
    }
    return (
      <div className='drag-layer' style={{
        left: currentOffset?.x,
        top: currentOffset?.y
      }}>{item.color}拖拖拖</div>
    );
}

function App() {
  return <div>
    <Container></Container>
    <Box color="blue"></Box>
    <Box color="red"></Box>
    <Box color="green"></Box>
    <DragLayer></DragLayer>
  </div>
}

export default App;
```
css：

```css
.box {
  width: 50px;
  height: 50px;
  background: blue;
  margin: 10px;
}

.dragging {
  border: 5px dashed #000;
  box-sizing: border-box;
}
.drag-layer {
  position: fixed;
}

.container {
  width: 300px;
  height: 300px;
  border: 1px solid #000;
}
```
入了门之后，我们再来做个进阶案例：拖拽排序

我们写个 App2.tsx

```javascript
import { useState } from "react";
import './App2.css';

interface CardItem {
    id: number;
    content: string;
}

interface CardProps {
    data: CardItem
}
function Card(props: CardProps) {
    const { data } = props;
    return <div className="card">{data.content}</div>
}
function App() {
    const [cardList, setCardList] = useState<CardItem[]>([
        {
            id:0,
            content: '000',
        },
        {
            id:1,
            content: '111',
        },
        {
            id:2,
            content: '222',
        },
        {
            id:3,
            content: '333',
        },
        {
            id:4,
            content: '444',
        }
    ]);

    return <div className="card-list">
        {
            cardList.map((item: CardItem) => (
                <Card data={item} key={'card_' + item.id} />
            ))
        }
    </div>
}

export default App;
```
还有 App2.css：

```css
.card {
  width: 200px;
  line-height: 60px;
  padding: 0 20px;
  border: 1px solid #000;
  margin: 10px;
  cursor: move;
}
```
就是根据 cardList 的数据渲染一个列表。

![](./images/164031b5cd1e65ab74c09cb7dd4bcbfd.webp )

把它渲染出来是这样的：

![](./images/0ab55df7f152d742296aadc77164276d.webp )

拖拽排序，显然 drag 和 drop 的都是 Card。

我们给它加上 useDrag 和 useDrop：

```javascript
function Card(props: CardProps) {
    const { data } = props;

    const ref = useRef(null);

    const [, drag] = useDrag({
        type: 'card',
        item: props.data
    });
    const [, drop] = useDrop({
        accept: 'card',
        drop(item) {
            console.log(item);
        }
    });

    useEffect(() => {
        drag(ref);
        drop(ref);
    }, []);

    return <div ref={ref} className="card">{data.content}</div>
}

```

![](./images/6c9f8c77dc5ccf13791f87a7dd605664.gif )

接下来做的很显然就是交换位置了。

我们实现一个交换位置的方法，传入 Card 组件，并且把当前的 index 也传入：

![](./images/a599bea4e2c44e740e3d0f7de3de3be6.webp )
```javascript
const swapIndex = useCallback((index1: number, index2: number) => {
    const tmp = cardList[index1];
    cardList[index1] = cardList[index2];
    cardList[index2] = tmp;
    setCardList([...cardList]);
}, [])
```
这里 setState 时需要创建一个新的数组，才能触发渲染。

然后在 Card 组件里调用下：

![](./images/cd6ac9aa79b96950e7e9295fba4d03b9.webp )

增加 index 和 swapIndex 两个参数，声明 drag 传递的 item 数据的类型

在 drop 的时候互换 item.index 和当前 drop 的 index 的 Card

```javascript
interface CardProps {
    data: CardItem;
    index: number;
    swapIndex: Function;
}

interface DragData {
    id: number;
    index: number;
}

function Card(props: CardProps) {
    const { data, swapIndex, index } = props;

    const ref = useRef(null);

    const [, drag] = useDrag({
        type: 'card',
        item: {
            id: data.id,
            index: index
        }
    });
    const [, drop] = useDrop({
        accept: 'card',
        drop(item: DragData) {
            swapIndex(index, item.index)
        }
    });

    useEffect(() => {
        drag(ref);
        drop(ref);
    }, []);

    return <div ref={ref} className="card">{data.content}</div>
}
```

![](./images/ea220b5901100203e1e3b57d759128aa.gif )

这样就实现了拖拽排序。

不过因为背景是透明的，看着不是很明显。

我们设置个背景色：

![](./images/ba0b57be551e28bdab108ee839eb60fe.webp )

![](./images/54a946287cb911ad9bca1966782cf260.gif )

清晰多了。

但是现在是 drop 的时候才改变位置，如果希望在 hover 的时候就改变位置呢？

useDrop 有 hover 时的回调函数，我们把 drop 改成 hover就好了：

![](./images/ab174282429350e94775a57a422fa7e6.webp )

但现在你会发现它一直在换：

![](./images/189d20bd0a49497d9674ce01aa38ab3e.gif )

那是因为交换位置后，没有修改 item.index 为新的位置，导致交换逻辑一致触发：

![](./images/a0335427fa57db22e8ecbaab00d68525.webp )

![](./images/917968cc94bf6e1f1d8ec867f91f596d.gif )

在 hover 时就改变顺序，体验好多了。

然后我们再处理下拖拽时的样式。

![](./images/970c3a67bd240b5fa82f54c012497cb4.webp )

样式如下：

```css
.dragging {
  border-style: dashed;
  background: #fff; 
}
```

效果是这样的：

![](./images/fe3f0391b8dddf443c42fa072ef30920.gif )

这样，拖拽排序就完成了。

我们对 react-dnd 的掌握又加深了一分。

这个案例的全部代码如下：
```javascript
import { useCallback, useEffect, useRef, useState } from "react";
import './App2.css';
import { useDrag, useDrop } from "react-dnd";

interface CardItem {
    id: number;
    content: string;
}

interface CardProps {
    data: CardItem;
    index: number;
    swapIndex: Function;
}

interface DragData {
    id: number;
    index: number;
}

function Card(props: CardProps) {
    const { data, swapIndex, index } = props;

    const ref = useRef(null);

    const [{ dragging }, drag] = useDrag({
        type: 'card',
        item: {
            id: data.id,
            index: index
        },
        collect(monitor) {
            return {
                dragging: monitor.isDragging()
            }
        }
    });
    const [, drop] = useDrop({
        accept: 'card',
        hover(item: DragData) {
            swapIndex(index, item.index);
            item.index = index;
        }
        // drop(item: DragData) {
        //     swapIndex(index, item.index)
        // }
    });

    useEffect(() => {
        drag(ref);
        drop(ref);
    }, []);

    return <div ref={ref} className={ dragging ? 'card dragging' : 'card'}>{data.content}</div>
}

function App() {
    const [cardList, setCardList] = useState<CardItem[]>([
        {
            id:0,
            content: '000',
        },
        {
            id:1,
            content: '111',
        },
        {
            id:2,
            content: '222',
        },
        {
            id:3,
            content: '333',
        },
        {
            id:4,
            content: '444',
        }
    ]);

    const swapIndex = useCallback((index1: number, index2: number) => {
        const tmp = cardList[index1];
        cardList[index1] = cardList[index2];
        cardList[index2] = tmp;

        setCardList([...cardList]);
    }, [])

    return <div className="card-list">
        {
            cardList.map((item: CardItem, index) => (
                <Card data={item} key={'card_' + item.id} index={index} swapIndex={swapIndex}/>
            ))
        }
    </div>
}

export default App;
```
css：

```css
.card {
  width: 200px;
  line-height: 60px;
  padding: 0 20px;
  border: 1px solid #000;
  background: skyblue;
  margin: 10px;
  cursor: move;
}

.dragging {
  border-style: dashed;
  background: #fff; 
}
```

案例代码上传了[小册仓库](https://github.com/QuarkGluonPlasma/react-course-code/tree/main/react-dnt-test)

## 总结

我们学了 react-dnd 并用它实现了拖拽排序。

react-dnd 主要就是 useDrag、useDrop、useDragLayout 这 3 个 API。

useDrag 是给元素添加拖拽，指定 item、type、collect 等参数。

useDrop 是给元素添加 drop，指定 accepet、drop、hover、collect 等参数。

useDragLayout 是自定义预览，可以通过 monitor 拿到拖拽的实时位置。

此外，最外层还要加上 DndProvider，用来组件之间传递数据。

其实各种拖拽功能的实现思路比较固定：什么元素可以拖拽，什么元素可以 drop，drop 或者 hover 的时候修改数据触发重新渲染就好了。

比如拖拽排序就是 hover 的时候互换两个 index 的对应的数据，然后 setState 触发渲染。

用 react-dnd，我们能实现各种基于拖拽的功能。
