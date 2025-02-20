context 是 react 的主要特性，它能在任意层级的组件之间传递数据。

在业务代码中用 context 可能不多，大家更偏向于全局的状态管理库，比如 redux、mobx，但在 antd 等组件库里用的特别多。

那 antd 组件库是怎么用 context 的？context 又是怎么实现的呢？

今天我们就来探究一下。

首先，我们过一遍 context 的用法：

context 使用 createContext 的 api 创建：
```javascript
import { createContext } from 'react';

const countContext = createContext(111);
```
任意层级的组件可以从中取值：

function 组件使用 useContext 的 react hook：

```javascript
import { useContext } from 'react';

function Ccc() {
  const count = useContext(countContext);
  return <h2>context 值为：{count}</h2>
}
```

![](./images/4a06d97e137a463d9d4c5532b3cd846b~tplv-k3u1fbpfcp-watermark.image.png)

class 组件使用 Consumer 的 api：

```javascript
import { createContext, Component } from 'react';

const countContext = createContext(111);

class Ccc extends Component {
  render() {
    return <h2>context 的 值为：{this.props.count}</h2>
  }
}

function Bbb() {
  return <div>
    <countContext.Consumer>{
        (count) => <Ccc count={count}></Ccc>
      }
    </countContext.Consumer>
  </div>
}
```

![](./images/ef5ddfdbce8e45309aa3f37d3f8de49e~tplv-k3u1fbpfcp-watermark.image.png)

修改 Context 中的值使用 Provider 的 api：

```javascript
import { createContext } from 'react';

const countContext = createContext(111);

function Bbb() {
  return <div>
      <countContext.Provider value={333}>
        <Ccc></Ccc>
      </countContext.Provider>
  </div>
} 
```

![](./images/ddb4c849022a43a1acd546a060362a99~tplv-k3u1fbpfcp-watermark.image.png)

总结来说就是**用 createContext 创建 context 对象，用 Provider 修改其中的值， function 组件使用 useContext 的 hook 来取值，class 组件使用 Consumer 来取值。**

这样的 context 机制就能实现任意层级的传值，比如这样三层组件：

```javascript
import { createContext, useContext } from 'react';

const countContext = createContext(111);

function Aaa() {
  return <div>
      <countContext.Provider value={222}>
        <Bbb></Bbb>
      </countContext.Provider>
  </div>
} 

function Bbb() {
  return <div><Ccc></Ccc></div>
}

function Ccc() {
  const count = useContext(countContext);
  return <h2>context 的值为：{count}</h2>
}

export default Aaa;
```
在 Aaa 组件中修改后的 context 值就能被 Ccc 组件拿到：

![](./images/a6e16f03afa94e1aad4b10f0c6ccc07a~tplv-k3u1fbpfcp-watermark.image.png)

用起来其实还是蛮简单的，就这么几个用法，多写几遍就会了。

但有的同学可能会疑惑：context 好像在项目里也没咋用过呀，这个一般用来干啥呀？

真的不常用么？

并不是，antd 里就有大量的 context 应用，只是你不知道而已。

不信看下这个：

```javascript
import { Form, Input } from 'antd';
import { useEffect } from 'react';

const App = () => {
  const [form]= Form.useForm();
  
  useEffect(() => {
    form.setFieldsValue({
      a: {
        b: {
          c: 'ccc'
        }
      },
      d: {
        e : 'eee'
      }
    })
  }, []);

  return (
    <Form form={form}>
      <Form.Item name={['d', 'e']}>
        <Input/>
      </Form.Item>
    </Form>
  )
}
export default App;
```
这代码熟悉吧！是不是经常写？

这是 antd 的 Form 组件的用法：

通过 useForm 拿到 form 对象，设置到 Form 组件里，然后用 form.setFieldsValue 设置的字段值就能在 Form.Item 里取到。

Form.Item 只需要在 name 里填写字段所在的路径就行，也就是 ['d', 'e'] 这个。

![](./images/96614b2fbc9a4996b8b8e1b9d2442508~tplv-k3u1fbpfcp-watermark.image.png)

有的同学可能会问了，为啥这里只设置了个 name，它下面的 Input 就有值了呢？

我们让 Form.Item 渲染一个自定义的组件试一下，比如这样：

![](./images/b4b04c53e69d4ba480646b261e331690~tplv-k3u1fbpfcp-watermark.image.png)

这时你会发现传入了 id、value、onChange 3 个参数：

![](./images/fb50d2316b05436a8ba6bdc1013f1253~tplv-k3u1fbpfcp-watermark.image.png)

这就是为啥 Input 能有值，因为传入了 value 参数。

而且变化了也能同步到 fields，因为传入了 onChange 参数。

有的时候我们要对保存的值做一些修改，就可以这样写：

```javascript
function MyInput(props) {
    const { value, onChange } = props;
    function onValueChange(event) {
      onChange(event.target.value.toUpperCase());
    }
    return <Input value={value} onChange={onValueChange}></Input>
}
```

我们调用 form.getFieldsValue 方法看看 onChange 前后的变化：

![](./images/a93b9fa826164050a6cce6df208de3ce~tplv-k3u1fbpfcp-watermark.image.png)

这时候 value 也会变，最终会改变表单的值：

![](./images/76eade52a6fe4e2788bb92e72203f573~tplv-k3u1fbpfcp-watermark.image.png)

所以说，Form.Item 会给子组件传入 value、onChange 参数用来设置值和接受值的改变，同步到 form 的 fields。

那这跟 context 有什么关系呢？

当然有呀，Form.Item 是怎么拿到 form 对象的呢？我们不是只传给了 Form 组件么，怎么会到了 Form.Item 手里的？

![](./images/36cdc345721a412794b9a1a4acd1f32e~tplv-k3u1fbpfcp-watermark.image.png)

联系下刚学的 context api，是不是就能想清楚了？

肯定是有一个传递 form 对象的 context，Form 组件往其中设置值，Item 组件从其中取值。

我们看下源码就知道了：

![](./images/403b5b1d45b7415ba3a584de63fd3240~tplv-k3u1fbpfcp-watermark.image.png)

Form 组件里用 useForm 创建了 form 对象，参数为 props 传入的 form。


然后它把这个 form 对象通过 Provider 放到了 FieldContext 里：

![](./images/abf3f9f054e4469885cc6cf38807798b~tplv-k3u1fbpfcp-watermark.image.png)

这个 FieldContext 自然是通过 createContext 的 api 创建的：

![](./images/69d0de8b16b745338b8fd63d8bb81175~tplv-k3u1fbpfcp-watermark.image.png)

fieldContext 里就有 getFieldsValue、setFieldsValue 等 form 对象的方法了。

然后就是 Form.Item 了。

其实 Form.Item 里也渲染了一系列组件，主要是处理布局，这个用 React DevTools 调试下就知道了：

![](./images/b50639a85c8d4ba5b7bd5ef87dd363ff~tplv-k3u1fbpfcp-watermark.image.png)

FormItem 加上了 Row、Col 等组件来布局，还加上了 Label 的部分，最后再渲染传入的 children。

其中有个 WrappedField 的子组件，这里面就取出了 FieldContext，作为参数传给了子组件：

![](./images/c4443a8fef104666b028077949a0e71c~tplv-k3u1fbpfcp-watermark.image.png)

而 namePath 也就是 ['d', 'e'] 的部分已经有了。

从 filedContext 里用 getFiledsValue 取出全部的 store，然后再通过 namePath 取出想要的值传给子组件，这不就完成了 Form.Item 的功能了么？

![](./images/98b3c6bc68004c00aac8dc25f905b4a1~tplv-k3u1fbpfcp-watermark.image.png)

这就是为什么 form 里设置了 fields，在 Form.Item 里就能取出值来的原因。

小结一下：antd 的 Form 通过 FieldContext 保存了 form 对象，在 FormItem 组件里取出 FieldContext，并根据 namePath 取出对应的值，传递给子组件。这就完成了 form 的 field 值的设置。

除了 FieldContext 外，还有很多别的 Context，比如 size、disabled 等都是通过 context 存储和传递的：

![](./images/afd7ac30d63a4327bcc91377ccae0699~tplv-k3u1fbpfcp-watermark.image.png)

![](./images/ecad1874f21a4f399dc15e3c97e900a2~tplv-k3u1fbpfcp-watermark.image.png)

![](./images/f78c33d3e7d9441bb8c4b17d214d9046~tplv-k3u1fbpfcp-watermark.image.png)

在 antd 组件库里，context 有大量的应用。

那么 context 是怎么实现的呢？

这个要从源码找答案了。

首先是 createContext 方法，这个方法返回的是一个对象，记住这 3 个属性就可以了：

_currentValue： 保存 context 的值的地方，不建议直接改

Provider： ContextProvider 类型的 jsx

Consumer： ContextConsumer 类型的 jsx

![](./images/debe062ed4d24520a8eff67f5afae2fa~tplv-k3u1fbpfcp-watermark.image.png)

也就是说这些 Provider、Consumer 都是单独的 jsx 类型：

![](./images/ecad1874f21a4f399dc15e3c97e900a2~tplv-k3u1fbpfcp-watermark.image.png)

react 渲染的时候会把 jsx 编译成 render function，然后执行之后就是 vdom：

![image.png](./images/c10dad7f616846deb8104be3f12533ac~tplv-k3u1fbpfcp-watermark.image.png)

vdom 是这样的结构，在 react 里也就是 ReactElement 对象：

![](./images/a2dd1cd52fd4432b91b7b6486fad65f7~tplv-k3u1fbpfcp-watermark.image.png)

Provider 就会变成这样的 vdom：

![](./images/f38ecb11787443dfaed0faf52eb36a86~tplv-k3u1fbpfcp-watermark.image.png)

然后 vdom 会经历 reconcile 过程转为 fiber 结构，转完之后一次性 commit，也就是更改 dom。

![](./images/01277bc1147145978028675e32ee8d8b~tplv-k3u1fbpfcp-watermark.image.png)

这种 Provider 类型的 vdom 自然会转为对应的 fiber 节点，在 reconcile 的时候会做单独的处理：

![](./images/cb9b4ed47d3b491b9241af9b0d1c40b8~tplv-k3u1fbpfcp-watermark.image.png)

可以看到 Provider 的处理就是修改了 context._currentValue 的值：

![](./images/0b1819bc9d944da48a96568703f6000e~tplv-k3u1fbpfcp-watermark.image.png)

也就是说其实我们可以不用 Provider，自己修改 _currentValue 也可以。

![](./images/a89206b210d0429a89182ac6ac7b37c8~tplv-k3u1fbpfcp-watermark.image.png)

只不过这种是不建议的。

总之，Provider 的原理就是修改了 context._currentValue。

然后再来看 useContext：

很容易想到，它就是读取了 context._currentValue 返回：

![](./images/1f46ec3c47b949af9a5cd96e91412484~tplv-k3u1fbpfcp-watermark.image.png)

![](./images/0aade9fb2f464dceac21e69983548a9b~tplv-k3u1fbpfcp-watermark.image.png)

Consumer 的原理自然也差不多，也是读取了 context._currentValue，然后传入组件渲染：

![](./images/fe827e606b084dc2bfa0a51e914b2885~tplv-k3u1fbpfcp-watermark.image.png)

那有的同学可能会问了，这不就是一个全局的对象么，然后 Provider 修改它的属性，Consumer 或者 useContext 读取它的属性。

这个自己封装不也行么？

还真不行。

因为 context 还有一个特别重要的特性：

比如这样的代码：

```javascript
import { createContext, useContext } from 'react';

const countContext = createContext(111);

function Aaa() {
  const count = useContext(countContext);

  return <div>
      <h1>context 的 值为：{count}</h1>
      <Bbb></Bbb>
  </div>
} 

function Bbb() {
  return <div>
      <countContext.Provider value={222}>
        <Ccc></Ccc>
      </countContext.Provider>
    </div>
}

function Ccc() {
  const count = useContext(countContext);
  return <h2>context 的 值为：{count}</h2>
}

export default Aaa;
```
也就是说在中间的组件里修改了 context 的值，那如果 context 是全局的话 Aaa、Ccc 组件的值都应该修改才对。

但实际上不是：


![image.png](./images/03910719c9484659829cdb295debb628~tplv-k3u1fbpfcp-watermark.image.png)

可以看到，只有 Ccc 拿到的 context 值被修改了，而 Aaa 拿到的 context 值没变。

这是为什么呢？

不是说都是取的 context._currentValue 这个属性么，咋还不一样了呢？

这是因为 react 对 context 还有一个处理：

![](./images/6219fb94ecfb4068bce842ec93667800~tplv-k3u1fbpfcp-watermark.image.png)

在修改 context._currentValue 之前还有一个 push。

这个就是把当前的 context 值入栈：

![](./images/7830355324fe4fd28ff9af2b3af9cd14~tplv-k3u1fbpfcp-watermark.image.png)

之后处理完这个 fiber 节点会再 pop 出栈，然后恢复 context：

![](./images/19e6132714544b909957674b6d46d2c6~tplv-k3u1fbpfcp-watermark.image.png)

这就是为什么 context 只能影响子组件，影响不了父组件。

这就是 context 的原理。

小结一下：

createCotnext 就是创建了一个 _currentValue、Provider、Consumer 的对象。

_currentValue 就是保存值的地方

Provider 是一种 jsx 类型，之后会转为对应的 fiber 类型，然后它的处理就是修改 _currentValue，也就是修改 context 值

Consumer 和 useCotnext 就是读取 _currentValue，也就是读取 context 值

唯一要注意的是 Provider 处理每个节点之前会入栈 context，处理完会出栈，这样就能保证 context 只影响子组件。

## 总结

context 是 react 的重要特性，它主要用来在任意层级组件之间传递数据。

使用方式就是用 createContext 创建 context 对象，然后用 Provider 修改值，用 useContext 和 Consumer 读取值。

context 在 antd 这种组件库里用的特别多，比如 Form 的 fields 的值的传递，form.setFeildsValue 之后 FormItem 能拿到最新值就是通过 context 取的。

context 的原理是 context 对象有 _currentValue 属性用来保存值，Provider 会修改 _currentValue，Consumer 和 useContext 会读取它。

只是 Provider 还会入栈出栈机制保证值的修改只影响子组件。

context 原理其实还挺简单的，也就是一个对象属性的修改和读取。

它在 antd 组件库里用的太多了，比如 form 的 fields 传递、config 传递等等。不知道 context 用在哪的话，不妨去看下 antd 源码里怎么用的吧。
