我们每天都在写各种组件，一般的组件不需要文档，但当你写组件库里的组件，或者项目里的一些公共组件的时候，是需要提供文档的。

这时候我们一般都会用 Storybook。

Storybook 是非常流行的用来构建组件文档的工具。

现在有 80k 的 star 了：

![](./images/06ab9985e51b47d1aeb9036cea11107e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

那 Storybook 都提供了啥功能呢？

我们试一下就知道了：

```
npx create-react-app --template typescript sb-test
```

![](./images/6f62a4d090a24e119c22bf5202dfdccf~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

用 cra 创建个 react 项目。

然后进入项目，执行 storybook 的初始化：

```
npx storybook@latest init
```
![](./images/e6098a95319644d28e159f6c19f8143f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

打印的日志告诉你 storybook init 是在你的项目里添加 storybook 的最简单方式。

它会在你的 package.json 添加一个 storybook 命令：

![](./images/af2a91325b7e4275b5323f8379b078b8~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

执行 npm run storybook，就可以看到这样文档：

```
npm run storybook
```

![](./images/1edef20173b44deab8ab28933dfd53d0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这就是 storybook 生成的组件文档。

这三个组件不是我们自己写的，是 storybook 初始化的时候自带了三个 demo 组件。

我们可以用它来了解下 storybook 的功能。

![](./images/b4ccea6e07754816aee59871946aa9fd~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

storybook init 在项目里加了 2 个目录： .storybook 和 src/stories

.storybook 下的是配置文件， src/stories 下的是展示文档用的组件。

Button.tsx 就是传入几个参数，渲染出一个 button：

![](./images/076d9d08fa6b4f25be5ddd38e8591d2f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

然后 Button.stories.tsx 里导出了几种 Button 的 props：

![](./images/1b1d8d2483d64d9ebece55b10a5cb532~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

导出的这几个 Story 类型的对象是啥呢？

是用来渲染不同 story 的：

![](./images/9bed9ff1280945c5b9e9dd9fc799b087~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

也就是 Button 组件传入不同参数的时候渲染的结果。

我们加一个 Story 试试：

![](./images/1c65585123874843abf11a5b8dd9299a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

```javascript
export const Guang: Story = {
  args: {
    label: '光光光',
    size: 'large',
    backgroundColor: 'green'
  }
}
```

页面多了一个 Button 的类型：

![](./images/8c3ddfac936b40a2828c3956aff59d8d~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

也就是说，Storybook 把同一个组件传入不同 props 的情况，叫做一个 Story。

别的地方可能叫做用例或变体，而在 Storybook 里叫做 story。

一个组件包含多个 Story，一个文档里又包含多个组件，和一本书的目录差不多。

所以把这个工具叫做 Storybook。

除了 story 外，上面还有生成的组件文档：

![](./images/ca7d1282bc6b417a858a4ee2ad89a5a9~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

可以看到，列出了每个 props 和描述。

是从注释里拿到的：

![](./images/e7160a50961a4812a54643041c6e07da~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

我们改了一下注释，刷新下，可以看到文档变了：

![](./images/991028784622424888b56b28aee2ed39~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这样就可以方便的生成组件文档了。

而且，这些参数都是可以调的：

![](./images/08a54390c10449aebcbad112725fd663~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

可以直接修改 props 看组件渲染结果，就很方便。

而且你还可以直接复制它的 jsx 代码：

![](./images/3a1cd354eeaf4b7b8bc9cc8c256b6174~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

之前我们是 args 传入参数渲染，你还可以用 render 函数的方式自己渲染：

![](./images/0755d2c1f24e4c6ba420eb7b03e96efd~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

```javascript
export const Guang: Story = {
  args: {
    label: '光光光',
    size: 'large',
    backgroundColor: 'green'
  },
  render(args) {
    return <div>
      <button>aaaa</button>
      <Button {...args}/>
      <button>bbb</button>
    </div>
  }
}
```

render 函数的参数就是 args，你可以自己返回 jsx（这时要把文件后缀名改为 tsx）。

这样，渲染内容就是自己控制的：

![](./images/cb6babdd973f484588ba6c6b1ce9b14b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

而且有的组件不只是传入 props 就可以了，还需要一些点击、输入等事件。

storybook 支持写这类脚本：

![](./images/43a45caf62da4293a28c4f7bb5eddd84~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)
```javascript
export const Guang: Story = {
  args: {
    label: '光光光',
    size: 'large',
    backgroundColor: 'green'
  },
  render(args) {
    return <div>
      <button>aaaa</button>
      <Button {...args}/>
      <button>bbb</button>
    </div>
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = await canvas.getByRole('button', {
      name: /光光光/i,
    });
    await userEvent.click(btn);

    btn.textContext = '东';
  },
}
```

比如我写了找到内容为光光光的 button，点击，然后把它的内容改为东。

组件渲染完就会自动执行 play 函数：

![](./images/baa2cb424b4f4f4f93df1c89f601050f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

当然，这个案例不大好，用表单来测试 play 功能会更好点：

![](./images/83554b55732749849d741ca0252b20c2~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

此外，你还可以在渲染组件之前请求数据，然后把数据传入 render 函数再渲染：

![](./images/3df784c1627645b6af384024b90ee7a8~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

```javascript

export const Guang: Story = {
  args: {
    label: '光光光',
    size: 'large',
    backgroundColor: 'green'
  },
  render(args, meta) {
    const list = meta.loaded.list;

    return <div>
      <div>{list.join(',')}</div>
      <Button {...args}/>
    </div>
  },
  loaders: [
    async () => {
      await '假装 fetch'
      return {
        list: [
          111,
          222,
          333
        ]
      }
    },
  ]
}
```

渲染出来是这样的：

![](./images/d086821cc0d846369e206b138364de3c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

感受到 Storybook 的强大了么？

不只是自动生成组件文档这么简单，你可以定义不同的 Story，这些 Story 可以传入不同 props、可以请求数据、可以自定义渲染内容、还可以定义自动执行的脚本。

有同学会觉得，这个自动执行的 play 函数其实和测试脚本差不多。

确实，play 函数是可以当作测试脚本来用的。

安装用到的包：

```
npm install @storybook/jest
```

使用 expect 来断言：

![](./images/98d01f9c93ca4943aa8a5a44a30bfc5e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/e57fb5a9e4454dae934d5488e46d3130~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

```javascript
await expect(btn.textContent).toEqual('光光光');

await expect(btn.style.backgroundColor).toEqual('green');
```

这样一打开组件会自动跑 play 函数，也就会自动执行断言：

![](./images/8766d0ee20e34a6e8f8c12a4e4e91bb4~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

改下 expect，断言失败就是这样：

![](./images/2f4fa32957ee4356a929b4f0b3033fbc~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/fc59a59b141a4e8ea60d3d384b4b3e26~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这样，组件有没有通过测试用例，打开一看就知道了。

就很方便。

但是，组件多了的话，这样一个个点开看也挺麻烦的，这时候就可以用 cli 跑了：

安装用到的包：
```
npm install @storybook/testing-library
```
然后：

```
npx test-storybook
```
![](./images/9d4163340d794f279b59cbf10e5996d5~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

xx.stories.tsx 文件里除了 Story 外，还会导出 meta 信息：

![](./images/45b0f117f4f94438a4bcd58318cdb7aa~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这些都很简单，改一下就知道了：

![](./images/5818c8d6b11c4b4caa18f5a59eddda4a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

title 是这个：

![](./images/69c97cc176d24dbcbae2ca6f0e5de871~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

paremeters 的 layout 是这个：

![](./images/596720cb55cd4a0cbd226f002e0ae832~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/fb11973736e746f48e275206148b6f3a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/4e703ab71fc348a59556bf9145b66715~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这里还可以配置背景色：

![](./images/18ce9e82cb9a44a194ba9289204d8ea8~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/625692a01e194763b185c080a6672d52~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

然后 argTypes 是这个：
![](./images/964bf7cec5f540f88039e39565a5142f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)


![](./images/18a42a4fe06d439bba53088130740d52~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)


![](./images/883e41493cfe4e20aac001167230aaea~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/836a379b3f8149988bc9b85b5b029f1a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

具体什么类型的参数用什么控件，可以用到的时候查一下[文档](https://storybook.js.org/docs/essentials/controls#annotation)。

![](./images/5a08f253de944627b1449f44245bcd24~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这些都是与 Story 无关的一些东西，所以放在 Meta 里。

此外，你还可以用 Storybook 写 MDX 文档。

mdx 是 markdown + jsx 的混合语法，用来写文档很不错。

在这个目录下的文档：

![](./images/d44f1722884f4f969ce5e31d0eb61d5e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

都会被放到这里：

![](./images/108bc5bdccb24f1ba6c8b7e85fc3052f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

我们加一个试试：

![](./images/37e4abb3557c45bda09c064da9057658~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/834f32d42ba04e0db1905fc60b072a5a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这样，当你想在组件文档里加一些别的说明文档，就可以这样加。

而且，组件文档的格式也是可以自定义的。

可以在 .storybook 下的 preview.tsx 里配置这个：

![](./images/c90fa993e16b4c4db139f39592155049~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/5a28273d320749289793d8f29afd500f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/05c92411d87446eb902068fa642b99b0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/9a07da9717084f19b783ee85405bc960~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

大概过了一遍 Storybook 的功能之后，我们把上节的 Calendar 组件拿过来试一下。

把那个项目的 Calendar 目录复制过来：

![](./images/6cc32b2fde854a2080da1a4d37332258~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

然后在 stories 目录下添加一个 Calendar.stories.tsx

```javascript
import type { Meta, StoryObj } from '@storybook/react';
import Calendar from '../Calendar/index';
import dayjs from 'dayjs';

const meta = {
    title: '日历组件',
    component: Calendar,
    parameters: {
        layout: 'centered'
    },
    tags: ['autodocs']
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Value: Story = {
    args: {
        value: dayjs('2023-11-08')
    },
};

export const DateRender: Story = {
    args: {
        value: dayjs('2023-11-08'),
        dateRender(currentDate) {
            return <div>
                日期{currentDate.date()}
            </div>
        }
    },
};

export const DateInnerContent: Story = {
    args: {
        value: dayjs('2023-11-08'),
        dateInnerContent(currentDate) {
            return <div>
                日期{currentDate.date()}
            </div>
        }
    },
};

export const Locale: Story = {
    args: {
        value: dayjs('2023-11-08'),
        locale: 'en-US'
    },
};

```
我们添加了 4 个 story。

安装用到的 dayjs、classnames 和 node-sass

```
npm install --save classnames

npm install --save dayjs

npm install --save-dev node-sass
```
然后把 storybook 文档服务跑起来：

```
npm run storybook
```
![](./images/d7a48537021a4eae8876da2e9dab240b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/86c9436a6b4246bc9d754bc83c194def~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/559a457f5fdc48a3b7882d5696900afb~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/b63bca47248f4891a284957eae175210~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

都没啥问题。

不过 value 的控件类型不对：

![](./images/e03b3963b26948459be0e1d050a125cf~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

但是现在我们要传入的是 dayjs 对象，就算是用了 date 的控件也不行。

先改成 date 类型试试：

![](./images/251ca2c18abf41828cd0f893025237cf~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

控件确实对了，但是修改日期点击刷新后，会报错：

![](./images/55f93770f1ee4063b2188574f596e780~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

因为控件传入的是一个 date 的毫秒值。

那怎么办呢？

这时候就要把 story 改成 render 的方式了：

![](./images/3f4dafd6798840a7a69f0775d4b26fda~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

```javascript

const renderCalendar = (args: CalendarProps) => {
    if(typeof args.value === 'number') {
        return <Calendar {...args} value={dayjs(new Date(args.value))}/>
    }

    return <Calendar {...args}/>
}

export const Value: Story = {
    args: {
        value: dayjs('2023-11-08')
    },
    render: renderCalendar
};

```

再试试：

![](./images/e8bed02108ac47c18b881c42ec6995ca~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

现在就可以了。

我们基本每个项目都集成了 storybook：

![](./images/3ba948db71dd46eaa11765247be80090~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

跑起来是这样的：

![](./images/e547f78b5c214dca9fb3e8a2197e8151~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/76154b48df684827871da960b069130a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这些全是业务组件，可以看到业务组件不同参数时的展示和交互。

想想你维护一个业务项目，可以直接看到之前封装过哪些组件，是不是可以直接用。

就很方便，可以说是 react 项目必备。

案例代码上传了[小册仓库](https://github.com/QuarkGluonPlasma/react-course-code/tree/main/sb-test)。

## 总结

写组件文档，我们一般都是用 Storybook。

它把不同 props 的渲染结果叫做一个 story，一个组件有多个 story。

story 可以通过 args 指定传入组件的参数，通过 loaders 请求数据，通过 render 函数自定义渲染内容、通过 play 指定自动执行的脚本等。

而且还可以渲染完组件直接跑测试用例，就很方便。

storybook 还会自动生成组件文档，而且也可以把项目里的 mdx 文件加到文档里。

用起来也很简单，首先 npx storybook init 初始化，之后执行 npm run storybook 就可以了。

总之，用 storybook 可以轻松的创建组件文档，可以写多个 story，直观的看到组件不同场景下的渲染结果，还可以用来做测试。

如果想给你的组件加上文档，storybook 基本是最好的选择。
