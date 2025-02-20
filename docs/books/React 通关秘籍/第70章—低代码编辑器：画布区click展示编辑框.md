上节实现了 hover 时展示高亮框和组件名的效果：

![](./images/2f45f79575654edbb78c78c63bb9ff1a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这节我们来实现 click 时展示编辑框，以及组件删除：

![](./images/e653890b94114ee094026205dbda728b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

hover 时记录了 hoverComponentId：

![](./images/dbda8bb8b5d24349a829280c4eb694d2~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

click 时同样也要记录。

但是 hover 时不一样，click 选中的组件除了展示编辑框，还要在右侧属性区展示对应的组件属性：

![](./images/55ea9071f61747279b0d1974fce77a66~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

所以我们要把它记录到全局 store 里。

我们加一下：

![](./images/141f279aee994f839aca7177b1527fcd~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/952c54600fce4cc892a6cbe0fdba2883~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

```javascript
interface State {
  components: Component[];
  curComponentId?: number | null;
  curComponent: Component | null;
}

interface Action {
  addComponent: (component: Component, parentId?: number) => void;
  deleteComponent: (componentId: number) => void;
  updateComponentProps: (componentId: number, props: any) => void;
  setCurComponentId: (componentId: number | null) => void;
}
```

```javascript
curComponentId: null,
curComponent: null,
setCurComponentId: (componentId) =>
  set((state) => ({
    curComponentId: componentId,
    curComponent: getComponentById(componentId, state.components),
  })),
```
同样，click 事件也是绑定在画布区根组件 EditArea 上的：

![](./images/7c171086ed20490d91eaa8e55f41e842~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/ce44c9986a89496ca2a4f52ef9ff09c4~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

```javascript
import React, { MouseEventHandler, useEffect, useState } from "react";
import { useComponentConfigStore } from "../../stores/component-config";
import { Component, useComponetsStore } from "../../stores/components"
import HoverMask from "../HoverMask";
import SelectedMask from "../SelectedMask";

export function EditArea() {
    const { components, curComponentId, setCurComponentId} = useComponetsStore();
    const { componentConfig } = useComponentConfigStore();

    function renderComponents(components: Component[]): React.ReactNode {
        return components.map((component: Component) => {
            const config = componentConfig?.[component.name]

            if (!config?.component) {
                return null;
            }
            
            return React.createElement(
                config.component,
                {
                    key: component.id,
                    id: component.id,
                    name: component.name,
                    ...config.defaultProps,
                    ...component.props,
                },
                renderComponents(component.children || [])
            )
        })
    }

    const [hoverComponentId, setHoverComponentId] = useState<number>();

    const handleMouseOver: MouseEventHandler = (e)  => {
        const path = e.nativeEvent.composedPath();

        for (let i = 0; i < path.length; i += 1) {
            const ele = path[i] as HTMLElement;

            const componentId = ele.dataset?.componentId;
            if (componentId) {
                setHoverComponentId(+componentId);
                return;
            }
        }
    }
  
    const handleClick: MouseEventHandler = (e) => {
        const path = e.nativeEvent.composedPath();

        for (let i = 0; i < path.length; i += 1) {
            const ele = path[i] as HTMLElement;

            const componentId = ele.dataset?.componentId;
            if (componentId) {
                setCurComponentId(+componentId);
                return;
            }
        }
    }

    return <div className="h-[100%] edit-area" onMouseOver={handleMouseOver} onMouseLeave={() => {
        setHoverComponentId(undefined);
    }} onClick={handleClick}>
        {renderComponents(components)}
        {hoverComponentId && (
            <HoverMask
                portalWrapperClassName='portal-wrapper'
                containerClassName='edit-area'
                componentId={hoverComponentId}
            />
        )}
        {curComponentId && (
            <SelectedMask
                portalWrapperClassName='portal-wrapper'
                containerClassName='edit-area'
                componentId={curComponentId}
            />
        )}
        <div className="portal-wrapper"></div>
    </div>
}
```
点击事件触发时，找到元素对应的 component id，设置为 curComponentId。

然后渲染 curComponentId 对应的 SelectedMask。

实现下这个 SelectedMask 组件：

editor/components/SelectedMask/index.tsx

```javascript
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { getComponentById, useComponetsStore } from '../../stores/components';
import { Popconfirm, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

interface SelectedMaskProps {
  portalWrapperClassName: string
  containerClassName: string
  componentId: number;
}

function SelectedMask({ containerClassName, portalWrapperClassName, componentId }: SelectedMaskProps) {

  const [position, setPosition] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    labelTop: 0,
    labelLeft: 0,
  });

  const { components, curComponentId } = useComponetsStore();

  useEffect(() => {
    updatePosition();
  }, [componentId]);

  function updatePosition() {
    if (!componentId) return;

    const container = document.querySelector(`.${containerClassName}`);
    if (!container) return;

    const node = document.querySelector(`[data-component-id="${componentId}"]`);
    if (!node) return;

    const { top, left, width, height } = node.getBoundingClientRect();
    const { top: containerTop, left: containerLeft } = container.getBoundingClientRect();

    let labelTop = top - containerTop + container.scrollTop;
    let labelLeft = left - containerLeft + width;

    if (labelTop <= 0) {
      labelTop -= -20;
    }
  
    setPosition({
      top: top - containerTop + container.scrollTop,
      left: left - containerLeft + container.scrollTop,
      width,
      height,
      labelTop,
      labelLeft,
    });
  }

  const el = useMemo(() => {
      return document.querySelector(`.${portalWrapperClassName}`)!
  }, []);

  const curComponent = useMemo(() => {
    return getComponentById(componentId, components);
  }, [componentId]);

  function handleDelete() {

  }

  return createPortal((
    <>
      <div
        style={{
          position: "absolute",
          left: position.left,
          top: position.top,
          backgroundColor: "rgba(0, 0, 255, 0.1)",
          border: "1px dashed blue",
          pointerEvents: "none",
          width: position.width,
          height: position.height,
          zIndex: 12,
          borderRadius: 4,
          boxSizing: 'border-box',
        }}
      />
      <div
          style={{
            position: "absolute",
            left: position.labelLeft,
            top: position.labelTop,
            fontSize: "14px",
            zIndex: 13,
            display: (!position.width || position.width < 10) ? "none" : "inline",
            transform: 'translate(-100%, -100%)',
          }}
        >
          <Space>
            <div
              style={{
                padding: '0 8px',
                backgroundColor: 'blue',
                borderRadius: 4,
                color: '#fff',
                cursor: "pointer",
                whiteSpace: 'nowrap',
              }}
            >
              {curComponent?.name}
            </div>
            {curComponentId !== 1 && (
              <div style={{ padding: '0 8px', backgroundColor: 'blue' }}>
                <Popconfirm
                  title="确认删除？"
                  okText={'确认'}
                  cancelText={'取消'}
                  onConfirm={handleDelete}
                >
                  <DeleteOutlined style={{ color: '#fff' }}/>
                </Popconfirm>
              </div>
            )}
          </Space>
        </div>
    </>
  ), el)
}

export default SelectedMask;
```
和 HoverMask 区别不大，主要这几点区别：

![](./images/57b13c2258c34439af8611ba37732875~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

从 store 取出 curComponentId 来。

![](./images/47b047cf18a142ab877edd13559722bb~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

如果 id 不为 1，说明不是 Page 组件，就显示删除按钮。

点击的时候删除组件：

![](./images/b61ddc81028e4a2db25071bd46eb9dec~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

再就是编辑框的颜色稍微深一点：

![](./images/1ea4bcab57d14207ba96da9a7b5174ab~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

测试下：

![](./images/bde9d227db924270841945a18064e88e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

点击时显示了编辑框，并且点击删除能删除组件。

只是会和 HoverMask 重合。

我们处理下：

![](./images/87dac701583747cc9be332a98f320515~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

hoverComponentId 和 curComponentId 一样的时候，就不显示高亮框。

![](./images/a73bda14b34747bc9a89a246a73fe307~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这样就好了。

amis 的编辑器还有这个功能：

![](./images/0d1cfff553144b8398b7bb68fdca55e0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

组件会展示它所有的父组件，点击就会选中该父组件。

我们也实现下：

![](./images/efca8452b422431a99d479c551bb0d6a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

每个组件都有 component.parentId，用来找父组件也很简单，不断向上找，放到一个数组里就行。

然后用 DropDown 组件展示下拉列表：

![](./images/b49a177837e04afda3765fab6ce91d7e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

点击 item 的时候切换 curComponentId。

```javascript
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { getComponentById, useComponetsStore } from '../../stores/components';
import { Dropdown, Popconfirm, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

interface SelectedMaskProps {
  portalWrapperClassName: string
  containerClassName: string
  componentId: number;
}

function SelectedMask({ containerClassName, portalWrapperClassName, componentId }: SelectedMaskProps) {

  const [position, setPosition] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    labelTop: 0,
    labelLeft: 0,
  });

  const { components, curComponentId, curComponent, deleteComponent, setCurComponentId } = useComponetsStore();

  useEffect(() => {
    updatePosition();
  }, [componentId]);

  function updatePosition() {
    if (!componentId) return;

    const container = document.querySelector(`.${containerClassName}`);
    if (!container) return;

    const node = document.querySelector(`[data-component-id="${componentId}"]`);
    if (!node) return;

    const { top, left, width, height } = node.getBoundingClientRect();
    const { top: containerTop, left: containerLeft } = container.getBoundingClientRect();

    let labelTop = top - containerTop + container.scrollTop;
    let labelLeft = left - containerLeft + width;

    if (labelTop <= 0) {
      labelTop -= -20;
    }
  
    setPosition({
      top: top - containerTop + container.scrollTop,
      left: left - containerLeft + container.scrollTop,
      width,
      height,
      labelTop,
      labelLeft,
    });
  }

  const el = useMemo(() => {
      return document.querySelector(`.${portalWrapperClassName}`)!
  }, []);

  const curSelectedComponent = useMemo(() => {
    return getComponentById(componentId, components);
  }, [componentId]);

  function handleDelete() {
    deleteComponent(curComponentId!);
    setCurComponentId(null);
  }

  const parentComponents = useMemo(() => {
    const parentComponents = [];
    let component = curComponent;

    while (component?.parentId) {
      component = getComponentById(component.parentId, components)!;
      parentComponents.push(component);
    }

    return parentComponents;

  }, [curComponent]);

  return createPortal((
    <>
      <div
        style={{
          position: "absolute",
          left: position.left,
          top: position.top,
          backgroundColor: "rgba(0, 0, 255, 0.1)",
          border: "1px dashed blue",
          pointerEvents: "none",
          width: position.width,
          height: position.height,
          zIndex: 12,
          borderRadius: 4,
          boxSizing: 'border-box',
        }}
      />
      <div
          style={{
            position: "absolute",
            left: position.labelLeft,
            top: position.labelTop,
            fontSize: "14px",
            zIndex: 13,
            display: (!position.width || position.width < 10) ? "none" : "inline",
            transform: 'translate(-100%, -100%)',
          }}
        >
          <Space>
            <Dropdown
              menu={{
                items: parentComponents.map(item => ({
                  key: item.id,
                  label: item.name,
                })),
                onClick: ({ key }) => {
                  setCurComponentId(+key);
                }
              }}
              disabled={parentComponents.length === 0}
            >
              <div
                style={{
                  padding: '0 8px',
                  backgroundColor: 'blue',
                  borderRadius: 4,
                  color: '#fff',
                  cursor: "pointer",
                  whiteSpace: 'nowrap',
                }}
              >
                {curSelectedComponent?.name}
              </div>
            </Dropdown>
            {curComponentId !== 1 && (
              <div style={{ padding: '0 8px', backgroundColor: 'blue' }}>
                <Popconfirm
                  title="确认删除？"
                  okText={'确认'}
                  cancelText={'取消'}
                  onConfirm={handleDelete}
                >
                  <DeleteOutlined style={{ color: '#fff' }}/>
                </Popconfirm>
              </div>
            )}
          </Space>
        </div>
    </>
  ), el)
}

export default SelectedMask;
```
试一下：

![](./images/ad0295e4a5ad49688292ae2d2d1fc725~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这样，选中父组件的功能就完成了。

但现在有个问题：

![](./images/dc702dfa1a9b4be8a4abdada73b3efc1~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

删除组件后会触发它父组件的 hover，但这时候高亮框的高度是没删除元素的高度，会多出一块。

还有，click 选中的组件再添加组件的时候编辑框高度不会变化：

![](./images/308eb39303264b11a619e1cb0fbe8263~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这个问题也好解决，在 components 变化后调用下 updatePosition 就好了：

![](./images/c5687f69bd874308bd7964a1b31f4a34~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/4b97c9b8769f4290a0aaf3875ca221f3~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

```javascript
useEffect(() => {
    updatePosition();
}, [components]);
```
SelectedMask 和 HoverMask 都处理下。

![](./images/cea78407e77b4e4a84ecf944141a8eb9~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/376a5274dbac4c019732a9e4e39a6f24~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这样就好了。

此外，amis 编辑器左边物料和选中时的编辑框都是展示的组件描述，而我们直接展示组件名：

![](./images/6d9856c3a0884d0f9e93da3468f2d4da~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/39fa15bf69754f6eb75a6e21c2bb7f73~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

这样不大好，我们改一下：

在 Component 类型加一下 desc：

![](./images/e658ead4b59f454d9150c546cc71d489~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

ComponentConfig 也加一下：

![](./images/1a8f72b438454846923f793bf19ad04f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

addComponent 的时候从 config 取出组件的 desc：

![](./images/ac61688246154b8997e6f583c8e38857~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

然后展示的时候展示 desc 就好了：

左边的 MaterialItem 传入 desc：

![](./images/bafc0ef0bf6143619e2a82a015108444~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

显示的文案改成 desc：

![](./images/9654b9beb80f4eb38b35a26db657d489~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

HoverMask 和 SelectedMask 也显示 desc：

![](./images/9d82b8ff1ac74ab7870ac9db6eeb6884~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/55305d38beec4f2c96e7092e83f29357~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

测试下：

![](./images/32a8080a7dad4957b2e2b52b8235e078~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

没啥问题。

然后左边不需要展示页面组件，过滤下：

![](./images/8c6a96fd42c04b639d5634be4955888c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

![](./images/1c4c08907b28498eb9702e514844284d~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

还有，使用者是可能调整窗口大小的，这时候编辑框没有重新计算位置：

![](./images/c1f708b09ec94018ba1ebb7ea3f012de~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

做下处理：

![](./images/36eb87eff4964318a1bad5df6710e44c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

```javascript
useEffect(() => {
    const resizeHandler = () => {
      updatePosition();
    }
    window.addEventListener('resize', resizeHandler)
    return () => {
      window.removeEventListener('resize', resizeHandler)
    }
}, []);
```
这样就好了：


![](./images/a5aa09c955f44343aaa8b907e4fbd314~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image.png)

案例代码上传了[小册仓库](https://github.com/QuarkGluonPlasma/react-course-code/tree/main/lowcode-editor)，可以切换到这个 commit 查看：

```
git reset --hard f8f0cd06dc5c08f6df2f5dcb5d5327c4bb11d94b
```
## 总结

这节我们实现了点击时的编辑框。

首先在 components 的 store 里保存了 curComponentId。

然后在 EditArea 添加 click 事件，点击的时候拿到 data-component-id 设置到 curComponentId。

根据 curComponentId 渲染 SelectedMask。

SelctedMask 展示删除按钮，可以调用 deleteComponent 删除组件，展示父组件的列表，可以切换选中父组件。

渲染 SelectedMask 的时候要隐藏掉 HoverMask。

还要做 components 变化、window resize 的时候的 udpatePosition 处理。

此外，我们还把展示的 component.name 换成了 component.desc

这样，画布区的交互就完成了。
