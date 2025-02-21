# 第10章—快速掌握Storybook

﻿我们每天都在写各种组件，一般的组件不需要文档，但当你写组件库里的组件，或者项目里的一些公共组件的时候，是需要提供文档的。

这时候我们一般都会用 Storybook。

Storybook 是非常流行的用来构建组件文档的工具。

现在有 80k 的 star 了：

![](./images/3b7b345cbbbea2638f9be0ac0675c196.png )

那 Storybook 都提供了啥功能呢？

我们试一下就知道了：

```
npx create-react-app --template typescript sb-test
```

![](./images/5a9c057ec4c7b277cd0b5ffc751154ab.png )

用 cra 创建个 react 项目。

然后进入项目，执行 storybook 的初始化：

```
npx storybook@latest init
```
![](./images/a33e3848111fda7dc624d678aed67bcf.png )

打印的日志告诉你 storybook init 是在你的项目里添加 storybook 的最简单方式。

它会在你的 package.json 添加一个 storybook 命令：

![](./images/4cb050447a0ae887217569d5f1c61530.png )

执行 npm run storybook，就可以看到这样文档：

```
npm run storybook
```

![](./images/a96bef330f6233a5fc9e86053fb1c7e4.png )

这就是 storybook 生成的组件文档。

这三个组件不是我们自己写的，是 storybook 初始化的时候自带了三个 demo 组件。

我们可以用它来了解下 storybook 的功能。

![](./images/d90365d1a9b30fb810f0cef8d9ee2017.png )

storybook init 在项目里加了 2 个目录： .storybook 和 src/stories

.storybook 下的是配置文件， src/stories 下的是展示文档用的组件。

Button.tsx 就是传入几个参数，渲染出一个 button：

![](./images/9b49a9d95f5c8c5c4b08b7aa4f3386fa.png )

然后 Button.stories.tsx 里导出了几种 Button 的 props：

![](./images/d66cfadaef02d838f1ac72046500302e.png )

导出的这几个 Story 类型的对象是啥呢？

是用来渲染不同 story 的：

![](./images/32fbb62cdf35b0931ea6e29da05060e5.gif )

也就是 Button 组件传入不同参数的时候渲染的结果。

我们加一个 Story 试试：

![](./images/f6b778545c87b5fb3ec9d4a856089265.png )

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

![](./images/989caeccf45fdcd006bc091da78bdaa5.png )

也就是说，Storybook 把同一个组件传入不同 props 的情况，叫做一个 Story。

别的地方可能叫做用例或变体，而在 Storybook 里叫做 story。

一个组件包含多个 Story，一个文档里又包含多个组件，和一本书的目录差不多。

所以把这个工具叫做 Storybook。

除了 story 外，上面还有生成的组件文档：

![](./images/0b59ffa91d75c82f90095ccfb50cd393.png )

可以看到，列出了每个 props 和描述。

是从注释里拿到的：

![](./images/0e55c0b9815c7523b143a32056a60650.png )

我们改了一下注释，刷新下，可以看到文档变了：

![](./images/d264cdc275cb58bcec487d039406cb65.png )

这样就可以方便的生成组件文档了。

而且，这些参数都是可以调的：

![](./images/110cf393dc13b177a388b3401a430107.gif )

可以直接修改 props 看组件渲染结果，就很方便。

而且你还可以直接复制它的 jsx 代码：

![](./images/6efdf60c7599fccd7d5691dcf815ff16.png )

之前我们是 args 传入参数渲染，你还可以用 render 函数的方式自己渲染：

![](./images/e19a0c7e29fefb30ec3df5cd00937e81.png )

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

![](./images/7d483e6273ff5ce115648bd7cc7dfdca.png )

而且有的组件不只是传入 props 就可以了，还需要一些点击、输入等事件。

storybook 支持写这类脚本：

![](./images/3004fd257f87e282332b9e298d687e09.png )
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

![](./images/317103bba0483de516a589fcfb9a5234.gif )

当然，这个案例不大好，用表单来测试 play 功能会更好点：

![](./images/13f0535dd1ae5b59d49799dbecf284d0.gif )

此外，你还可以在渲染组件之前请求数据，然后把数据传入 render 函数再渲染：

![](./images/8f73f645f54869d4352d5532f402c108.png )

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

![](./images/6fce44e19543859801caa8ec441dfe2b.png )

感受到 Storybook 的强大了么？

不只是自动生成组件文档这么简单，你可以定义不同的 Story，这些 Story 可以传入不同 props、可以请求数据、可以自定义渲染内容、还可以定义自动执行的脚本。

有同学会觉得，这个自动执行的 play 函数其实和测试脚本差不多。

确实，play 函数是可以当作测试脚本来用的。

安装用到的包：

```
npm install @storybook/jest
```

使用 expect 来断言：

![](./images/05e7d335975c5e0e9a65e1c0973f8d58.png )

![](./images/cc1485aa049aa62f0871d47442ea6b1a.png )

```javascript
await expect(btn.textContent).toEqual('光光光');

await expect(btn.style.backgroundColor).toEqual('green');
```

这样一打开组件会自动跑 play 函数，也就会自动执行断言：

![](./images/90e4216d53205c23964758cc22600ff8.png )

改下 expect，断言失败就是这样：

![](./images/b6678e2ce23c2f81ab021b4f30f38100.png )

![](./images/63dadae9b9b39c8bd4198beb78ea0906.png )

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
![](./images/9cb7ecc8fccf2c7a337d98bf18fb2e83.png )

xx.stories.tsx 文件里除了 Story 外，还会导出 meta 信息：

![](./images/16268e57345d8b2bd16b9534d27421da.png )

这些都很简单，改一下就知道了：

![](./images/08c7af9d540f87414e970ccc47df0d44.png )

title 是这个：

![](./images/8bf90de6d44f175719da22362971080c.png )

paremeters 的 layout 是这个：

![](./images/3ae42143c55982f3816011839b5a7de9.png )

![](./images/16a60ed9f59cf50a6fc17cb9cc7c4498.png )

![](./images/077a55fc6708c60965097031e0d0a3c8.png )

这里还可以配置背景色：

![](./images/0a44fd59e0fada3f63b4dbf924c92df3.png )

![](./images/04c2c7c87fef864879949fb1dd689b7c.gif )

然后 argTypes 是这个：
![](./images/62d8c3e3dd6ad61ffe99c3cc22b366e4.png )


![](./images/3cc67f9859ea277678ee3802950861ca.png )


![](./images/09a634997b6f38cc768a1a1fff7fe99e.png )

![](./images/5c33705fc1245bac5f020a60985c0547.png )

具体什么类型的参数用什么控件，可以用到的时候查一下[文档](https://storybook.js.org/docs/essentials/controls#annotation)。

![](./images/23908317498e7e1951eb9a10205c44fd.png )

这些都是与 Story 无关的一些东西，所以放在 Meta 里。

此外，你还可以用 Storybook 写 MDX 文档。

mdx 是 markdown + jsx 的混合语法，用来写文档很不错。

在这个目录下的文档：

![](./images/b89f9be35c10fde1dfcb6eaa4100914a.png )

都会被放到这里：

![](./images/7091eb484bd3e45777c49aa7f56ba975.png )

我们加一个试试：

![](./images/9d3663f9f4a4a6e359027d294c65003a.png )

![](./images/d030fec3e16a43d43bacc1fbd40c1038.png )

这样，当你想在组件文档里加一些别的说明文档，就可以这样加。

而且，组件文档的格式也是可以自定义的。

可以在 .storybook 下的 preview.tsx 里配置这个：

![](./images/e038983cd9c0a0e3deb46888fb519ebb.png )

![](./images/fec240e2062180f31273cde870a7718d.png )

![](./images/b34b46ea4ce7c22d7ffaaf83eb3bc3d9.png )

![](./images/98d7ce97c84cae40bd955bc72847862c.png )

大概过了一遍 Storybook 的功能之后，我们把上节的 Calendar 组件拿过来试一下。

把那个项目的 Calendar 目录复制过来：

![](./images/e2ff2b19670fd9d5461b17f0e45b4825.png )

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
![](./images/3f02ac06fa9b0cead4262a4f340d73ba.png )

![](./images/3e9db5120230963906a9f70bd173ca79.png )

![](./images/426c83fe4eb2b9f92e10a5420286c59c.png )

![](./images/5f04e883694f29b3cd0a1560524332ef.png )

都没啥问题。

不过 value 的控件类型不对：

![](./images/e6350c474bff798a6859ef42edb545fb.png )

但是现在我们要传入的是 dayjs 对象，就算是用了 date 的控件也不行。

先改成 date 类型试试：

![](./images/da40cd2432f0c793dd1201bef24fe4bd.png )

控件确实对了，但是修改日期点击刷新后，会报错：

![](./images/d1e6a1a2b277e928f9ab579f99f14239.gif )

因为控件传入的是一个 date 的毫秒值。

那怎么办呢？

这时候就要把 story 改成 render 的方式了：

![](./images/a8965106c3eed8c424f05847020a1864.png )

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

![](./images/d29f3730dad5cb697fea7f20c4e01ce3.gif )

现在就可以了。

我们基本每个项目都集成了 storybook：

![](./images/648bf273507e5b7dda2ecc38b3d2f216.png )

跑起来是这样的：

![](./images/0141556a9f0908c93ed3a072c02814b7.gif )

![](./images/ad1923ff1f7daeaca41727e1f8c966f7.gif )

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
