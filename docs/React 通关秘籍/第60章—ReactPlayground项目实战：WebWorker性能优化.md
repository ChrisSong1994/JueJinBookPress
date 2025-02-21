# 第60章—ReactPlayground项目实战：WebWorker性能优化

﻿功能实现的差不多以后，我们做下代码的优化。

大家觉得我们的 playground 有啥性能瓶颈没有？

用 Performace 跑下就知道了：

![](./images/b775c97f7fa8fd738a480521444cdad6.png )

用无痕模式打开这个页面，无痕模式下不会跑浏览器插件，比较准确。

打开 devtools，点击 reload 重新加载页面：

![](./images/0edd3bb3fc0689fedb7f073a5479480d.gif )

等页面渲染完点击停止，就可以看到录制的性能数据。

按住可以上下左右拖动，按住然后上下滑动可以放大缩小：

![](./images/073eba6808e37537a180b22724c75975.gif )

这里的 main 就是主线程：

![](./images/b0bb8d15a0f0cda2c0bb51d7be0d26d9.png )

主线程会通过 event loop 的方式跑一个个宏任务，也就是这里的 task。

超过 50ms 的被称为长任务 long task：

![](./images/5e86e41860824b356ef9828c1bb6c68d.png )

long task 会导致主线程一直被占据，阻塞渲染，表现出来的就是页面卡顿。

性能优化的目标就是消除这种 long task。

图中的宽度代表耗时，可以看到是 babelTransform 这个方法耗费了 24 ms

![](./images/bc2862ddc1150c4bf5903d6a741d6f22.png )

点击火焰图中的 babelTransform，下面会展示它的代码位置，点击可以跳到 Sources 面板的代码：

![](./images/d7bfb1edfc4f922c7bcbd4b4d1f0c09f.gif )

这就是我们要优化性能的代码。

![](./images/f927992319a293a74acae87be0c4bbb9.png )

这是 babel 内部代码，怎么优化呢？

其实这段代码就是计算量比较大，我们把它放到单独的 worker 线程来跑就好了，这样就不会占用主线程的时间。

vite 项目用 web worker 可以这样用：

![](./images/d821277c444533c6c712fedba8775b53.png )

我们用一下：

![](./images/97091289f0595b2916e97b771791b24c.png )

把 compiler.ts 改名为 compiler.worker.ts

然后在 worker 线程向主线程 postMessage

```javascript
self.postMessage({
    type: 'COMPILED_CODE',
    data: 'xx'
})
```

主线程里创建这个 worker 线程，监听 message 消息：

![](./images/d5858d16535983f3c74a4c65c6b0e4ce.png )

```javascript
import CompilerWorker from './compiler.worker?worker'
```

```javascript
const compilerWorkerRef = useRef<Worker>();

useEffect(() => {
    if(!compilerWorkerRef.current) {
        compilerWorkerRef.current = new CompilerWorker();
        compilerWorkerRef.current.addEventListener('message', (data) => {
            console.log('worker', data)
        })
    }
}, []);
```
跑一下：

![](./images/4fff73fcae8f07e0e6d2657d2e66d243.png )

可以看到，主线程接收到了 worker 线程传过来的消息。

反过来通信也是一样的 postMessage 和监听 message 事件。

主线程这边给 worker 线程传递 files，然后拿到 woker 线程传回来的编译后的代码：

![](./images/b9f8833fb0e2a91372d776848346bc38.png )

```javascript
import { useContext, useEffect, useRef, useState } from "react"
import { PlaygroundContext } from "../../PlaygroundContext"
import Editor from "../CodeEditor/Editor";
import iframeRaw from './iframe.html?raw'
import { IMPORT_MAP_FILE_NAME } from "../../files";
import { Message } from "../Message";
import CompilerWorker from './compiler.worker?worker'

interface MessageData {
    data: {
      type: string
      message: string
    }
}

export default function Preview() {

    const { files} = useContext(PlaygroundContext)
    const [compiledCode, setCompiledCode] = useState('')
    const [error, setError] = useState('')

    const compilerWorkerRef = useRef<Worker>();

    useEffect(() => {
        if(!compilerWorkerRef.current) {
            compilerWorkerRef.current = new CompilerWorker();
            compilerWorkerRef.current.addEventListener('message', ({data}) => {
                console.log('worker', data);
                if(data.type === 'COMPILED_CODE') {
                    setCompiledCode(data.data);
                } else {
                    //console.log('error', data);
                }
            })
        }
    }, []);

    useEffect(() => {
        compilerWorkerRef.current?.postMessage(files)
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
而 worker 线程这边则是监听主线程的 message，传递 files 编译后的代码给主线程：

![](./images/5f1894c2cd32a8f50d9d2a6adeb786a5.png )

```javascript
self.addEventListener('message', async ({ data }) => {
    try {
        self.postMessage({
            type: 'COMPILED_CODE',
            data: compile(data)
        })
    } catch (e) {
         self.postMessage({ type: 'ERROR', error: e })
    }
})
```
可以看到，拿到了 worker 线程传过来的编译后的代码：

![](./images/38a7bf7e6f877e16132e6e4ac34d75c1.png )

预览也正常。

![](./images/a849c0f2e51d86eb6669f40fcecb4e9e.png )

其实 files 变化没必要那么频繁触发编译，我们加个防抖：

```javascript
useEffect(debounce(() => {
    compilerWorkerRef.current?.postMessage(files)
}, 500), [files]);
```

我们再用 performance 看下优化后的效果：

![](./images/9857377398ec3dafe68001814d5af94f.png )

![](./images/b1f76a2fa1d696d3b0f9b37a7596562f.gif )

之前的编译代码的耗时没有了，现在被转移到了 worker 线程：

![](./images/0dc471f4fefa10174049eb92de24abd1.png )

还是 24ms，但是不占据主线程了。

当然，因为我们文件内容很少，所以编译耗时少，如果文件多了，那编译耗时自然也就增加了，拆分就很有必要。

这样，性能优化就完成了。

然后再优化两处代码：

![](./images/f85696060fc0c4a10a081a06e78c4ef5.png )

main.tsx 有个编辑器错误说 StrictMode 不是一个 jsx，这种不用解决，也不影响运行，改下模版把它去掉就行了：

![](./images/ef20a4b1125dcab2472e50747e750e23.png )

上面那个只要编辑下文件就会触发类型下载，也不用解决：

![](./images/8a889bf587bcc0d8740935a6f4fac30c.gif )

再就是我们生成的文件名没必要 6 位随机数：

![](./images/a19ef3f3a5e5beddda47969b4f6240b5.gif )

改为 4 位正好：

![](./images/c07855cc3060e6f272062c513614e9cb.png )

![](./images/a3fa0f8561636d67d37b10aa5b947f96.gif )

案例代码上传了[小册仓库](https://github.com/QuarkGluonPlasma/react-course-code/tree/main/react-playground-project)。

## 总结

这节我们做了下性能优化。

我们用 Performance 分析了页面的 Event Loop，发现有 long task，**性能优化的目标就是消除 long task**。

分析发现是 babel 编译的逻辑导致的。

我们通过 Web Worker 把 babel 编译的逻辑放到了 worker 线程跑，通过 message 事件和 postMessage 和主线程通信。

拆分后功能正常，再用 Performance 分析，发现耗时逻辑被转移到了 worker 线程，主线程这个 long task 没有了。

这样就达到了性能优化的目的。

当需要编译的文件多了之后，这种性能优化就更有意义。
