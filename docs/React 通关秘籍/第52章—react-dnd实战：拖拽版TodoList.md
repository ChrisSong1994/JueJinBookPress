# 第52章—react-dnd实战：拖拽版TodoList

﻿学了很多技术之后，这节来综合练习下，做个 Todo List。

当然，不是普通的那种，而是拖拽版：

![](./images/823fa0c9806a461a1a7e444066a04dae.webp )

可以拖拽右边的 Todo Item 到列表里：

![](./images/c2cb94581e1ce31f8c02f03ca9d64187.webp )

拖拽到空白区域的时候，会高亮标出，松手后插入到该位置。

或者也可以拖动列表中的 TodoItem 调整顺序。

还可以拖到垃圾箱删除：

![](./images/cc8a731005ef160df9aa1b1b7e31d617.webp )

当拖动过来或者双击 TodoItem 的时候，可以进入编辑模式：

![](./images/a06625ae8c4aec8deaf5482f70e6ddfa.webp )

此外，Todo Item 勾选后代表完成：

![](./images/e0f4460545d58a8e16a3ef481f505870.webp )

技术栈用 react-dnd + zustand + tailwind + react-spring。

列表的数据都在 Store 里存储：

![](./images/97e86a1627a84e5cfca932e838d54323.webp )

增删改之后修改 Store 里的数据。

用 React Dnd 来做拖拽。

用 react-spring 实现过渡动画。

样式使用 Tailwind 的原子化样式来写。

需求理清了，我们正式上手写：

```
npx create-vite
```

![](./images/5b5c11837c2ee6be7edc266beaf29be9.webp )

进入项目，去掉 StrictMode：

![](./images/158635dbbc9382a5b1a9d4420273d34a.webp )

然后新建 TodoList/index.tsx 组件：

```javascript
import { FC } from "react";

interface TodoListProps {

}

export const TodoList:FC<TodoListProps> = (props) => {
    
    return <div></div>
}
```

按照 [tailwind 文档](https://www.tailwindcss.cn/docs/guides/vite#react)里的步骤安装 tailwind：

```javascript
npm install -D tailwindcss postcss autoprefixer

npx tailwindcss init -p
```

会生成 tailwind 和 postcss 配置文件：

![](./images/2e11834ef1e4247d0c6fd5783e6d9e50.webp )

修改下 content 配置，也就是从哪里提取 className：

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```
前面 [tailwind 那节](https://juejin.cn/book/7294082310658326565)讲过，tailwind 会提取 className 之后按需生成最终的 css。

改下 index.css 引入 tailwind 基础样式：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

安装 tailwind 插件之后：

![](./images/c59ffea76ccbff5cb7b305d3ff0baaf1.webp )

在写代码的时候就会提示 className 和对应的样式值：

![](./images/ef1947ec77d1dadfba9cd3387b753ffa.webp )

这个插件触发提示需要先敲一个空格，这点要注意下：

![](./images/7d9621915b470d011bf6a72e6af70b9a.gif )

有的你不知道 className 叫啥的样式，还可以在 [tailwind 文档](https://www.tailwindcss.cn/docs/border-width)里搜：

![](./images/c69e7e6253a5c8ba4175e88a30a6f63b.webp )

改下 TodoList 的样式：

```javascript
import { FC } from "react";

interface TodoListProps {

}

export const TodoList:FC<TodoListProps> = (props) => {

    return <div className="w-1000 h-600 m-auto mt-100 p-10 border-2 border-black"></div>
}
```
设置 width 1000，height 600，margin-top 100 padding 10 然后 border 2

在 App.tsx 引入下：

```javascript
import { TodoList } from './TodoList'

function App() {

  return <TodoList></TodoList>
}

export default App
```

把开发服务跑起来：

```
npm install

npm run dev
```
![](./images/33cf6efd434c3dc7605656a3afd30275.webp )

为啥部分样式没生效呢？

![](./images/f40f80008cec971c89cc3712928ca916.webp )

因为像 w-1000 h-600 mt-100 这种，在内置的 className 里并没有。

需要在 tailwind.config.js 里配置下：

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      width: {
        1000: '1000px',
      },
      height: {
        600: '600px'
      },
      margin: {
        100: '100px'
      }
    },
  },
  plugins: [],
}
```
这样就好了：

![](./images/200fc75d7bd336be04fad10a19d277d6.webp )

然后继续写布局：
```javascript
import { FC } from "react";

interface TodoListProps {

}

export const TodoList:FC<TodoListProps> = (props) => {


    return <div className={`
            w-1000 h-600 m-auto mt-100 p-10
            border-2 border-black
            flex justify-between items-start
        `}>
        <div className="flex-2 h-full mr-10 bg-blue-400 overflow-auto">
        </div>

        <div className="flex-1 h-full bg-blue-400">

        </div>
    </div>
}
```

父元素 display:flex，然后 子元素分别 2 和 1 的比例，设置 margin-right:10px

这里 h-full 是 height:100%


flex-2 要配置下：

![](./images/b249872c631327ca3d980ca82b209a4f.webp )

看一下：
![](./images/44ffe4c50e70b8395a75afd5dd9d4888.webp )

你会发现 margin 和 padding 都不是 10px，而是 2.5rem

![](./images/bfeb6a0116dc88c2aeb4b0d753feb338.webp )

![](./images/f422d4f916746cc9eec584f310128ac0.webp )

我们在 tailwind.config.js 里覆盖下：

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      width: {
        1000: '1000px',
        600: '600px'
      },
      height: {
        600: '600px'
      },
      margin: {
        100: '100px',
        10: '10px'
      },
      padding: {
        10: '10px'
      },
      flex: {
        2: 2
      }
    },
  },
  plugins: [],
}
```
这样就好了：

![](./images/7bf3a81f8b24a9c59782aeeb2ad5f7f1.webp )

然后去掉背景颜色，添加 List、GarbageBin、NewItem 这三个组件：

```javascript
import { FC } from "react";
import classNames from "classnames";
import { NewItem } from "./NewItem";
import { GarbageBin } from "./GarbageBin";
import { List } from "./List";

interface TodoListProps {

}

export const TodoList:FC<TodoListProps> = (props) => {


    return <div className={classNames(
            "w-1000 h-600 m-auto mt-100 p-10",
            "border-2 border-black",
            "flex justify-between items-start"
        )}>
        <div className="flex-2 h-full mr-10 overflow-auto">
            <List/>
        </div>

        <div className={classNames(
            "flex-1 h-full",
            "flex flex-col justify-start"
        )}>
            <NewItem/>
            <GarbageBin className={"mt-100"}/>
        </div>
    </div>
}
```
这里多行 className 换成用 classnames 包来写。

```
npm install --save classnames
```
分别添加 GarbageBin.tsx

```javascript
import classNames from "classnames"
import { FC } from "react"

interface GarbaseProps{
    className?: string | string[]
}

export const GarbageBin: FC<GarbaseProps> = (props) => {
    
    const cs = classNames(
        "h-100 border-2 border-black",
        props.className
    );

    return <div className={cs}></div>
}
```
NewItem.tsx

```javascript
import classNames from "classnames"
import { FC } from "react"

interface NewItemProps{
    className?: string | string[]
}

export const NewItem: FC<NewItemProps> = (props) => {
    
    const cs = classNames(
        "h-200 border-2 border-black",
        props.className
    );

    return <div className={cs}></div>
}
```
还有 List.tsx

```javascript
import classNames from "classnames"
import { FC } from "react"

interface ListProps{
    className?: string | string[]
}

export const List: FC<ListProps> = (props) => {
    
    const cs = classNames(
        "h-full border-2 border-black",
        props.className
    );

    return <div className={cs}></div>
}
```

这里的 h-200、h-100 要在配置文件里加一下：

![](./images/ef5922c647201ca86acc41e60e060e46.webp )

现在界面是这样的：

![](./images/aa2a986963a8f96d853b52a2585cd79e.webp )

然后先来实现 List 组件部分：

```javascript
import classNames from "classnames"
import { FC } from "react"

interface ListProps{
    className?: string | string[]
}

export const List: FC<ListProps> = (props) => {
    
    const cs = classNames(
        "h-full p-10",
        props.className
    );

    return <div className={cs}>
        <Item/>
        <Item/>
        <Item/>
        <Item/>
        <Item/>
        <Item/>
        <Item/>
    </div>
}

function Item() {
    return <div className={classNames(
        "h-100 border-2 border-black bg-blue-300 mb-10 p-10",
        "flex justify-start items-center",
        "text-xl tracking-wide"
    )}>
        <input type="checkbox" className="w-40 h-40 mr-10"/>
        <p>待办事项</p>
    </div>
}
```

配置文件加一下 w-40、h-40 的配置：

![](./images/74968cf7e53c1c62c0acf84dfdf6b891.webp )

看下效果：

![](./images/b8221f14db631e94d33fd9d338aa02ec.gif )

里面用到的 className 可以去查 [tailwind 文档](https://www.tailwindcss.cn/docs/user-select)。

然后是 NewItem 组件：

```javascript
import classNames from "classnames"
import { FC } from "react"

interface NewItemProps{
    className?: string | string[]
}

export const NewItem: FC<NewItemProps> = (props) => {
    
    const cs = classNames(
        "h-100 border-2 border-black",
        "leading-100 text-center text-2xl",
        "bg-green-300",
        "cursor-move select-none",
        props.className
    );

    return <div className={cs}>新的待办事项</div>
}
```
GarbageBin 组件：

```javascript
import classNames from "classnames"
import { FC } from "react"

interface GarbaseProps{
    className?: string | string[]
}

export const GarbageBin: FC<GarbaseProps> = (props) => {
    
    const cs = classNames(
        "h-200 border-2 border-black",
        "bg-orange-300",
        "leading-200 text-center text-2xl",
        "cursor-move select-none",
        props.className
    );

    return <div className={cs}>垃圾箱</div>
}
```
在配置文件里加一下两个 line-height：

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      width: {
        1000: '1000px',
        600: '600px',
        40: '40px'
      },
      height: {
        600: '600px',
        200: '200px',
        100: '100px',
        40: '40px'
      },
      margin: {
        100: '100px',
        10: '10px'
      },
      padding: {
        10: '10px'
      },
      flex: {
        2: 2
      },
      lineHeight: {
        100: '100px',
        200: '200px'
      }
    },
  },
  plugins: [],
}
```

![](./images/f883d7da09c923ae73021ea820055425.webp )

其实这些 width、height、margin、padding 的值的覆盖可以统一放到 spacing 里：

![](./images/7ac035ba511951b501d31fb526582ff3.webp )

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        10: '10px',
        40: '40px',
        100: '100px',
        200: '200px',
        600: '600px',
        1000: '1000px',
      },
      width: {
        // 1000: '1000px',
        // 600: '600px',
        // 40: '40px',
        // 10: '10px'
      },
      height: {
        // 600: '600px',
        // 200: '200px',
        // 100: '100px',
        // 40: '40px',
        // 10: '10px'
      },
      margin: {
        // 100: '100px',
        // 10: '10px'
      },
      padding: {
        // 10: '10px'
      },
      flex: {
        2: 2
      },
      lineHeight: {
        100: '100px',
        200: '200px'
      }
    },
  },
  plugins: [],
}
```

[tailwind 文档](https://www.tailwindcss.cn/docs/customizing-spacing)里写了，很多样式都继承 spacing 的配置：

![](./images/e9529ecc321aa54159f2f0a240be32e7.webp )

或者不想全局改默认配置，也可以用 text-[14px] 这种方式。

text-[14px] 就会生成 font-size:14px 的样式：

![](./images/7705cdf151a94e6b46c90ab6f67119f1.webp )

接下来加上 react-dnd 来做拖拽。

安装用到的包：

```
npm install react-dnd react-dnd-html5-backend
```
在 main.tsx 引入下 DndProvider

![](./images/5ac4c6d884a6ec8a2785418287bee7a0.webp )

```javascript
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <DndProvider backend={HTML5Backend}>
      <App />
    </DndProvider>
)
```
它是 react-dnd 用来跨组件传递数据的。

在 NewItem.tsx 组件里用 useDrag 添加拖拽：
```javascript
import classNames from "classnames"
import { FC, useEffect, useRef } from "react"
import { useDrag } from "react-dnd";

interface NewItemProps{
    className?: string | string[]
}

export const NewItem: FC<NewItemProps> = (props) => {

    const ref = useRef<HTMLDivElement>(null);

    const [{ dragging }, drag] = useDrag({
        type: 'new-item',
        item: {},
        collect(monitor) {
            return {
                dragging: monitor.isDragging()
            }
        }
    });

    useEffect(() => {
        drag(ref);
    }, []);

    const cs = classNames(
        "h-100 border-2 border-black",
        "leading-100 text-center text-2xl",
        "bg-green-300",
        "cursor-move select-none",
        dragging ? 'border-dashed bg-white' : '',
        props.className
    );

    return <div ref={ref} className={cs}>新的待办事项</div>
}
```

![](./images/8ab4d3ddd4f86bfdca2eb8b6737f5bfd.webp )

拖动过程中，设置 border 虚线、背景白色。

![](./images/8b950ae5629933615a3451c434217d20.gif )

然后在 List 的 Item 也加上 useDrag 拖拽：

```javascript
function Item() {
    const ref = useRef<HTMLDivElement>(null);

    const [{ dragging }, drag] = useDrag({
        type: 'list-item',
        item: {},
        collect(monitor) {
            return {
                dragging: monitor.isDragging()
            }
        }
    });

    useEffect(() => {
        drag(ref);
    }, []);

    return <div ref={ref} className={classNames(
        "h-100 border-2 border-black bg-blue-300 mb-10 p-10",
        "flex justify-start items-center",
        "text-xl tracking-wide",
        dragging ? 'bg-white border-dashed' : ''
    )}>
        <input type="checkbox" className="w-10 h-10 mr-10"/>
        <p>待办事项</p>
    </div>
}
```
![](./images/01f5ac61429da5aa9b6704d3c7f03a87.gif )

在垃圾箱添加 useDrop：

```javascript
import classNames from "classnames"
import { FC, useEffect, useRef } from "react"
import { useDrop } from "react-dnd";

interface GarbaseProps{
    className?: string | string[]
}

export const GarbageBin: FC<GarbaseProps> = (props) => {
    
    const ref = useRef<HTMLDivElement>(null);

    const [{ isOver }, drop] = useDrop(() => {
        return {
            accept: 'list-item',
            drop(item) {},
            collect(monitor) {
                return {
                    isOver: monitor.isOver()
                }
            }
        }
    });

    useEffect(()=> {
        drop(ref);
    }, []);
    

    const cs = classNames(
        "h-200 border-2 border-black",
        "bg-orange-300",
        "leading-200 text-center text-2xl",
        "cursor-move select-none",
        isOver ? "bg-yellow-400 border-dashed" : "",
        props.className
    );

    return <div ref={ref} className={cs}>垃圾箱</div>
}
```
accept 指定了 list-item，只有对应的 type 拖拽到这里才能触发 isOver：

![](./images/fe13bb57d0172aab6618989ec4f0423f.gif )

那新的 todo item 拖到哪里呢？

到这里：
![](./images/9953c7fe19807bafd24cd8618e900f71.webp )

所以我们要把这些地方也新建个组件，然后添加 useDrop：

![](./images/f88e9901fc12b2489281633eff9f9961.webp )

去掉之前 Item 的 mt-10 换成 Gap 的 h-10：

```javascript
import classNames from "classnames"
import { FC, useEffect, useRef } from "react"
import { useDrag, useDrop } from "react-dnd";

interface ListProps{
    className?: string | string[]
}

export const List: FC<ListProps> = (props) => {
    
    const cs = classNames(
        "h-full p-10",
        props.className
    );

    return <div className={cs}>
        <Gap/>
        <Item/>
        <Gap/>
        <Item/>
        <Gap/>
        <Item/>
        <Gap/>
        <Item/>
        <Gap/>
        <Item/>
        <Gap/>
        <Item/>
        <Gap/>
        <Item/>
        <Gap/>
    </div>
}

function Gap() {
    const ref = useRef<HTMLDivElement>(null);

    const [{ isOver }, drop] = useDrop(() => {
        return {
            accept: 'new-item',
            drop(item) {},
            collect(monitor) {
                return {
                    isOver: monitor.isOver()
                }
            }
        }
    });

    useEffect(()=> {
        drop(ref);
    }, []);

    const cs = classNames(
        "h-10",
        isOver ? 'bg-red-300' : ''
    );

    return <div ref={ref} className={cs}></div>
}

function Item() {
    const ref = useRef<HTMLDivElement>(null);

    const [{ dragging }, drag] = useDrag({
        type: 'list-item',
        item: {},
        collect(monitor) {
            return {
                dragging: monitor.isDragging()
            }
        }
    });

    useEffect(() => {
        drag(ref);
    }, []);

    return <div ref={ref} className={classNames(
        "h-100 border-2 border-black bg-blue-300 p-10",
        "flex justify-start items-center",
        "text-xl tracking-wide",
        dragging ? 'bg-white border-dashed' : ''
    )}>
        <input type="checkbox" className="w-40 h-40 mr-10"/>
        <p>待办事项</p>
    </div>
}
```
覆盖下 w-10、h-10 的值，默认是 rem，我们还是用 px：

![](./images/f25521bb4789187982e47065ba05c8e9.webp )

现在 new-item 就能拖过来了：

![](./images/6d9bc2f4e89cbe751850fa70caa1df51.gif )

现在 Gap 和 Item 代码挺多了，分离出去作为单独的模块 Gap.tsx 和 Item.tsx

![](./images/1dde99f0d029602330445872f6a667d0.webp )

接下来处理下具体的状态逻辑。

安装 zustand：

```
npm install --save zustand
```
创建 TodoList/Store.ts

```javascript
import { create } from 'zustand';

export interface ListItem {
  id: string,
  status: 'todo' | 'done',
  content: string
}

type State = {
  list: Array<ListItem>
}

type Action = {
  addItem: (item: ListItem) => void,
  deleteItem: (id: string) => void,
  updateItem: (item: ListItem) => void,
}

export const useTodoListStore = create<State & Action>((set) => ({
  list: [],
  addItem: (item: ListItem) => {
    set((state) => {
      return {
        list: [
          ...state.list,
          item
        ]
      }
    })
  },
  deleteItem: (id: string) => {
    set((state) => {
      return {
        list: state.list.filter(item => {
          return item.id !== id;
        })
      }
    });
  },
  updateItem: (updateItem: ListItem) => {
    set(state => {
      return {
        list: state.list.map(item => {
          if(item.id === updateItem.id) {
            return updateItem;
          }
          return item;
        })
      }
    })
  }
}))
```
state 就是 list，然后添加 addItem、deleteItem、updateItem 的方法。

在 List 组件里引入下：

![](./images/952ac1688b92b088999a79a0463f0f72.webp )

传入 data，顺便指定 key：

```javascript
import classNames from "classnames"
import { FC, Fragment} from "react"
import { Gap } from "./Gap";
import { Item } from "./Item";
import { useTodoListStore } from "./store";

interface ListProps{
    className?: string | string[]
}

export const List: FC<ListProps> = (props) => {
    
    const list = useTodoListStore(state => state.list);

    const cs = classNames(
        "h-full p-10",
        props.className
    );

    return <div className={cs}>
        {
            list.length ? list.map(item => {
                return <Fragment key={item.id}>
                    <Gap/>
                    <Item data={item} />
                </Fragment>
            }) : '暂无待办事项'
        }
        <Gap/>
    </div>
}
```
\<Fragment> 也可以写 <></>，它只是用来给多个 children 包一层，但不会生成 dom 节点。

![](./images/0d28dbba442d0b6f98db244daa4613a5.webp )

在 Item 组件添加 content 参数：

![](./images/106fc7f3093c8e115dad646a494cc815.webp )

看下效果：

![](./images/689a2007f01b38e9cde66e523e6675fa.webp )

我们加一下添加 item 的处理：

![](./images/b3bcbb0471911fc9c0d63296d6e7a0ae.webp )

```javascript
import classNames from "classnames";
import { useEffect, useRef } from "react";
import { useDrop } from "react-dnd";
import { useTodoListStore } from "./store";

export function Gap() {
    const addItem = useTodoListStore(state => state.addItem);

    const ref = useRef<HTMLDivElement>(null);

    const [{ isOver }, drop] = useDrop(() => {
        return {
            accept: 'new-item',
            drop(item) {
                addItem({
                    id: Math.random().toString().slice(2, 8),
                    status: 'todo',
                    content: '待办事项'
                });
            },
            collect(monitor) {
                return {
                    isOver: monitor.isOver()
                }
            }
        }
    });

    useEffect(()=> {
        drop(ref);
    }, []);

    const cs = classNames(
        "h-10",
        isOver ? 'bg-red-300' : ''
    );

    return <div ref={ref} className={cs}></div>
}
```

这里用 Math.random 生成 6 位的随机数：

![](./images/7d2cabaca223c0ba2c1b911b9c6ed63c.webp )

![](./images/fc2bc07267cd00e75c0a6043ec5468eb.gif )

然后加一下删除的处理：

drag 的时候加上传递的数据：

![](./images/b5e36eb32d2bc797e8ff4b0b0be75e9f.webp )

drop 的时候拿到 id 执行删除：

![](./images/924a19e018467cebd5295f55702f19ee.webp )

测试下：

![](./images/849660f369c09922b2f95750cd929bed.gif )

删除也没问题。

然后加上编辑功能：

![](./images/2f7a88f821ec88d65e69b195cd0219a7.webp )

用两个 state 分别保存 editing 状态和 input 内容。

onDoubleClick 的时候显示 input，修改 editing 状态为 true。

onBlur 的时候修改 editing 状态为 false。

并且用 updateItem 更新状态：

![](./images/c7f3c83208ede425d6f91359f4ffdfbe.webp )

没啥问题：

![](./images/2c913f4b5b733c0c22225d6c44b1a3fc.gif )

然后当选中 checkbox 的时候，也要 updateItem：

![](./images/dc9686e3d747bb4a558f830b0771e39d.webp )

```javascript
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { ListItem, useTodoListStore } from "./store";

interface ItemProps {
    data: ListItem
}

export function Item(props: ItemProps) {

    const {
        data
    } = props;

    const updateItem = useTodoListStore(state => state.updateItem);

    const ref = useRef<HTMLDivElement>(null);

    const [editing, setEditing] = useState(false);

    const [editingContent, setEditingContent] = useState(data.content);

    const [{ dragging }, drag] = useDrag({
        type: 'list-item',
        item: {
            id: data.id
        },
        collect(monitor) {
            return {
                dragging: monitor.isDragging()
            }
        }
    });

    useEffect(() => {
        drag(ref);
    }, []);

    return <div ref={ref} className={classNames(
            "h-100 border-2 border-black bg-blue-300 p-10",
            "flex justify-start items-center",
            "text-xl tracking-wide",
            dragging ? 'bg-white border-dashed' : ''
        )}
        onDoubleClick={() => {
            setEditing(true)
        }}
    >
        <input 
            type="checkbox" 
            className="w-40 h-40 mr-10"
            checked={data.status === 'done' ? true : false}
            onChange={(e) => {
                updateItem({
                    ...data,
                    status: e.target.checked ? 'done' : 'todo'
                })
            }}
        />
        <p>
            {
                editing ? <input 
                    value={editingContent}
                    onChange={(e) => {
                        setEditingContent(e.target.value)
                    }}
                    onBlur={() => {
                        setEditing(false);
                        updateItem({
                            ...data,
                            content: editingContent
                        })
                    }}
                /> : data.content 
            }
        </p>
    </div>
}
```

还有，现在不管拖动到哪里都是在后面插入：

![](./images/c2807460d6938dce62453375a20f22a1.gif )

我们希望能根据 drop 的位置来插入：

所以给 Gap 传入 id 参数：

![](./images/2d7280e4b9eadb1b81e4bb1df0e8d0ef.webp )

然后 Gap 组件 drop 的时候传入 addItem 方法：

![](./images/e40143161e72b420cc862e7ec7999763.webp )

addItem 方法里根据 id 插入：

![](./images/42c92c7c575406bbe8e3ff181efc5ddf.webp )

没有传就插入在后面，否则 findIndex，然后在那个位置插入。

测试下：

![](./images/1afeb4a08392669e6952532c70640ac9.gif )

没啥问题。

不过 gap 区域有点小，大家实现的时候可以改大一点。

还有，现在一刷新，数据就没了：

![](./images/02b211faa9c2e182d64a12f3e2f9b550.gif )

我们给 zustand 加上 persist 中间件：

![](./images/1f38282f8c57a07d279e80cde4c80f90.webp )

注意，ts + middleware 的场景，zustand 要换这种写法。

[文档的解释](https://github.com/pmndrs/zustand/blob/main/docs/guides/typescript.md)是为了更好的处理类型：

![](./images/4c5a38f877c86ef87aae1ead06ca22be.webp )

反正功能是一样的。

```javascript
import { StateCreator, create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ListItem {
  id: string,
  status: 'todo' | 'done',
  content: string
}

type State = {
  list: Array<ListItem>
}

type Action = {
  addItem: (item: ListItem, id?: string) => void,
  deleteItem: (id: string) => void,
  updateItem: (item: ListItem) => void,
}

const stateCreator: StateCreator<State & Action> = (set) => ({
  list: [],
  addItem: (item: ListItem, id?: string) => {
    set((state) => {
      if(!id) {
        return {
          list: [
            ...state.list,
            item
          ]
        }
      }

      const newList = [
        ...state.list, 
      ];

      const index = newList.findIndex(item => item.id === id);

      newList.splice(index, 0, item);

      return {
        list: newList
      }
    })
  },
  deleteItem: (id: string) => {
    set((state) => {
      return {
        list: state.list.filter(item => {
          return item.id !== id;
        })
      }
    });
  },
  updateItem: (updateItem: ListItem) => {
    set(state => {
      return {
        list: state.list.map(item => {
          if(item.id === updateItem.id) {
            return updateItem;
          }
          return item;
        })
      }
    })
  }
});

export const useTodoListStore = create<State & Action>()(persist(stateCreator, {
  name: 'todolist'
}));
```
测试下：

![](./images/ed284bc84fc9cc6d534480dd1b12bde5.webp )

![](./images/65ccfbfa7017473247127d202b17314b.gif )

现在，数据就被保存到了 localstorage 中，刷新数据也不会丢失。

这样，拖拽版 TodoList 就完成了。

大家还可以加个拖拽排序功能，和上节实现一样。

最后，我们加上过渡动画，用 react-spring：

```
npm install --save @react-spring/web
```
然后渲染 list 的时候用 react-spring 的 useTransition 的 hook 处理下：

![](./images/5dbcec02a3a6f82fbb8e633c41be886c.webp )

useTransition 会根据传入的配置来生成 style，这些 style 要加在 animated.div 上。

并且，keys 也是在配置里传入的，animated.div 会自动添加。

![](./images/60e2089a9787b23d253cc3079d0d6243.gif )

案例代码上传了[小册仓库](https://github.com/QuarkGluonPlasma/react-course-code/tree/main/todolist-drag)

## 总结

我们用 react-dnd + zustand 实现了拖拽版 todolist。

用 tailwind 来写的样式。

用 @react-spring/web 加上了过渡动画。

这是个综合实战，对 react-dnd、tailwind、zustand、react-spring 都有较全面的应用。
