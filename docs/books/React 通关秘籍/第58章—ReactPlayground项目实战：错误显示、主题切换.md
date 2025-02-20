这节我们继续完善 playground 的功能。

首先，我们预览出错时，iframe 会白屏，并不会显示错误。

比如当依赖的模块找不到的时候：

![](./images/6ab6832fedd1440f901da5b3e4bd49f5~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这时候在 devtools 可以看到错误信息：

![](./images/4d75693698e145e5a7e7869bef1ada18~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

但总不能让开发者自己打开 devtools 看，我们要在页面做一下错误的显示。

新增 components/Message/index.tsx 组件

```javascript
import classnames from 'classnames'
import React, { useEffect, useState } from 'react'

import styles from './index.module.scss'

export interface MessageProps {
    type: 'error' | 'warn'
    content: string
}

export const Message: React.FC<MessageProps> = (props) => {
  const { type, content } = props
  const [visible, setVisible] = useState(false)

  useEffect(() => {
      setVisible(!!content)
  }, [content])

  return visible ? (
    <div className={classnames(styles.msg, styles[type])}>
      <pre dangerouslySetInnerHTML={{ __html: content }}></pre>
      <button className={styles.dismiss} onClick={() => setVisible(false)}>
        ✕
      </button>
    </div>
  ) : null
}
```
传入两个参数，type 是 error 还是 warn，还有错误内容 content。

这里 cotent 要作为 html 的方式设置到 pre 标签的标签体。

React 里设置 html 要用 dangerouslySetInnerHTML={{\_html: 'xxx'}} 的方式。

用 visible 的 state 控制显示隐藏，当传入内容的时候，设置 visible 为 true。

写下样式：

index.module.scss
```scss
.msg {
    position: absolute;
    right: 8px;
    bottom: 0;
    left: 8px;
    z-index: 10;

    display: flex;
    max-height: calc(100% - 300px);
    min-height: 40px;
    margin-bottom: 8px;
    color: var(--color);

    background-color: var(--bg-color);
    border: 2px solid #fff;
    border-radius: 6px;

    border-color: var(--color);
  
    &.error {
      --color: #f56c6c;
      --bg-color: #fef0f0;
    }
  
    &.warn {
      --color: #e6a23c;
      --bg-color: #fdf6ec;
    }
}
  
pre {
    padding: 12px 20px;
    margin: 0;
    overflow: auto;
    white-space: break-spaces;
}
  
.dismiss {
    position: absolute;
    top: 2px;
    right: 2px;

    display: block;
    width: 18px;
    height: 18px;
    padding: 0;

    font-size: 9px;
    line-height: 18px;
    color: var(--bg-color);

    text-align: center;
    cursor: pointer;
    background-color: var(--color);
    border: none;
    border-radius: 9px;
}
```
.msg 绝对定位在底部，设置下宽高。

.dismss 绝对定位在 .msg 的右上角。

注意，.error 和 .warn 的时候 color 和 background-color 都不同，我们声明了两个 css 变量。

css 变量可以在它元素和子元素 css 里生效，所以切换了 .error 和 .warn 就切换了整体的颜色：

![](./images/734c14cdfe254ae6ae793242269d13d2~tplv-k3u1fbpfcp-watermark.image.png)

在 Preview 组件引入下试试：

![](./images/07c610ceb0394f3981b3e363fdab51d0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

```javascript
<Message type='warn' content={new Error().stack!.toString()} />
```
看下效果：

![](./images/4e7b981f88c1410ea338c0c5417c2fef~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

把 type 换成 error，再缩小下窗口试试：

![](./images/ddab8bd9d9c94d8993008b7ff3648bc8~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

没啥问题。

那展示的错误内容从哪里来呢？

从 iframe 里传出来。

![](./images/b93c9cceefae47ae9fac9376f6e1240a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

```html
<script>
    window.addEventListener('error', (e) => {
        window.parent.postMessage({type: 'ERROR', message: e.message})
    })
</script>
```
通过 postMessage 传递消息给父窗口。

然后在 Preview 组件里监听下：

![](./images/e049c1659afd41d190706a8e7e27a121~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

```javascript
import { useContext, useEffect, useState } from "react"
import { PlaygroundContext } from "../../PlaygroundContext"
import Editor from "../CodeEditor/Editor";
import { compile } from "./compiler";
import iframeRaw from './iframe.html?raw'
import { IMPORT_MAP_FILE_NAME } from "../../files";
import { Message } from "../Message";

interface MessageData {
    data: {
      type: string
      message: string
    }
}

export default function Preview() {

    const { files} = useContext(PlaygroundContext)
    const [compiledCode, setCompiledCode] = useState('')

    useEffect(() => {
        const res = compile(files);
        setCompiledCode(res);
    }, [files]);

    const getIframeUrl = () => {
        const res = iframeRaw.replace(
            '<script type="importmap"></script>', 
            `<script type="importmap">${
                files[IMPORT_MAP_FILE_NAME].value
            }</script>`
        ).replace(
            '<script type="module" id="appSrc"></script>',
            `<script type="module" id="appSrc">${compiledCode}</script>`,
        )
        return URL.createObjectURL(new Blob([res], { type: 'text/html' }))
    }

    useEffect(() => {
        setIframeUrl(getIframeUrl())
    }, [files[IMPORT_MAP_FILE_NAME].value, compiledCode]);

    const [iframeUrl, setIframeUrl] = useState(getIframeUrl());

    const [error, setError] = useState('')

    const handleMessage = (msg: MessageData) => {
        const { type, message } = msg.data
        if (type === 'ERROR') {
          setError(message)
        }
    }

    useEffect(() => {
        window.addEventListener('message', handleMessage)
        return () => {
          window.removeEventListener('message', handleMessage)
        }
    }, [])

    return <div style={{height: '100%'}}>
        <iframe
            src={iframeUrl}
            style={{
                width: '100%',
                height: '100%',
                padding: 0,
                border: 'none',
            }}
        />
        <Message type='error' content={error} />

        {/* <Editor file={{
            name: 'dist.js',
            value: compiledCode,
            language: 'javascript'
        }}/> */}
    </div>
}
```
试下效果：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3ec3d96e05824decb38ee0294c0572c8~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2450&h=1154&s=236107&e=gif&f=29&b=fefefe)

错误展示出来了，这就是控制台那个报错：

![](./images/9b4a6b84036649cbb4880501c95a7d30~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这里暂时用不到 warn，后面用到 warn 再切换 type。

然后再来做下主题切换：

![](./images/8a9fda9901ce473d9c02c581fa48d981~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这个同样要在 context 里保存配置：

![](./images/e2448cee65d24f649004ae799c83c271~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

然后加一个 theme 对应的 className：

![](./images/7b31e9668fb94eceae3781221cda1f1b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

写下用到的样式：

```css
.light {
    --text: #444;
    --bg: #fff;
}
  
.dark {
    --text: #fff;
    --bg: #1a1a1a;
} 
```

还记得前面讲过 css 变量的生效范围么？

在元素和它的所有子元素里生效。

所以只要把之前 css 的样式值改成这些变量就可以了。

比如我们在 Header 组件里用下：

![](./images/0802b2e5728a45df9c5eea7c4d08cc6e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

然后把 theme 初始值改为 dark

![](./images/c1e570e5857e4bd9ba15d3fd648da2d8~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这时候 Header 就切换为暗色主题了：

![](./images/2376d05d911941fbb2380c74f90592f4~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

改为 light 就会变回来：

![](./images/2a71c86027fb4b53a06888bc5d4414a1~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这就是主题切换的原理：

声明一些全局的 css 变量，写样式的时候用这些变量。切换主题时切换不同的全局变量值即可。

切成暗色主题后可以看到周边有点间距，加下重置样式：

![](./images/9183eff95592443392bc223982b5386f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

然后我们在 Header 加一个切换主题的按钮：

![](./images/85915f807cb147c0aba43b94e562b44b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

```javascript
import styles from './index.module.scss'

import logoSvg from './icons/logo.svg';
import { useContext } from 'react';
import { PlaygroundContext } from '../../PlaygroundContext';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';

export default function Header() {
  const { theme, setTheme} = useContext(PlaygroundContext)

  return (
    <div className={styles.header}>
      <div className={styles.logo}>
        <img alt='logo' src={logoSvg}/>
        <span>React Playground</span>
      </div>
      <div className={styles.links}>
        {theme === 'light' && (
          <MoonOutlined
            title='切换暗色主题'
            className={styles.theme}
            onClick={() => setTheme('dark')}
          />
        )}
        {theme === 'dark' && (
          <SunOutlined
            title='切换亮色主题'
            className={styles.theme}
            onClick={() => setTheme('light')}
          />
        )}
      </div>
    </div>
  )
}
```
安装用到的 icon 包：

```javascript
npm install @ant-design/icons --save
```

试下效果：

![](./images/592466e1bfb14fc8af2ef3f58ed1211d~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

确实能切换了，不过我们要完善下暗色主题的样式。

![](./images/88fb6728d4994ccbb4f72373ce6ce5eb~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/af8def13fdb34f6eb267257f94dfbff3~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

其余地方也是同理。

再改下 FileNameList 的样式：

![](./images/373dc31f8b724d43bcaa16aa60e915be~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/268be8a6c2fa437292f69699d1b32523~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

编辑器同样也可以切换主题，这个是 monaco editor 自带的。

![](./images/d39ecf206f5f40ecac063fbdd7b0982d~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/1ad369f4498e4a8ca831b3ee887d70d0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这样，主题切换功能就完成了。

案例代码上传了[小册仓库](https://github.com/QuarkGluonPlasma/react-course-code/tree/main/react-playground-project)，可以切换到这个 commit 查看：

```
git reset --hard 4a77f1bf3dc8be9e270cc346145fde6a6a896b89
```

## 总结

这节我们实现了错误显示和主题切换功能。

我们创建了 Message 组件来显示错误，iframe 里监听 error 事件，发生错误的时候通过 postMessage 传递给父窗口。

父窗口里监听 message 事件传过来的错误，用 Message 组件显示。

主题切换就是在根元素加一个 .light、.dark 的 className，里面声明 css 变量，因为 css 变量可以在子元素里生效，子元素写样式基于这些变量，那切换了 className 也就切换了这些变量的值，从而实现主题切换。

实现这两个功能后，我们的 playground 就更完善了。
