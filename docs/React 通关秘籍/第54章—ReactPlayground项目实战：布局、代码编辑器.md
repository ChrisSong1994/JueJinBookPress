# 第54章—ReactPlayground项目实战：布局、代码编辑器

﻿上节分析了下思路，这节开始开发。

我们先写编辑器部分。

布局和 [vue playground](https://play.vuejs.org/#eNp9kUFLwzAUx7/KM5cqzBXR0+gGKgP1oKKCl1xG99ZlpklIXuag9Lv7krK5w9it7//7v/SXthP3zo23EcVEVKH2yhEEpOhm0qjWWU/QgccV9LDytoWCq4U00tTWBII2NDBN/LJ4Qq0tfFuvlxfFlTRVORzHB/FA2Dq9IOQJoFrfzLouL/d9VfKUU2VcJNhet3aJeioFcymgZFiVR/tiJCjw61eqGW+CNWzepX0pats6pdG/OVKsJ8UEMklswXa/LzkjH3G0z+s11j8n8k3YpUyKd48B/RalODBa+AZpwPPPV9zx8wGyfdTcPgM/MFgdk+NQe4hmydpHvWz7nL+/Ms1XmO8ITdhfKommZp/7UvA/eTxz9X/d2/Fd3pOmF/0fEx+nNQ==) 一样：

![](./images/43b211342672817947efd05513e5be6e.webp )

左边 Editor 右边 Preview，上面还有 Header。

创建个项目：

```
npx create-vite
```
![](./images/915a90986255e0b3e9570802857fe27b.webp )

改下 main.tsx：

```javascript
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
```

新建 ReactPlayground/index.tsx

```javascript
export default function ReactPlayground() {
    return <div>ReactPlayground</div>
}
```

在 App.tsx 引入下：

```javascript
import ReactPlayground from './ReactPlayground';

function App() {

  return (
    <ReactPlayground/>
  )
}

export default App

```
跑起来：

```
npm install

npm run dev
```

![](./images/a378ba25f68710fbfbfb664c38415106.webp )

然后来写布局。

[vue playground](https://play.vuejs.org/#eNp9kUFLwzAUx7/KM5cqzBXR0+gGKgP1oKKCl1xG99ZlpklIXuag9Lv7krK5w9it7//7v/SXthP3zo23EcVEVKH2yhEEpOhm0qjWWU/QgccV9LDytoWCq4U00tTWBII2NDBN/LJ4Qq0tfFuvlxfFlTRVORzHB/FA2Dq9IOQJoFrfzLouL/d9VfKUU2VcJNhet3aJeioFcymgZFiVR/tiJCjw61eqGW+CNWzepX0pats6pdG/OVKsJ8UEMklswXa/LzkjH3G0z+s11j8n8k3YpUyKd48B/RalODBa+AZpwPPPV9zx8wGyfdTcPgM/MFgdk+NQe4hmydpHvWz7nL+/Ms1XmO8ITdhfKommZp/7UvA/eTxz9X/d2/Fd3pOmF/0fEx+nNQ==) 这个布局是可以拖拽改变 editor 和 preview 部分的宽度的：

![](./images/408e2ce2f0a0a80f8a699884c9f74aaf.gif )

怎么实现呢？

原理就是 position 设置 absolute，然后拖动改变 width：

![](./images/80e985ed2f334214443e1dbbef960802.gif )

但是不用自己写，有三方组件可以用。

[allotment](https://www.npmjs.com/package/allotment) 这个组件：

![](./images/a1a1f45d769e5f3ab74659a33bbdbe01.gif )

我们用一下：

```
npm install --save allotment
```

改下 ReactPlayground：

```javascript
import { Allotment } from "allotment";
import 'allotment/dist/style.css';

export default function ReactPlayground() {
    return <div style={{height: '100vh'}}>
        <Allotment defaultSizes={[100, 100]}>
            <Allotment.Pane minSize={500}>
                <div>
                    111
                </div>
            </Allotment.Pane>
            <Allotment.Pane minSize={0}>
                <div>
                    222
                </div>
            </Allotment.Pane>
        </Allotment>
    </div>
}
```
引入 Allotment 组件和样式。

defaultSizes 指定 100、100 也就是按照 1:1 的比例展示。

minSize 是最小宽度。

测试下：

![](./images/d9d5ac3d1a683e48d2390ac1829232c9.gif )

可以看到，最开始是 1:1，可以拖动改变大小。

但是左边最小是 500px。

然后我们补上 Header、CodeEditor、Preview 这三个组件：

![](./images/d484fb781448fa56c5364cbb2e94ec82.webp )

```javascript
import { Allotment } from "allotment";
import 'allotment/dist/style.css';
import Header from "./components/Header";
import CodeEditor from "./components/CodeEditor";
import Preview from "./components/Preview";

export default function ReactPlayground() {
    return <div style={{height: '100vh'}}>
        <Header/>
        <Allotment defaultSizes={[100, 100]}>
            <Allotment.Pane minSize={0}>
                <CodeEditor />
            </Allotment.Pane>
            <Allotment.Pane minSize={0}>
                <Preview />
            </Allotment.Pane>
        </Allotment>
    </div>
}
```
新建 ReactPlayground/components/CodeEditor/index.tsx

```javascript
export default function CodeEditor() {
    return <div>CodeEditor</div>
}
```
ReactPlayground/components/Header/index.tsx
```javascript
export default function Header() {
    return <div style={{borderBottom: '1px solid #000'}}>Header</div>
}
```
ReactPlayground/components/Preview/index.tsx

```javascript
export default function Preview() {
    return <div>Preview</div>
}
```
现在是这样的：

![](./images/5ebb6a31075f99faefc3b4d93c394cbc.gif )

这里没有靠边，我们在 App.scss 里重置下样式就好了：

```css
* {
  margin: 0;
  padding: 0;
}
```
安装下 sass：

```
npm install -D sass
```

在 App.tsx 引入下：

![](./images/23b8993986fe865b8c7ba94a1632814b.webp )

先来写写 Header 部分：

```javascript
import logoSvg from './icons/logo.svg';

export default function Header() {
  return (
    <div>
      <div>
        <img alt='logo' src={logoSvg}/>
        <span>React Playground</span>
      </div>
    </div>
  )
}
```
vite 内部做了处理，引入 .svg 会返回它的路径。

加一下 icons/logo.svg

```html
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--logos" width="35.93" height="32" preserveAspectRatio="xMidYMid meet" viewBox="0 0 256 228"><path fill="#00D8FF" d="M210.483 73.824a171.49 171.49 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621c6.238-30.281 2.16-54.676-11.769-62.708c-13.355-7.7-35.196.329-57.254 19.526a171.23 171.23 0 0 0-6.375 5.848a155.866 155.866 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233C50.33 10.957 46.379 33.89 51.995 62.588a170.974 170.974 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a145.52 145.52 0 0 0 6.921 2.165a167.467 167.467 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266c13.744 7.926 36.812-.22 59.273-19.855a145.567 145.567 0 0 0 5.342-4.923a168.064 168.064 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586c13.731-7.949 18.194-32.003 12.4-61.268a145.016 145.016 0 0 0-1.535-6.842c1.62-.48 3.21-.974 4.76-1.488c29.348-9.723 48.443-25.443 48.443-41.52c0-15.417-17.868-30.326-45.517-39.844Zm-6.365 70.984c-1.4.463-2.836.91-4.3 1.345c-3.24-10.257-7.612-21.163-12.963-32.432c5.106-11 9.31-21.767 12.459-31.957c2.619.758 5.16 1.557 7.61 2.4c23.69 8.156 38.14 20.213 38.14 29.504c0 9.896-15.606 22.743-40.946 31.14Zm-10.514 20.834c2.562 12.94 2.927 24.64 1.23 33.787c-1.524 8.219-4.59 13.698-8.382 15.893c-8.067 4.67-25.32-1.4-43.927-17.412a156.726 156.726 0 0 1-6.437-5.87c7.214-7.889 14.423-17.06 21.459-27.246c12.376-1.098 24.068-2.894 34.671-5.345a134.17 134.17 0 0 1 1.386 6.193ZM87.276 214.515c-7.882 2.783-14.16 2.863-17.955.675c-8.075-4.657-11.432-22.636-6.853-46.752a156.923 156.923 0 0 1 1.869-8.499c10.486 2.32 22.093 3.988 34.498 4.994c7.084 9.967 14.501 19.128 21.976 27.15a134.668 134.668 0 0 1-4.877 4.492c-9.933 8.682-19.886 14.842-28.658 17.94ZM50.35 144.747c-12.483-4.267-22.792-9.812-29.858-15.863c-6.35-5.437-9.555-10.836-9.555-15.216c0-9.322 13.897-21.212 37.076-29.293c2.813-.98 5.757-1.905 8.812-2.773c3.204 10.42 7.406 21.315 12.477 32.332c-5.137 11.18-9.399 22.249-12.634 32.792a134.718 134.718 0 0 1-6.318-1.979Zm12.378-84.26c-4.811-24.587-1.616-43.134 6.425-47.789c8.564-4.958 27.502 2.111 47.463 19.835a144.318 144.318 0 0 1 3.841 3.545c-7.438 7.987-14.787 17.08-21.808 26.988c-12.04 1.116-23.565 2.908-34.161 5.309a160.342 160.342 0 0 1-1.76-7.887Zm110.427 27.268a347.8 347.8 0 0 0-7.785-12.803c8.168 1.033 15.994 2.404 23.343 4.08c-2.206 7.072-4.956 14.465-8.193 22.045a381.151 381.151 0 0 0-7.365-13.322Zm-45.032-43.861c5.044 5.465 10.096 11.566 15.065 18.186a322.04 322.04 0 0 0-30.257-.006c4.974-6.559 10.069-12.652 15.192-18.18ZM82.802 87.83a323.167 323.167 0 0 0-7.227 13.238c-3.184-7.553-5.909-14.98-8.134-22.152c7.304-1.634 15.093-2.97 23.209-3.984a321.524 321.524 0 0 0-7.848 12.897Zm8.081 65.352c-8.385-.936-16.291-2.203-23.593-3.793c2.26-7.3 5.045-14.885 8.298-22.6a321.187 321.187 0 0 0 7.257 13.246c2.594 4.48 5.28 8.868 8.038 13.147Zm37.542 31.03c-5.184-5.592-10.354-11.779-15.403-18.433c4.902.192 9.899.29 14.978.29c5.218 0 10.376-.117 15.453-.343c-4.985 6.774-10.018 12.97-15.028 18.486Zm52.198-57.817c3.422 7.8 6.306 15.345 8.596 22.52c-7.422 1.694-15.436 3.058-23.88 4.071a382.417 382.417 0 0 0 7.859-13.026a347.403 347.403 0 0 0 7.425-13.565Zm-16.898 8.101a358.557 358.557 0 0 1-12.281 19.815a329.4 329.4 0 0 1-23.444.823c-7.967 0-15.716-.248-23.178-.732a310.202 310.202 0 0 1-12.513-19.846h.001a307.41 307.41 0 0 1-10.923-20.627a310.278 310.278 0 0 1 10.89-20.637l-.001.001a307.318 307.318 0 0 1 12.413-19.761c7.613-.576 15.42-.876 23.31-.876H128c7.926 0 15.743.303 23.354.883a329.357 329.357 0 0 1 12.335 19.695a358.489 358.489 0 0 1 11.036 20.54a329.472 329.472 0 0 1-11 20.722Zm22.56-122.124c8.572 4.944 11.906 24.881 6.52 51.026c-.344 1.668-.73 3.367-1.15 5.09c-10.622-2.452-22.155-4.275-34.23-5.408c-7.034-10.017-14.323-19.124-21.64-27.008a160.789 160.789 0 0 1 5.888-5.4c18.9-16.447 36.564-22.941 44.612-18.3ZM128 90.808c12.625 0 22.86 10.235 22.86 22.86s-10.235 22.86-22.86 22.86s-22.86-10.235-22.86-22.86s10.235-22.86 22.86-22.86Z"></path></svg>
```

写下样式 index.module.scss

```scss
.header {
    height: 50px;
    padding: 0 20px;
    box-sizing: border-box;
    border-bottom: 1px solid #000;
  
    display: flex;
    align-items: center;
    justify-content: space-between;

    .logo {
      display: flex;
      font-size: 20px;
      align-items: center;
  
      img {
        height: 24px;
        margin-right: 10px;
      }
    }
}
```
然后在 Header 组件里引入，用 css modules 的方式：

```javascript
import styles from './index.module.scss'

import logoSvg from './icons/logo.svg';

export default function Header() {
  return (
    <div className={styles.header}>
      <div className={styles.logo}>
        <img alt='logo' src={logoSvg}/>
        <span>React Playground</span>
      </div>
    </div>
  )
}
```
看下效果：

![](./images/b5bd4484a43d65b9678b2aabeb03a9b2.webp )

没啥问题。

接下来写 CodeEditor 部分：

```javascript
import Editor from "./Editor";
import FileNameList from "./FileNameList";

export default function CodeEditor() {

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <FileNameList/>
        <Editor/>
    </div>
  )
}
```
设置高度 100%，然后 flex 布局，方向为 column。

这部分可以细分为 FileNameList 和 Editor 两个组件：

![](./images/e8ba7c80dcdb3b0ea07aad09fb746dce.webp )

创建 ./Editor/index.tsx

```javascript
export default function Editor() {
    return <div>editor</div>
}
```
./FileNameList/index.tsx
```javascript
export default function FileNameList() {
    return <div>FileNameList</div>
}
```

然后先写 Editor 组件：

引入 monaco editor：

```
npm install --save @monaco-editor/react
```

调用下：
```javascript
import MonacoEditor from '@monaco-editor/react'

export default function Editor() {

    const code = `export default function App() {
    return <div>xxx</div>
}
    `;

    return <MonacoEditor
        height='100%'
        path={'guang.tsx'}
        language={"typescript"}
        value={code}
    />
}
```
看下效果：

![](./images/e2150c33c43ecb1a2c9728c4920447e4.webp )

代码渲染没问题，但是提示 jsx 不知道怎么处理。

这是 tsconfig.json 配置的问题。

那咋改编辑器的 tsconfig 呢？

这样：

```javascript
import MonacoEditor, { OnMount } from '@monaco-editor/react'

export default function Editor() {


    const code = `export default function App() {
    return <div>xxx</div>
}
    `;

    const handleEditorMount: OnMount = (editor, monaco) => {
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            jsx: monaco.languages.typescript.JsxEmit.Preserve,
            esModuleInterop: true,
        })
    }

    return <MonacoEditor
        height='100%'
        path={'guang.tsx'}
        language={"typescript"}
        onMount={handleEditorMount}
        value={code}
    />
}
```

onMount 也就是编辑器加载完的回调里，设置 ts 的默认 compilerOptions。

这里设置 jsx 为 preserve，也就是输入 \<div> 输出 \<div>，保留原样。

如果设置为 react 会输出 React.createElement("div")。

再就是 esModuleInterop，这个也是 ts 常用配置。

默认 fs 要这么引入，因为它是 commonjs 的包，没有 default 属性：

```javascript
import * as fs from 'fs';
```
设置 esModuleInterop 会在编译的时候自动加上 default 属性。

就可以这样引入了：

```javascript
import fs from 'fs';
```

再看下：

![](./images/45445faeb87abead22e3239b150c6ee5.webp )

错误消失了。

我们还可以添加快捷键的交互：

![](./images/eef01886f2a29343828f6a62faf51a8e.gif )

默认 cmd（windows 下是 ctrl） + j 没有处理。

我们可以 cmd + j 的时候格式化代码。

![](./images/e83cc55ca86e42b050bb1da496664535.webp )
```javascript
editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyJ, () => {
    editor.getAction('editor.action.formatDocument')?.run()
});
```

试下效果：
![](./images/f9b4b0b7dfd523fe3387ea35798f5cb5.gif )

有同学可能问，monaco editor 还有哪些 action 呢？

打印下就知道了：

```javascript
editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyJ, () => {
    // editor.getAction('editor.action.formatDocument')?.run()
    let actions = editor.getSupportedActions().map((a) => a.id);
    console.log(actions);
});
```
有 131 个：

![](./images/2e84a0e01e8dce7d3bb58019f609d29c.webp )

用到再搜吧。

现在还一个比较大的问题：

![](./images/61a010af6c446e9ffc961a92ab77b586.webp )

这个缩略图用不到。

而且我们现在没多少内容就出现滚动条了。

滚动条宽度大了点。

这些都可以通过修改 options 来解决：

![](./images/dcf24a43229546e9509de0fa1aa6f9db.webp )

```javascript
return <MonacoEditor
    height={'100%'}
    path={'guang.tsx'}
    language={"typescript"}
    onMount={handleEditorMount}
    value={code}
    options={
        {
            fontSize: 14,
            scrollBeyondLastLine: false,
            minimap: {
              enabled: false,
            },
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
        }
    }
/>
```

scrollBeyondLastLine 是到了最后一行之后依然可以滚动一屏，关闭后就不会了。

minimap 就是缩略图，关掉就没了。

scrollbar 是设置横向纵向滚动条宽度的。

![](./images/67e6a7e05698409afbce92ce5a62fe77.webp )

设置都生效了。

还有一个问题：

![](./images/31b588541ff5f2693b6b0ad4896b7434.gif )

现在引入第三方包是没提示的。

写 ts 没提示怎么行呢？

我们也要支持下。

这里用到 @typescript/ata 这个包：

![](./images/dbf4d2dda58df6961da0e4d113196fd1.webp )

ata 是 automatic type acquisition 自动类型获取。

它可以传入源码，自动分析出需要的 ts 类型包，然后自动下载。

我们新建个 ./Editor/ata.ts，复制文档里的示例代码：

```javascript
import { setupTypeAcquisition } from '@typescript/ata'
import typescriprt from 'typescript';

export function createATA(onDownloadFile: (code: string, path: string) => void) {
  const ata = setupTypeAcquisition({
    projectName: 'my-ata',
    typescript: typescriprt,
    logger: console,
    delegate: {
      receivedFile: (code, path) => {
        console.log('自动下载的包', path);
        onDownloadFile(code, path);
      }
    },
  })

  return ata;
}
```

安装用到的包：

```
npm install --save @typescript/ata -f 
```
这里就是用 ts 包去分析代码，然后自动下载用到的类型包，有个 receivedFile 的回调函数里可以拿到下载的代码和路径。

然后在 mount 的时候调用下：

![](./images/1d037630c8903fa6db84be10f7fc5ccd.webp )

```javascript
const ata = createATA((code, path) => {
    monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file://${path}`)
})

editor.onDidChangeModelContent(() => {
    ata(editor.getValue());
});

ata(editor.getValue());
```
就是最开始获取一次类型，然后内容改变之后获取一次类型，获取类型之后用 addExtraLib 添加到 ts 里。

看下效果：

![](./images/99a8a964bc70777b6e35f57422562e5a.webp )

![](./images/0e888d9660fc801a4b0d8888a57aae2e.webp )

有类型了！

最后，现在很多部分是写死的，我们抽离一下 Editor 组件的参数，：

![](./images/5372cb68a5df58120d06958ecaa6b49c.webp )

![](./images/437a41b118cda18563b457689746c178.webp )

把文件的信息封装到 file 里，然后加上 onChange 的回调，支持传入编辑器的 options。

```javascript
import MonacoEditor, { OnMount, EditorProps } from '@monaco-editor/react'
import { createATA } from './ata';
import { editor } from 'monaco-editor'

export interface EditorFile {
    name: string
    value: string
    language: string
}

interface Props {
    file: EditorFile
    onChange?: EditorProps['onChange'],
    options?: editor.IStandaloneEditorConstructionOptions
}

export default function Editor(props: Props) {

    const {
        file,
        onChange,
        options
    } = props;

    const handleEditorMount: OnMount = (editor, monaco) => {

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyJ, () => {
            editor.getAction('editor.action.formatDocument')?.run()
            // let actions = editor.getSupportedActions().map((a) => a.id);
            // console.log(actions);
        });

        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            jsx: monaco.languages.typescript.JsxEmit.Preserve,
            esModuleInterop: true,
        })

        const ata = createATA((code, path) => {
            monaco.languages.typescript.typescriptDefaults.addExtraLib(code, `file://${path}`)
        })

        editor.onDidChangeModelContent(() => {
            ata(editor.getValue());
        });

        ata(editor.getValue());
    }

    return <MonacoEditor
        height={'100%'}
        path={file.name}
        language={file.language}
        onMount={handleEditorMount}
        onChange={onChange}
        value={file.value}
        options={
            {
                fontSize: 14,
                scrollBeyondLastLine: false,
                minimap: {
                  enabled: false,
                },
                scrollbar: {
                  verticalScrollbarSize: 6,
                  horizontalScrollbarSize: 6,
                },
                ...options
            }
        }
    />
}
```
在 CodeEditor 里加上参数测试下：

```javascript
import Editor from "./Editor";
import FileNameList from "./FileNameList";

export default function CodeEditor() {

    const file = {
        name: 'guang.tsx',
        value: 'import lodash from "lodash";\n\nconst a = <div>guang</div>',
        language: 'typescript'
    }

    function onEditorChange() {
        console.log(...arguments);
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <FileNameList/>
            <Editor file={file} onChange={onEditorChange}/>
        </div>
    )
}
```

![](./images/a663e657be5cde39bcc2320511b61975.gif )

没啥问题。

onChange 可以拿到 content 和变化事件，里面包含具体改变的内容：


![](./images/c3b19fc2e0b32dfc133f3658dd25219c.webp )

这样，代码编辑器部分就完成了。

案例代码上传了[小册仓库](https://github.com/QuarkGluonPlasma/react-course-code/tree/main/react-playground-project)，可以切换到这个 commit 查看：
```
git reset --hard 0aebeab1826edf35fefa1b4a6d5b9f44c4aa970f
```
## 总结

这节我们完成了布局和代码编辑器。

布局主要是用 allotment 实现的 split-pane，两边可以通过拖动改变大小。

然后集成 @monaco-editor/react 实现的编辑器。

在 onMount 时添加 cmd + j 的快捷键来做格式化，并且设置了 ts 的 compilerOptions。

此外，还用 @typescript/ata 包实现了代码改变时自动下载 dts 类型包的功能。

这样，在编辑器里写代码就有 ts 类型提示了。

