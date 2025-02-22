# 第42章—数据不可变：immutable和immer

﻿假设 React 组件有这样一个状态：

```javascript
this.state = {
    a: {
        b: 1
    }
}
```

我们这样修改了它的状态：

```javascript
this.state.a.b = 2;
this.setState(this.state);
```

你觉得组件会重新渲染么？

我们先在 class 组件里试一下：

```javascript
import { Component } from 'react';

class Dong extends Component {
    constructor() {
        super();

        this.state = {
            a: {
                b: 1
            }
        }
    }

    componentDidMount() {
        setTimeout(() => {
            this.state.a.b = 2;
            this.setState(this.state);
        }, 2000);
    }
    render() {
        return <div>{this.state.a.b}</div>
    }
}

export default Dong;
```
渲染 state.a.b 的值，两秒以后修改 state。

![](./images/b7ab3ae99d30c8c050ff8adce7f3b3ca.webp )

你发现它重新渲染了，因为普通的 class 组件只要 setState 就会渲染。

但很多情况下我们需要做性能优化，只有 props 和 state 变了才需要渲染，这时候会继承 PureComponent，它和 memo 作用一样：

![](./images/1ca25b99e02ee1798f00b31033a9dbf8.webp )

但这时候你就会发现组件不再重新渲染了。

说明这种情况下不能这样写 setState：

![](./images/4b1082be39efb3d882a54e7841927ef0.webp )

先不着急探究原因，我们再在 function 组件里试一下：

```javascript
import { useEffect, useState } from 'react';

function Dong() {
    const [state, setState] = useState({
        a: {
            b: 1
        }
    });

    useEffect(() => {
        setTimeout(() => {
            state.a.b = 2;
            setState(state)
        }, 2000);
    }, [])
    return <div>{state.a.b}</div>
}

export default Dong;
```
这时候你觉得组件会重新渲染么？

![](./images/79f43d0160eaad453eecd0f6a13ed584.webp )

结果是不会重新渲染。

这说明 React 内部肯定对 function 组件还有继承 PureComponent 的 class 组件做了相应的处理。

那 React 都做了什么处理呢？

我们从源码看一下：

首先是继承 PureComponent 的 class 组件：

![](./images/4a5db9163f390e1e9d97a16e84785bfc.webp )

你会发现 React 在更新 class 组件的时候，会判断如果是 PureComponent，那么会浅比较 props 和 state，如果变了才会渲染。

怎么浅比较的呢？

![](./images/4c3462b6b2547e8a58cc00fb3cc290cb.webp )

 你会发现它先对比了两个值是否相等，如果不相等的话，再取出 key 来，对比每个 key 的值是否相等。
 
 所以说，我们 setState 的时候传入 this.state 就不行了，第一个判断都过不去。
 
 而且就算创建了新对象，如果每个 key 的值没有变，那依然也是不会渲染的。
 
 这就是 React 对 PureComponent 做的优化处理。
 
 再来看下 function 组件的，React 是怎么对它做的处理呢？
 
![](./images/28c93642d2a1d56506718e6ef95d0c87.webp )

你会看到调用 useState 的 setXxx 时，React 会判断上次的 state 和这次的 state，如果一样，那就不会渲染，直接 return 了。

这是为什么 function 组件里 setState 上次的 state 不行的原因。

这两种情况还是有区别的，PureComponent 的处理里如果 state 变了，还会依次对比每个 key 的值，如果有某个值变了才会去渲染，但 function 组件里只对比了 state。

我们测试一下：

![](./images/21ec85b084ba7c54c52747405f7a697e.webp )

用上图的方式 setState，整个 state 变了，但是 key 对应的值没有变。

在 PureComponent 的 class 组件里，按照我们的分析应该不会再渲染，只会打印一次 render：

![](./images/6ca77b73a029dfe43c031e78cc2da614.webp )

确实是这样，虽然 state 对象变了，但是 key 的值没变，不会重新渲染。

然后在 function 组件里试一下：

![](./images/6dac6c7de62df87eea5c8b6845331690.webp )

你会发现它打印了两次 render：

![](./images/6268ff6b5d38ca19ec36afe904e809b7.webp )

综上，我们可以总结一下：

- **普通的 class 组件，setState 就会重新渲染**
- **继承 PureComponent 的 class 组件，setState 时会对比 props 和 state 本身变没变，还会对比 state 的每个 key 的值变没变，变了才会重新渲染**
- **function 组件在用 useState 的 setXxx 时，会对比 state 本身变没变，变了就会重新渲染**

为什么 function 组件里只对比了 state 没有对比每个 key 的值也很容易理解，因为本来每个 state就是用 useState 单独声明的了，不像 class 组件的 state 都在一起。

知道了这个结论，我们也就知道了 setState 该怎么写了：

class 组件要这么写：

![](./images/bcaf900c6fbda5e6228ca398c180e4f4.webp )

state 的每个要修改的 key 的值，如果是个对象，那要创建一个新的对象才行。

function 组件里也是，要这么写：

![](./images/c800ef6f82655eb17ed7d16ac6ec40fd.webp )

综上，**不管是 class 组件，还是 function 组件，setState 时都要创建新的 state，并且对应的 key 的值的时候，如果是对象，要创建新的对象（虽然普通 class 组件里可以不这么写，但还是建议统一用这种写法，不然容易引起困惑）。**

但这样又有了一个新的问题：

如果 state 的内容很多呢？

![](./images/7c822a2de5414c872368611d25c9e01d.webp )

而你只想修改其中的一部分，要把整个对象复制一次：

![](./images/bcf07b737201e91a79933a381331cb25.webp )

是不是很麻烦？

能不能我修改了对象的值，立马给我返回一个新的对象呢？

就是最开头的时候，我们的那种写法改造一下：

```javascript
const newState = this.state.set('a.b', 2);

this.setState(newState);
```

这么一个明显的痛点需求，自然就有相应的库了，也就是 immutable，这个是 facebook 官方出的，说是花了三年写的。

它有这么几个 api：fromJS、toJS、set、setIn、get、getIn。

我们试一下就知道了：

```javascript
const immutableObj = fromJS({
    a: {
        b: 1
    }
});
const newObj = immutableObj.get('a').set('b', 2);
```

用 fromJS 把 JS 对象转成 immutable 内部的数据结构，然后 get a，再 set b 的值。

这样返回的是 immutable 的数据结构，并且对 b 做了修改：

![](./images/25953cd535b7288d6765f87906b9ebdc.webp )

你和之前的 a 属性的值对比下，发现也不一样了：

![](./images/60ccdb04aa826713f406073b445a8cbb.webp )

这就是它的作用，修改值以后返回新的 immutable 数据结构。

那如果像修改一个层数比较深的值，但希望返回的值是整个对象的新的 immutable 结构呢？

可以用 setIn：

![](./images/44232be5664e7a9bac736784b2be61a7.webp )

这样修改了任意属性之后，都能拿到最新的对象，这不就完美解决了我们的痛点问题么？

你还可以用 toJS 再把 immutable 数据结构转成 JS 对象：

![](./images/4332d984ed34fc1ce8d958affecd6f12.webp )

再来回顾下 immutable 的 api： fromJS、toJS、set、get、setIn、getIn 这些都很容易理解。再就是 immutable 内部的数据结构 Map、Set 等。（注意这里的 Map、Set 不是 JS 里的那个，而是 immutable 实现的）

这些 immutable 数据结构一般不大需要手动创建，直接用 fromJS 让 immutable 去创建就行。

然后我们在 React 组件里用一下试试：

先在 class 组件里用用：

![](./images/74ef72760b1b1516173b4d83fe1ea422.webp )

a 的值是个对象，我们用 fromJS 转成 immutable 的数据结构，之后修改调用 set 或 setIn 来修改。

不过，渲染的时候也得用 get、getIn 的 api 来取了。

![](./images/8a4fd85821225523b1a724bc86a79152.webp )

这样也解决了 setState 需要创建新对象的问题，而且更优雅。

有的同学可能会问，为什么要 sate.a 用 fromJS 转成 immutable，而不是整个 state 呢？

因为 react 内部也会用到这个 state 呀，就比如上面那个浅比较那里：

![](./images/d305c16cdf08508342c4c1dcc7abc5a1.webp )

react 需要把每个 key 的值取出来对比下变没变，而 immutable 对象只能用 get、getIn 来取，所以**class 组件里不能把整个 state 变为 immutable，只能把某个 key 值的对象变为 immutable**。

再在 function 组件里用下：

![](./images/f11fa671b09a70eaa04c906114199f6d.webp )

function 组件里就可以这样写了，把整个 state 用 fromJS 变为 immutable 的，然后后面修改用 setIn，获取用 getIn。

![](./images/56950e37ec58093a52beaf1b90e2eeb0.webp )

也同样解决了 setState 要创建新对象的问题。

为啥 function 组件里就可以把整个 state 变为 immutable 的了呢？

因为只有组件内部会用呀，我们自己写的代码是知道用 setIn、getIn 来操作的，但是 class 组件的话 react 还会对 PureComponent 做一些优化，会在组件外把 state 取出来处理，所以那个就只能把某些 key 变为 immutable 了。

immutable 介绍完了，大家觉得怎么样？

immutable 确实解决了创建新对象的复杂度的问题，而且性能也好，因为它创建了一套自己的数据结构。

但也相应的，导致使用的时候必须要用 getIn、setIn 的 api 才行，有一些心智负担。

这种心智负担是不可避免的吧？

还真可以，这几年又出了一个新的 immutable 库，叫做 immer（MobX 作者写的）。它就覆盖了 immutable 的功能的同时，还没有心智负担。

没有心智负担？怎么可能？

我们试一下就知道了：

```javascript
import { produce } from 'immer';

const obj = {
    a: {
        b: 1
    }
};

const obj2 = produce(obj, draft => {
    draft.a.b = 2 
});
```

obj 是原对象，调用 produce 传入该对象和要对它做的修改，返回值就是新对象：

![](./images/946d3284e0d4244de9bc7dd55b5c209f.webp )

后面就是普通 JS 对象的用法，也不用啥 getIn、setIn 啥的。

我们在 class 组件里用一下：

![](./images/e165d8efe47f8ce34e7e400bb3253ead.webp )

setState 的时候调用 produce，传入原来的 state 和修改函数，这样返回的就是新的 state。

用 state 的时候依然是普通 JS 对象的用法。是不是简单的一批，心智负担基本为 0？

我们再在 function 组件里用一下：

![](./images/a7cb19a10c4950d53ce4de362ac8fc77.webp )

同样简单的一批，只要 setState 的时候调用下 produce 来产生新对象就行。

又学完了 immer，我们来对比下 immutable 和 immer：

直接看图吧：

class 组件里，immutable 这样写：


![](./images/5063b99b8e4266cba470e56ee7f82c67.webp )

immer 这样写：

![](./images/7180c0ee3b62534912f15ac36a8ee011.webp )

function 组件里，immutable 这样写：

![](./images/7962c58a066435c190070d88417611bf.webp )

immer 这样写：

![](./images/3f3596a03e976b0bc09f55be2c22907d.webp )

没有对比就没有伤害，从使用体验上，immer 完胜。

这么说，我们只用 immer 不就行了？

也不全是，90% 的场景下用 immer 就行，但 immutable 也有它独特的优点：

immutable 有自己的数据结构，修改数据的时候会创建新的节点连接之前的节点组成新的数据结构。

![](./images/c159d5546db42bf6260b184c826bfd37.webp )

而 immer 没有自己的数据结构，它只是通过 Proxy 实现了代理，内部自动创建新的对象：

![](./images/50ee0ece60b3ae2be1aa7eeefa0851f4.webp )

只不过是把手动创建新对象的过程通过代理给自动化了：

![](./images/838935772fce1aaae557fe5f4e686fb5.webp )

所以从性能上来说，如果有特别大的 state 的话，immutable 会好一些，因为他用的是专用数据结构，做了专门的优化，除此以外，immer 更好一些。

综上，90% 的 React 应用，用 immer 比 immutable 更好一些，代码写起来简单，也更容易维护。有大 state 的，可以考虑 immutable。

此外，immutable 在 redux 里也很有用的：

用 immutable 的话是这样写：

```javascript
const initialState = fromJS({})

function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_NAME:
      return state.set('name', 'guang')
    default:
      return state
  }
}
```
取 store 的 state 要用 getIn 或 get：
```javascript
function mapStateToProps(state) {
    return {
      xxxx: state.getIn(['guangguang', 'guang']),
      yyyy: state.getIn(['dongdong', 'dong'])
    }
  }
```

而 immer 是这样写：
```javascript
const reducer = produce((state = initialState, action) => {
  switch (action.type) {
    case SET_NAME:
      state.name = 'guang';
      break;
    default:
      return state
  }
})
```
用 store 的 state 是普通对象的用法：

```javascript
function mapStateToProps(state) {
    return {
      xxxx: state.guangguang,
      yyyy: state.dongdong
    }
}
```
从结合 redux 的角度来看，也是 immer 在体验上完胜。

## 总结

在 React 组件里 setState 是要创建新的 state 对象的，在继承 PureComponent 的 class 组件、function 组件都是这样。

继承 PureComponent 的 class 组件会浅对比 props 和 state，如果 state 变了，并且 state 的 key 的某个值变了，才会渲染。

function 组件的 state 对象变了就会重新渲染。

虽然在普通 class 组件里，不需要创建新的 state，但我们还是建议统一，所有的组件里的 setState 都创建新的对象。

但是创建对象是件比较麻烦的事情，要一层层 ...，所以我们会结合 immutable 的库。

主流的 immutable 库有两个， facebook 的 immutable 和 MobX 作者写的 immer。

immutable 有自己的数据结构，Map、Set 等，有 fromJS、toJS 的 api 用来转换 immutable 数据结构和普通 JS 对象，操作数据需要用 set、setIn、get、getIn。

immer 只有一个 produce api，传入原对象和修改函数，返回的就是新对象，使用新对象就是普通 JS 对象的用法。

要注意在 class 组件里，只能 state 的某个 key 的值变为 immutable，而不能整体变为 immtable，因为 React 内部会用到。

从使用体验上来说，不管是和 react 的 setState 结合还是和 redux 的 reducer 结合，都是 immer 完胜，但是 immutable 因为有专用数据结构的原因，在有大 state 对象的时候，性能会好一些。

90% 的情况下，immer 能完胜 immutable。
