# 第18章—组件实战：Watermark防删除水印组件

﻿很多网页会加上水印，用于版权标识、防止盗用等。

比如这样：

![](./images/c9f4a3d16e9566379a4b2249f15e0e8c.webp )

[ant design](https://ant.design/components/watermark-cn/) 和 [arco design](https://arco.design/react/components/watermark) 都提供了 Watermark 水印组件。

这种水印是咋实现的呢？

调试下就知道了：

arco design 的：

![](./images/389098d1cd09cba8cd95285d51221cd6.webp )

ant desigin 的：

![](./images/879ea6c939afdac365896c507365c756.webp )

首先，有一个 div 覆盖在需要加水印的区域，宽高 100%，绝对定位，设置 pointer-events:none 也就是不响应鼠标事件。

然后 background 设置 repeat，用 background image 平铺。

那这个 image 是什么呢？

点击这个 data url：

![](./images/d9f0e96d6c1c65ee4e2f6e7742276854.webp )

![](./images/b22a700c94c6309780155e540d7f2ed1.webp )

是个包含文字的图片。

而我们并没有传入图片作为参数：

![](./images/b475119679f19e4621de2692d1732119.webp )

![](./images/a6268bf45778a75156b218a5164949e4.webp )

所以说要用 canvas 画出来，做一些旋转，并导出 base64 的图片，作为这个 div 的背景就好了。

当然，也可以传入图片作为水印：

![](./images/b1a0a104404552fdfbf20439b13d0fcd.webp )

同样是用 canvas 画出来。

那怎么画呢？

根据[传入的参数](https://ant.design/components/watermark-cn#watermark)来画：

![](./images/553ad8007d495264f0b52f90105ee1ac.webp )

上面是 antd 的 Watermark 组件的参数。

可以传入宽高、旋转角度、字体样式、水印间距、水印偏移等。

虽然参数很多，但只是一些细节。

arco design 的 Watermark 组件画出的图片是上面的样子，所以 repeat 之后是这样的：

![](./images/96a0e4156603806f1697521e7d6a9837.webp )

如果仔细看你会发现 ant design 的 Watermark 组件是这样的：

![](./images/174b06a97115f94ce134a85f075fad9c.webp )

交错排列的。

这是因为它 canvas 画的内容就是交错的 2 个：

![](./images/76d309714f6f8d3dd4b054310c95718f.webp )

整体思路是很清晰的：**用 canvas 把文字或者图片画出来，导出 base64 的 data url 设置为 div 的重复背景，这个 div 整个覆盖在需要加水印的元素上，设置 pointer-events 是 none。**

此外，上节还讲过通过 MutationObserver 监听 dom 的修改，改了之后重新添加水印。

antd 就是这么做的：

![](./images/0e5571907546ecbd1473d674acbedd12.webp )

思路理清了，我们来写下代码：

```
npx create-vite
```

![](./images/67068a90a865b4ea3de544e1ab741dfe.webp )

去掉 index.css 和 StrictMode：

![](./images/3fa0e138604096b7d3a009ae419bad1a.webp )

然后写下 Watermark/index.tsx

```javascript
import { useRef, PropsWithChildren, CSSProperties, FC } from 'react';

export interface WatermarkProps extends PropsWithChildren {
    style?: CSSProperties;
    className?: string;
    zIndex?: string | number;
    width?: number;
    height?: number;
    rotate?: number;
    image?: string;
    content?: string | string[];
    fontStyle?: {
      color?: string;
      fontFamily?: string;
      fontSize?: number | string;
      fontWeight?: number | string;
    };
    gap?: [number, number];
    offset?: [number, number];
    getContainer?: () => HTMLElement;
}
  

const Watermark: FC<WatermarkProps>  = (props) => {

    const {
        className,
        style,
        zIndex,
        width,
        height,
        rotate,
        image,
        content,
        fontStyle,
        gap,
        offset
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);

    return props.children ? (
        <div
            className={className}
            style={style}
            ref={containerRef}
        >
            {props.children}
        </div>
    ) : null;
}

export default Watermark;
```
style、className 就不用解释了。

width、height、rotate、offset、gap 等都是水印的参数：

![](./images/f93c637238c6267579a94b2b81978a78.webp )

gap 是两个水印之间的空白距离。

offset 是水印相对于 container 容器的偏移量，也就是左上角的空白距离。

然后我们封装个 useWatermark 的自定义 hook 来绘制水印：

```javascript
import { useRef, PropsWithChildren, CSSProperties, FC, useCallback, useEffect } from 'react';
import useWatermark from './useWatermark';

export interface WatermarkProps extends PropsWithChildren {
    style?: CSSProperties;
    className?: string;
    zIndex?: string | number;
    width?: number;
    height?: number;
    rotate?: number;
    image?: string;
    content?: string | string[];
    fontStyle?: {
      color?: string;
      fontFamily?: string;
      fontSize?: number | string;
      fontWeight?: number | string;
    };
    gap?: [number, number];
    offset?: [number, number];
    getContainer?: () => HTMLElement;
}

const Watermark: FC<WatermarkProps>  = (props) => {

    const {
        className,
        style,
        zIndex,
        width,
        height,
        rotate,
        image,
        content,
        fontStyle,
        gap,
        offset
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);

    const getContainer = useCallback(() => {
        return props.getContainer ? props.getContainer() : containerRef.current!;
    }, [containerRef.current, props.getContainer]);

    const { generateWatermark } = useWatermark({
        zIndex,
        width,
        height,
        rotate,
        image,
        content,
        fontStyle,
        gap,
        offset,
        getContainer,
    });

    useEffect(() => {
        generateWatermark({
            zIndex,
            width,
            height,
            rotate,
            image,
            content,
            fontStyle,
            gap,
            offset,
            getContainer,
        });
    }, [
        zIndex,
        width,
        height,
        rotate,
        image,
        content,
        JSON.stringify(props.fontStyle),
        JSON.stringify(props.gap),
        JSON.stringify(props.offset),
        getContainer,
    ]);

    return props.children ? (
        <div
            className={className}
            style={style}
            ref={containerRef}
        >
            {props.children}
        </div>
    ) : null;
}

export default Watermark;
```

getContainer 默认用 containerRef.current，或者传入的 props.getContainer。

![](./images/d20e85fdeb040c47db989dbb6ae460fc.webp )

调用 useWatermark，返回 generateWatermark 方法。

然后当参数变化的时候，重新调用 generateWatermark 绘制水印。

getContainer 我们加了 useCallback 避免每次都变，对象参数（fontSize）、数组参数（gap、offset）用 JSON.stringify 序列化后再放到 deps 数组里：

![](./images/0bed09dab67d001ce4e4627d97f19935.webp )

然后来实现 useWatermark 的 hook。

新建 Watermark/useWatermark.ts

```javascript
import { useEffect, useState } from 'react';
import { WatermarkProps } from '.';
import { merge } from 'lodash-es';

export type WatermarkOptions = Omit<WatermarkProps, 'className' | 'style' | 'children'>; 

export default function useWatermark(params: WatermarkOptions) {
  const [options, setOptions] = useState(params || {});
  
  function drawWatermark() {

  }

  useEffect(() => {
    drawWatermark();
  }, [options]);

  return {
    generateWatermark: (newOptions: Partial<WatermarkOptions>) => {
      setOptions(merge({}, options, newOptions));
    },
    destroy: () => {
    },
  };
}
```
参数就是 WatermarkProps 去了 style、className、children。

把传入的参数保存到 options 的 state，根据它渲染。

调用返回的 generateWatermark 的时候设置 options 触发重绘。

这里用到了 lodash-es 包的 merge 来合并参数。

安装下：

```
npm install --save lodash-es

npm i --save-dev @types/lodash-es
```

然后来处理下 options，和默认 options 做下合并：

![](./images/a20cf04c21da6ae0cf16ede389f2a4b0.webp )

这里的 toNumber 会把第一个参数转为 number，如果不是数字的话就返回第二个参数的默认值：

![](./images/46d71af18f3deb82c029d2304c9beecc.webp )

具体的合并逻辑是这样的：

![](./images/e90954804d1a9507e32d4bd970a9d110.webp )


![image.png](./images/1e7e4c8ef6fa650d2e95056f7b78f286.webp )

先合并传入的 options

然后如果没有传入的会用默认值。

fontStyle 是默认 fontStyle 和传入的 fontStyle 的合并

width 的默认值，如果是图片就用默认 width，否则 undefined，因为后面文字宽度是动态算的。

offset 的默认值是 0。

因为处理完之后肯定是有值的，所以断言为 Required\<WatermarkOptions> 类型。

这个 Required 是去掉可选用的，相对的，Partial 是给属性添加可选修饰。

合并完之后，就拿到绘制的 options 了。

```javascript
import { useEffect, useRef, useState } from 'react';
import { WatermarkProps } from '.';
import { merge } from 'lodash-es';

export type WatermarkOptions = Omit<WatermarkProps, 'className' | 'style' | 'children'>; 

export function isNumber(obj: any): obj is number {
  return Object.prototype.toString.call(obj) === '[object Number]' && obj === obj;
}

const toNumber = (value?: string | number, defaultValue?: number) => {
  if(value === undefined) {
    return defaultValue;
  }
  if (isNumber(value)) {
    return value;
  }
  const numberVal = parseFloat(value);
  return isNumber(numberVal) ? numberVal : defaultValue;
};

const defaultOptions = {
  rotate: -20,
  zIndex: 1,
  width: 100,
  gap: [100, 100],
  fontStyle: {
    fontSize: '16px',
    color: 'rgba(0, 0, 0, 0.15)',
    fontFamily: 'sans-serif',
    fontWeight: 'normal',
  },
  getContainer: () => document.body,
};

const getMergedOptions = (o: Partial<WatermarkOptions>) => {
  const options = o || {};

  const mergedOptions = {
    ...options,
    rotate: options.rotate || defaultOptions.rotate,
    zIndex: options.zIndex || defaultOptions.zIndex,
    fontStyle: { ...defaultOptions.fontStyle, ...options.fontStyle },
    width: toNumber(options.width, options.image ? defaultOptions.width : undefined),
    height: toNumber(options.height, undefined)!,
    getContainer: options.getContainer!,
    gap: [
      toNumber(options.gap?.[0], defaultOptions.gap[0]),
      toNumber(options.gap?.[1] || options.gap?.[0], defaultOptions.gap[1]),
    ],
  } as Required<WatermarkOptions>;

  const mergedOffsetX = toNumber(mergedOptions.offset?.[0], 0)!;
  const mergedOffsetY = toNumber(mergedOptions.offset?.[1] || mergedOptions.offset?.[0], 0)!;
  mergedOptions.offset = [ mergedOffsetX, mergedOffsetY ];

  return mergedOptions;
};

export default function useWatermark(params: WatermarkOptions) {
  const [options, setOptions] = useState(params || {});

  const mergedOptions = getMergedOptions(options);

  function drawWatermark() {

  }

  useEffect(() => {
    drawWatermark();
  }, [options]);

  return {
    generateWatermark: (newOptions: Partial<WatermarkOptions>) => {
      setOptions(merge({}, options, newOptions));
    },
    destroy: () => {
    },
  };
}
```

有了 options，接下来创建 dom，开始绘制：

![](./images/d16abe230515f33e5928a105317d2b12.webp )
    
用 useRef 保存水印元素的 dom。
    
调用 getCanvasData 方法来绘制，返回 base64Url、width、height 这些信息。
    
生成水印的 dom 元素，挂载到 container 下，设置 style。

注意 background-size 是 gap + width、gap + height 算出的。

接下来只要实现 getCanvasData 方法，用 cavas 画出水印就好了。
    
```javascript
import { useEffect, useRef, useState } from 'react';
import { WatermarkProps } from '.';
import { merge } from 'lodash-es';

export type WatermarkOptions = Omit<WatermarkProps, 'className' | 'style' | 'children'>; 

export function isNumber(obj: any): obj is number {
  return Object.prototype.toString.call(obj) === '[object Number]' && obj === obj;
}

const toNumber = (value?: string | number, defaultValue?: number) => {
  if(!value) {
    return defaultValue;
  }
  if (isNumber(value)) {
    return value;
  }
  const numberVal = parseFloat(value);
  return isNumber(numberVal) ? numberVal : defaultValue;
};

const defaultOptions = {
  rotate: -20,
  zIndex: 1,
  width: 100,
  gap: [100, 100],
  fontStyle: {
    fontSize: '16px',
    color: 'rgba(0, 0, 0, 0.15)',
    fontFamily: 'sans-serif',
    fontWeight: 'normal',
  },
  getContainer: () => document.body,
};

const getMergedOptions = (o: Partial<WatermarkOptions>) => {
  const options = o || {};

  const mergedOptions = {
    ...options,
    rotate: options.rotate || defaultOptions.rotate,
    zIndex: options.zIndex || defaultOptions.zIndex,
    fontStyle: { ...defaultOptions.fontStyle, ...options.fontStyle },
    width: toNumber(options.width, options.image ? defaultOptions.width : undefined),
    height: toNumber(options.height, undefined)!,
    getContainer: options.getContainer!,
    gap: [
      toNumber(options.gap?.[0], defaultOptions.gap[0]),
      toNumber(options.gap?.[1] || options.gap?.[0], defaultOptions.gap[1]),
    ],
  } as Required<WatermarkOptions>;

  const mergedOffsetX = toNumber(mergedOptions.offset?.[0], 0)!;
  const mergedOffsetY = toNumber(mergedOptions.offset?.[1] || mergedOptions.offset?.[0], 0)!;
  mergedOptions.offset = [ mergedOffsetX, mergedOffsetY ];

  return mergedOptions;
};



const getCanvasData = async (
  options: Required<WatermarkOptions>,
): Promise<{ width: number; height: number; base64Url: string }> => {

};



export default function useWatermark(params: WatermarkOptions) {
  const [options, setOptions] = useState(params || {});

  const mergedOptions = getMergedOptions(options);
  const watermarkDiv = useRef<HTMLDivElement>();

  const container = mergedOptions.getContainer();
  const { zIndex, gap } = mergedOptions;

  function drawWatermark() {
    if (!container) {
      return;
    }

    getCanvasData(mergedOptions).then(({ base64Url, width, height }) => {
      const wmStyle = `
      width:100%;
      height:100%;
      position:absolute;
      top:0;
      left:0;
      bottom:0;
      right:0;
      pointer-events: none;
      z-index:${zIndex};
      background-position: 0 0;
      background-size:${gap[0] + width}px ${gap[1] + height}px;
      background-repeat: repeat;
      background-image:url(${base64Url})`;

      if (!watermarkDiv.current) {
        const div = document.createElement('div');
        watermarkDiv.current = div;
        container.append(div);
        container.style.position = 'relative';
      }

      watermarkDiv.current?.setAttribute('style', wmStyle.trim());
    });
  }

  useEffect(() => {
    drawWatermark();
  }, [options]);

  return {
    generateWatermark: (newOptions: Partial<WatermarkOptions>) => {
      setOptions(merge({}, options, newOptions));
    },
    destroy: () => {
    },
  };
}
```

接下来实现 getCanvasData 方法。

![](./images/cb457aaa5ae4ba82ad68214b006fc24a.webp )

创建个 canvas 元素，拿到画图用的 context。

封装 drawText、drawImage 两个方法，优先绘制 image。

然后封装个 configCanvas 方法，用来设置 canvas 的宽高、rotate、scale：

![](./images/3b9242721f686656c38a579824c659e7.webp )

宽高同样是 gap + width、gap + height。

用 tanslate 移动中心点到 宽高的一半的位置再 schale、rotate。

因为不同屏幕的设备像素比不一样，也就是 1px 对应的物理像素不一样，所以要在单位后面乘以 devicePixelRatio。

我们设置了 scale 放大 devicePixelRatio 倍，这样接下来绘制尺寸就不用乘以设备像素比了。

```javascript
const getCanvasData = async (
  options: Required<WatermarkOptions>,
): Promise<{ width: number; height: number; base64Url: string }> => {

  const { rotate, image, content, fontStyle, gap } = options;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  const ratio = window.devicePixelRatio;

  const configCanvas = (size: { width: number, height: number }) => {
    const canvasWidth = gap[0] + size.width;
    const canvasHeight = gap[1] + size.height;

    canvas.setAttribute('width', `${canvasWidth * ratio}px`);
    canvas.setAttribute('height', `${canvasHeight * ratio}px`);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    ctx.translate((canvasWidth * ratio) / 2, (canvasHeight * ratio) / 2);
    ctx.scale(ratio, ratio);

    const RotateAngle = (rotate * Math.PI) / 180;
    ctx.rotate(RotateAngle);
  };

  const drawText = () => {
    
  };

  function drawImage() {
  
  }
  
  return image ? drawImage() : drawText();
};
```

先来实现 drawImage：

```javascript
function drawImage() {
  return new Promise<{ width: number; height: number; base64Url: string }>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';

    img.src = image;
    img.onload = () => {
      let { width, height } = options;
      if (!width || !height) {
        if (width) {
          height = (img.height / img.width) * +width;
        } else {
          width = (img.width / img.height) * +height;
        }
      }
      configCanvas({ width, height });

      ctx.drawImage(img, -width / 2, -height / 2, width, height);
      return resolve({ base64Url: canvas.toDataURL(), width, height });
    };
    img.onerror = () => {
      return drawText();
    };
  });
}
```
new Image 指定 src 加载图片。

onload 的时候，对于没有设置 width 或 height 的时候，根据图片宽高比算出另一个值。

然后调用 configCanvas 修改 canvas 的宽高、缩放、旋转。

之后在中心点绘制一张图片，返回 base64 的结果。

当加载失败时，onerror 里绘制文本。

这里的 crssOrign 设置 anonymous 是跨域的时候不携带 cookie，而 refererPolicy 设置 no-referrer 是不携带 referer，都是安全相关的。

然后实现 drawText：

```javascript
const drawText = () => {
  const { fontSize, color, fontWeight, fontFamily } = fontStyle;
  const realFontSize = toNumber(fontSize, 0) || fontStyle.fontSize;

  ctx.font = `${fontWeight} ${realFontSize}px ${fontFamily}`;
  const measureSize = measureTextSize(ctx, [...content], rotate);

  const width = options.width || measureSize.width;
  const height = options.height || measureSize.height;

  configCanvas({ width, height });

  ctx.fillStyle = color!;
  ctx.font = `${fontWeight} ${realFontSize}px ${fontFamily}`;
  ctx.textBaseline = 'top';

  [...content].forEach((item, index) => {
    const { height: lineHeight, width: lineWidth } = measureSize.lineSize[index];

    const xStartPoint = -lineWidth / 2;
    const yStartPoint = -(options.height || measureSize.originHeight) / 2 + lineHeight * index;

    ctx.fillText(
      item,
      xStartPoint,
      yStartPoint,
      options.width || measureSize.originWidth
    );
  });
  return Promise.resolve({ base64Url: canvas.toDataURL(), height, width });
};
```
fontSize 转为 number。

如果没有传入 width、height 就自己计算，这个 measureTextSize 待会实现。

设置 textBaseline 为 top，顶部对齐。

然后依次绘制文字。

绘制文字要按照坐标来，在 measureTextSize 里计算出每一行的 lineSize，也就是行高、行宽。

在行宽的一半的地方开始绘制文字，行内每个文字的位置是行高的一半 * index。

然后实现 measureTextSize 方法：

```javascript
const measureTextSize = (
  ctx: CanvasRenderingContext2D,
  content: string[],
  rotate: number
) => {
  let width = 0;
  let height = 0;
  const lineSize: Array<{width: number, height: number}> = [];

  content.forEach((item) => {
    const {
      width: textWidth,
      fontBoundingBoxAscent,
      fontBoundingBoxDescent,
    } = ctx.measureText(item);

    const textHeight = fontBoundingBoxAscent + fontBoundingBoxDescent;

    if (textWidth > width) {
      width = textWidth;
    }

    height += textHeight;
    lineSize.push({ height: textHeight, width: textWidth });
  });

  const angle = (rotate * Math.PI) / 180;

  return {
    originWidth: width,
    originHeight: height,
    width: Math.ceil(Math.abs(Math.sin(angle) * height) + Math.abs(Math.cos(angle) * width)),
    height: Math.ceil(Math.abs(Math.sin(angle) * width) + Math.abs(height * Math.cos(angle))),
    lineSize,
  };
};
```
ctx.measureText 是用来测量文字尺寸的。

fontBoudingAscent 是 baseline 到顶部的距离，而 fontBoundingBoxDescent 是到底部的距离：

![](./images/1a0a2e44126f59961615a1d156cb15e2.webp )

加起来就是行高。

然后如果有旋转的话，要用 sin、cos 函数算出旋转后的宽高。

这样经过计算和绘制，文字和图片的水印就都完成了。

我们测试下：

改下 App.tsx
```javascript
import Watermark from "./Watermark";

const App = () => {
  return <Watermark
    content={['测试水印', '神说要有光']}
  >
   <div style={{height: 800}}>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
   </div>
  </Watermark>
};

export default App;
```

![](./images/e68f82287bdfffe252a4fa7fb6bd825b.webp )

把 gap 设为 0：

```javascript
import Watermark from "./Watermark";

const App = () => {
  return <Watermark
    content={['测试水印', '神说要有光']}
    gap={[0, 0]}
    fontStyle={{
        color: 'green'
    }}
  >
   <div style={{height: 800}}>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
   </div>
  </Watermark>
};

export default App;
```
也没问题：

![](./images/a0f0e88c7c9056a0e36a998eb2928721.webp )

只是现在 offset 还没有支持，也就是左上角的空白距离。

这个就是改下 left、top 的值就好了，当然，width、height 也要从 100% 减去这块距离。

![](./images/14d7a72effd7232a78bffae158fd7aa7.webp )

```javascript
const offsetLeft = mergedOptions.offset[0] + 'px';
const offsetTop = mergedOptions.offset[1] + 'px';

const wmStyle = `
width:calc(100% - ${offsetLeft});
height:calc(100% - ${offsetTop});
position:absolute;
top:${offsetTop};
left:${offsetLeft};
bottom:0;
right:0;
pointer-events: none;
z-index:${zIndex};
background-position: 0 0;
background-size:${gap[0] + width}px ${gap[1] + height}px;
background-repeat: repeat;
background-image:url(${base64Url})`;
```
测试下：

```javascript
import Watermark from "./Watermark";

const App = () => {
  return <Watermark
    content={['测试水印', '神说要有光']}
    gap={[0, 0]}
    offset={[50, 100]}
    fontStyle={{
        color: 'green'
    }}
  >
   <div style={{height: 800}}>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
    <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quos quod deserunt quidem quas in rem ipsam ut nesciunt asperiores dignissimos recusandae minus, eaque, harum exercitationem esse sapiente? Eveniet, id provident!</p>
   </div>
  </Watermark>
};

export default App;
```

![](./images/86e39740ddaf8ec70fb9d40a41feb343.webp )

这样水印组件就完成了。

但现在的水印组件作用并不大，因为只要打开 devtools 就能轻易删掉。

![](./images/4ff112e9694b26a8e8f8321693b49b73.gif )

我们要加上防删功能，前面讲过，用 MutationObserver：

![](./images/982e354399238a8eea389f56b3a6f349.webp )

![](./images/e956685529534c103ef2e5bb4319ffcd.webp )

创建完水印节点后，首先 disnonnect 去掉之前的 MutationObserver 的监听，然后创建新的 MutationObserver 监听 container 的变动。

```javascript
export default function useWatermark(params: WatermarkOptions) {
  const [options, setOptions] = useState(params || {});

  const mergedOptions = getMergedOptions(options);
  const watermarkDiv = useRef<HTMLDivElement>();
  const mutationObserver = useRef<MutationObserver>();

  const container = mergedOptions.getContainer();
  const { zIndex, gap } = mergedOptions;

  function drawWatermark() {
    if (!container) {
      return;
    }

    getCanvasData(mergedOptions).then(({ base64Url, width, height }) => {

      const offsetLeft = mergedOptions.offset[0] + 'px';
      const offsetTop = mergedOptions.offset[1] + 'px';

      const wmStyle = `
      width:calc(100% - ${offsetLeft});
      height:calc(100% - ${offsetTop});
      position:absolute;
      top:${offsetTop};
      left:${offsetLeft};
      bottom:0;
      right:0;
      pointer-events: none;
      z-index:${zIndex};
      background-position: 0 0;
      background-size:${gap[0] + width}px ${gap[1] + height}px;
      background-repeat: repeat;
      background-image:url(${base64Url})`;

      if (!watermarkDiv.current) {
        const div = document.createElement('div');
        watermarkDiv.current = div;
        container.append(div);
        container.style.position = 'relative';
      }

      watermarkDiv.current?.setAttribute('style', wmStyle.trim());

      if (container) {
        mutationObserver.current?.disconnect();

        mutationObserver.current = new MutationObserver((mutations) => {
          const isChanged = mutations.some((mutation) => {
            let flag = false;
            if (mutation.removedNodes.length) {
              flag = Array.from(mutation.removedNodes).some((node) => node === watermarkDiv.current);
            }
            if (mutation.type === 'attributes' && mutation.target === watermarkDiv.current) {
              flag = true;
            }
            return flag;
          });
          if (isChanged) {
            watermarkDiv.current = undefined;
            drawWatermark();
          }
        });

        mutationObserver.current.observe(container, {
          attributes: true,
          subtree: true,
          childList: true,
        });
      }
    });
  }

  useEffect(() => {
    drawWatermark();
  }, [options]);

  return {
    generateWatermark: (newOptions: Partial<WatermarkOptions>) => {
      setOptions(merge({}, options, newOptions));
    },
    destroy: () => {
    },
  };
}
```
上节讲过，MutationObserver 可以监听子节点的变动和节点属性变动：

![](./images/f6d9852d32a4d7ed1353a46e6b012c22.webp )

![](./images/4bd5644d7506ef47a4149b02d15a947b.webp )

![](./images/457e87ae3d93ebfbd06fb768781787b7.webp )

所以我们判断水印是否删除是通过判断是否修改了 watermark 节点的属性，是否增删了 watermark 节点：

![](./images/934234511d734b36093b5af78c43e886.webp )

是的话，就把 watermarkDiv.current 置空然后重新绘制。

测试下：

![](./images/51efac33d0dc06d6eefb489b383e5197.gif )

现在修改节点属性，或者删掉水印节点的时候，就会绘制一个新的。

这样，就达到了防止删除水印的功能。

案例代码上传了[小册仓库](https://github.com/QuarkGluonPlasma/react-course-code/tree/main/watermark-component)

## 总结

这节我们实现了 Watermark 水印组件。

水印的实现原理就是加一个和目标元素宽高一样的 div 覆盖在上面，设置 pointer-events:none 不响应鼠标事件。

然后背景用水印图片 repeat 实现。

这个水印图片是用 canvas 画的，传入文字或者图片，会计算 gap、文字宽高等，在正确的位置绘制出来。

之后转成 base64 之后设置为 background-image。

此外，还要支持防删除功能，也就是用 MutationObserver 监听水印节点的属性变动、节点删除等，有变化就重新绘制一个。

这样，我们就实现了有防删功能的 Watermark 水印组件。
