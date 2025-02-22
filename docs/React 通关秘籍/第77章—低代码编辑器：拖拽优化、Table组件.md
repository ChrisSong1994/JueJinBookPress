# 第77章—低代码编辑器：拖拽优化、Table组件

﻿在 [amis](https://aisuda.github.io/amis-editor-demo/#/edit/0) 编辑器里，物料拖动到画布区后，还可以拖动改变位置：

![](./images/ee5e9cb8687d86a71e43fb1b7822ea31.gif )

现在我们的编辑器没有支持拖动改变位置：

![](./images/86cc1ab8f5a0994255349183e0910714.gif )

我们来实现下：

其实这个也很简单，就是给物料也加上 useDrag 就可以了。

比如给 Button 加一下：

![](./images/34e8e6085468efb3ceb6e53f9ecf1d68.webp )

```javascript
const [_, drag] = useDrag({
  type: 'Button',
  item: {
      type: 'Button'
  }
});
```

![](./images/a81d4a6f9ab68c4b1059c792cb6b0029.gif )

现在是能拖动了，但是和从物料区拖过来的 drop 逻辑一样，都是新增组件。

我们得区分下两者。

加上 dragType 属性，然后带上当前拖拽的组件 id：

![](./images/00f9f17857e4c021e150751d59dd43f9.webp )

在 useDrop 的时候判断下 dragTag，如果是 move，那就先 delete 再 add

![](./images/5f455485862662a4ac4528dd8cd381a8.webp )

```javascript
import { useDrop } from "react-dnd";
import { useComponentConfigStore } from "../stores/component-config";
import { getComponentById, useComponetsStore } from "../stores/components";

export interface ItemType {
  type: string;
  dragType?: 'move' | 'add',
  id: number
}

export function useMaterailDrop(accept: string[], id: number) {
    const { addComponent, deleteComponent, components } = useComponetsStore();
    const { componentConfig } = useComponentConfigStore();

    const [{ canDrop }, drop] = useDrop(() => ({
        accept,
        drop: (item: ItemType, monitor) => {
            const didDrop = monitor.didDrop()
            if (didDrop) {
              return;
            }

            if(item.dragType === 'move') {
              const component = getComponentById(item.id, components)!;

              deleteComponent(item.id);

              addComponent(component, id)
            } else {
              const config = componentConfig[item.type];

              addComponent({
                id: new Date().getTime(),
                name: item.type,
                desc: config.desc,
                props: config.defaultProps
              }, id)
            }
        },
        collect: (monitor) => ({
          canDrop: monitor.canDrop(),
        }),
    }));

    return { canDrop, drop }
}
```
测试下：

![](./images/1ad8d62bbdb47fd33ebde5aa441b3071.gif )

这样就实现了拖拽改变位置。

在 Container 组件也加上 useDrag：


![](./images/7409c545c3887fb4939de0324e5469ef.webp )

这里因为要同时给 div 绑定 drag、drop 的处理，所以用 useRef 拿到 ref 之后再绑定。

```javascript
import { useDrag } from 'react-dnd';
import { useMaterailDrop } from '../../hooks/useMaterailDrop';
import { CommonComponentProps } from '../../interface';
import { useEffect, useRef } from 'react';

const Container = ({ id, name, children, styles }: CommonComponentProps) => {

    const {canDrop, drop } = useMaterailDrop(['Button', 'Container'], id);

    const divRef = useRef<HTMLDivElement>(null);

    const [_, drag] = useDrag({
        type: name,
        item: {
            type: name,
            dragType: 'move',
            id: id
        }
    });

    useEffect(() => {
        drop(divRef);
        drag(divRef);
    }, []);
    
    return (
        <div 
            data-component-id={id}
            ref={divRef}
            style={styles}
            className={`min-h-[100px] p-[20px] ${ canDrop ? 'border-[2px] border-[blue]' : 'border-[1px] border-[#000]'}`}
        >{children}</div>
    )
}

export default Container;
```

![](./images/8189eb3f01c916f19addcc64720f61e3.gif )

接下来我们加一下 Table 的物料组件：

materials/Table/dev.tsx

```javascript
import { Table as AntdTable } from 'antd';
import React, { useEffect, useMemo, useRef } from 'react';
import { CommonComponentProps } from '../../interface';
import { useMaterailDrop } from '../../hooks/useMaterailDrop';
import { useDrag } from 'react-dnd';

function Table({ id, name, children, styles }: CommonComponentProps) {

    const {canDrop, drop } = useMaterailDrop(['TableColumn'], id);
    
    const divRef = useRef<HTMLDivElement>(null);

    const [_, drag] = useDrag({
        type: name,
        item: {
            type: name,
            dragType: 'move',
            id: id
        }
    });

    useEffect(() => {
        drop(divRef);
        drag(divRef);
    }, []);

    const columns = useMemo(() => {
        return React.Children.map(children, (item: any) => {
            return {
                title: <div className='m-[-16px] p-[16px]' data-component-id={item.props?.id}>{item.props?.title}</div>,
                dataIndex: item.props?.dataIndex,
                key: item
            }
        })
    }, [children]);

    return (
        <div
            className={`w-[100%] ${canDrop ? 'border-[2px] border-[blue]' : 'border-[1px] border-[#000]'}`}
            ref={divRef}
            data-component-id={id}
            style={styles}
        >
            <AntdTable
                columns={columns}
                dataSource={[]}
                pagination={false}
            />
        </div>
    );
}

export default Table;
```
添加 drop、drag 的处理，用 antd 的 table 来渲染。

这里 columns 的处理比较巧妙：

![](./images/5ab9875c992942834739ad02af4e3010.webp )

我们拖拽 TableColumn 组件过来的时候，用 React.Children 遍历，把它变为 columns 配置。

![](./images/ea130605696fb4e6517373f4fd768443.webp )

当然，这个 TableColumn 组件还没写。

在 componentConfig 添加 Table 组件的配置：

![](./images/ea11e5282748cdc7020dd3234ea29dc4.webp )

```javascript
Table: {
    name: 'Table',
    defaultProps: {},
    desc: '表格',
    setter: [
        {
          name: 'url',
          label: 'url',
          type: 'input',
        },
    ],
    dev: TableDev,
    prod: TableDev
}
```
然后在 Page、Modal、Container 组件里支持下 Table 的 drop：

![](./images/f0fdf771f8b3280d3f088ce86c226860.webp )

![](./images/1047378906501e7d177c14a9d05531ac.webp )

![](./images/95cdc6d02b045fc6aac44537c43ab1f9.webp )

试一下：

![](./images/2c93bbbc6808fd3b926e4e9feb01e9b5.gif )

![](./images/395d9bc190e36f10748e57190f0ca6ee.webp )

没啥问题。

然后再实现下 TableColumn 组件：

materials/TableColumn/dev.tsx
```javascript
const TableColumn = () => {
  return <></>
}

export default TableColumn;
```
materials/TableColumn/prod.tsx
```javascript
const TableColumn = () => {
    return <></>
}

export default TableColumn;
```
这只是我们做 column 配置用的，不需要渲染内容。

在 ColumnConfig 加一下配置：

![](./images/b7ce0be5e50b63bd4de512778a0d2ec2.webp )

```javascript
TableColumn: {
    name: 'TableColumn',
    desc: '表格列',
    defaultProps: {
        dataIndex:`col_${new Date().getTime()}`,
        title: '列名'
    },
    setter: [
        {
          name: 'type',
          label: '类型',
          type: 'select',
          options: [
            {
              label: '文本',
              value: 'text',
            },
            {
              label: '日期',
              value: 'date',
            },
          ],
        },
        {
          name: 'title',
          label: '标题',
          type: 'input',
        },
        {
          name: 'dataIndex',
          label: '字段',
          type: 'input',
        },
      ],
    dev: TableColumnDev,
    prod: TableColumnProd,
}
```
试下效果：

![](./images/8aa930228eaa92098bc4917493b16f42.gif )

我们用 TableColumn 组件来配置字段。

然后再来实现 Table 组件的 prod 版本：

materials/Table/prod.tsx

```javascript
import { Table as AntdTable } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CommonComponentProps } from '../../interface';

const Table = ({ url, children }: CommonComponentProps) => {

  const [data, setData] = useState<Array<Record<string, any>>>([]);
  const [loading, setLoading] = useState(false);

  const getData = async () => {
    if (url) {
      setLoading(true);

      const { data } = await axios.get(url);
      setData(data);

      setLoading(false);
    }
  }

  useEffect(() => {
    getData();
  }, []);

  const columns = useMemo(() => {
    return React.Children.map(children, (item: any) => {
        if (item?.props?.type === 'date') {
            return {
                title: item.props?.title,
                dataIndex: item.props?.dataIndex,
                render: (value: any) => value ? dayjs(value).format('YYYY-MM-DD') : null,
            }
        } else {
            return {
                title: item.props?.title,
                dataIndex: item.props?.dataIndex,
            }
        }
    })
  }, [children]);

  return (
    <AntdTable
      columns={columns}
      dataSource={data}
      pagination={false}
      rowKey="id"
      loading={loading}
    />
  );
}

export default Table;
```

生产环境的 Table 需要请求 url，拿到数据后设置到 table。

并且渲染列的时候，如果是 date，要用 dayjs 做下格式化。

安装下用到的包：

```
npm install --save axios
npm install --save dayjs
```
改下 componentConfig 里的组件：

![](./images/a73fd7345c4c6d88e11e1e2e1eb376cf.webp )

试一下：

![](./images/815845bf293651f9701ccf3faaa60e8d.gif )

可以看到，确实发请求了。

只不过现在没这个接口。

我们用 nest 创建一个后端服务：

```
npx @nestjs/cli new lowcode-demo-backend
```
![](./images/c3eb1e239fe4f689dfe4dca4031cceb4.webp )

改下 AppController，加一个接口：

![](./images/aa2c4bb574baf763cd2c32793ae76a1e.webp )

```javascript
@Get('data')
data() {
    return [
      { name: '光光', sex: '男', birthday: new Date('1994-07-07').getTime() },
      { name: '东东', sex: '男', birthday: new Date('1995-06-06').getTime() },
      { name: '小红', sex: '女', birthday: new Date('1996-08-08').getTime() }
    ]
}
```
在 main.ts 开启跨域：

![](./images/a241cffe8adcc861282411cc6607d0ed.webp )

把服务跑起来：
```
npm run start:dev
```
![](./images/46f4ae26385953e97290efcc6203896f.webp )

浏览器访问下：

![](./images/6ad1bcad65c852e6b70ed2efbfb4dbef.webp )

这样接口就有了。

我们再来试下 Table 组件：

![](./images/db7c36db4d6dc97a4a1b158fc6dbddb2.webp )

![](./images/c442417d48e52fbad5b2a4b9204c31c7.webp )

![](./images/1d80ee3c56833f72fcd6247f363adadd.webp )

添加三个 TableColumn，配置下字段。

然后在 Table 配置下 url：

![](./images/7ec9de039587641e973639b6a3ab096e.webp )

再点击预览：

![](./images/a90cfedea85421a5997053f41150dd97.gif )

这样，Table 组件就会请求 url，然后根据配置渲染表格

![](./images/724798bbf1a72db2d34521dc2b0f2ca1.webp )

案例代码上传了[小册仓库](https://github.com/QuarkGluonPlasma/react-course-code/tree/main/lowcode-editor)，可以切换到这个 commit 查看：

```
git reset --hard 3df08cf3e09d69817f1bc75bf1b0f9f5e8cb41c4
```

## 总结

这节我们实现了物料组件拖拽改变位置，并实现了 Table 组件。

拖拽改变位置只要在物料组件上加上 useDrag 就可以了，要注意区分 add 和 move 的情况，加上标识，分别做处理。

Table 组件可以配置 url，然后拖拽 TableColumn 进来，TableColumn 可以配置字段信息。

Preview 渲染的时候，根据 url 请求接口，然后根据 columns 的配置来渲染数据。

这样，Table 的物料组件就完成了。
