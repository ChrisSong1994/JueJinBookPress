# 第38章—CSS宽高比：aspect-ratio

﻿[Web 布局](https://s.juejin.cn/ds/iJE2d3Ye/)最重要的是灵活性。元素可以根据内容的大小调整尺寸，无论是不同长度的文本还是不同大小的图片，这是一个受欢迎的功能，尤其是在[响应式 Web 设计时代](https://juejin.cn/book/7161370789680250917/section/7165845190614188062)，因为这种灵活性首先使构建响应式 Web 布局成为可能。但是，有时我们需要具有固定宽高比的元素，例如，如果我们想通过 `iframe` 嵌入视频或[显示裁剪为固定宽高比的图片](https://juejin.cn/book/7199571709102391328/section/7199845663143067660)，而不管其原始尺寸如何。简单地说，在响应式 Web 布局中，让元素的宽度和高度之间保持一致的比例是至关重要的。在还没有 `aspect-ratio` 属性之前，我们一直是使用垂直方向的 `padding` 让元素的宽度和高度保持一致的比例，这是一种 Hack 手段。

现在，有了 `aspect-ratio` 属性之后，让元素保持一个致的宽高比，就要容易得多了。一旦你理解了宽高以及如何定义它们，你就能够做各种各样的事情，比如创建一个 `n x n` 方形网格布局、响应式调整嵌入式媒体的大小、为图片保留空间等。在这节课中，我将讨论什么是宽高比，我们过去是如何做的，以及新方法是什么以及新方法在使用过程中需要注意的一些事项。

让我们开始吧！

## 什么是宽高比？

简单地说，宽高比就是一个比（或比值）。[维基百科是这样解释的](https://en.wikipedia.org/wiki/Ratio)：“**在数学中，比是两个非零数之间的比较关系**”。例如，在一个班级中有 `21` 位男生和 `9` 位女生，那么男生和女生的比例是 `21` 比 `9` ，即 `21:9` 。

![img](./images/5bc788036775be291a82b1c89e70d156.webp )

在 Web 中，宽高比描述了元素宽度和高度之间的关系，并以比例表示，即 `宽:高` 或 `x:y` 。摄影中最常见的宽高比是 `4:3` 和 `3:2` ，而视频的宽高比往往是 `16:9` 。

![img](./images/de14d188cf525651aa1891cd1708eba4.webp )

直观地说，宽高比为 `w:h` ，表示元素的宽度为 `w` 个单位，高度为 `h` 个单位。如上图所示，如果图片的宽高比为 `4:3` ，且宽度为 `400px` ，那么我们就知道它的高度必须是 `300px` 。

换句话说，我们可以为 `4:3` 的宽高比创建的最小框中一个 `4 x 3` 的框，其中宽度是 `4` 个单位，高度是 `3` 个单位，假设你使用的单位是 `px` 单位，那么 `4:3` 的宽高比创建的最小框是一个 `4px x 3px` 的框。当此框的高度批比例调整为其宽度时，我们将得到一个遵循其宽高比的框：

![img](./images/ba8313e4537452c95bd6a77706e8ee55.webp )

上图中的虚线框都是按 `4:3` 的比例在调整大小。现在，让我们想象一下，如果虚线框中有一图片：

![img](./images/73edb0820953ac949cd423aec8312767.webp )

注意，无论大小如何，图片细节都被保留下来。

简单地说，随着响应式设计的出现，维护宽高比对于 Web 开发人员来说变得越来越重要，特别是当图片尺寸不同，元素大小根据可用空间变化时。

## 实现宽高比的几种 Hack

在还没有 `aspect-ratio` 属性之前，Web 开发者需要使用一些 Hack 手段来实现宽高比的效果。

### 技巧一：垂直内距（padding-top 或 padding-bottom）

在 Web 上伪造宽高比的一个众所周知且长期存在的方法是**滥用垂直内距**。通过将元素的高度设置为 `0` ，并将 `padding-top` 或 `padding-bottom` 属性的值设置为百分比的值，可以强制元素框具有固定的宽高比。

这种方法之所以有效，是因为元素的 `padding` 属性的百分比值是根据元素的宽度来计算的。

> 注意，垂直内距（`padding-top` 或 `padding-bottom`）的百分比值计算并不总是根据元素宽度计算。例如，在 Flexbox 布局中，对于 Flex 项目的内距百分比值会根据其高度而不是宽度进行解析。这方面的知识已经超出这节课的范畴，所以不在这里做过多的阐述。

如果我们想要一个 `16:9` 的宽高比，我们可以将外部容器的 `padding-top` 或 `padding-bottom` 设置为 `56.25%` （因为 `100% / 16 * 9 = 56.25%`）：

![img](./images/3c1905963174b62c825aef4bf4ba0022.webp )

```HTML
<aspectratio-container><!-- padding-top 或 padding-bottom + height:0 --> 
    <aspectratio-content></aspectratio-content> <!-- 绝对定位，inset: 0 -->
</aspectratio-container>
```

```CSS
aspectratio-container {
    position: relative;
    width: 100%;
    height: 0; /* 这个很重要 */
    padding-top: 56.25%; /* 或者 padding-bottom: 56.25%, 100% ÷ 16 × 9 = 56.25% */
}
​
aspectratio-content {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
}
```

![img](./images/d1dc3551cf933610a4898bc9a885d5d0.gif )

> Demo 地址：<https://codepen.io/airen/full/qBLbjBw>

如果你讨厌做数学计算，那么可以使用 `calc()` 函数来做数学计算。上面示例中对应的数学计算是 `100% ÷ 16 × 9` ，换成 CSS 的 `calc()` 函数可以是 `calc(100% / 16 * 9)` 或者 `calc(100% ``/ (16 ``/ 9``)``)`。如果你熟悉 CSS 自定义属性，那么我们还可以用一个自定义属性来定义元素的宽高比：

```HTML
<aspectratio-container style="--ratio: 16 / 9"><!-- padding-top 或 padding-bottom + height:0 --> 
    <aspectratio-content></aspectratio-content> <!-- 绝对定位，inset: 0 -->
</aspectratio-container>
```

```CSS
aspectratio-container {
    position: relative;
    width: 100%;
    height: 0;
    padding-top: calc(100% / (var(--ratio))); /* 或者设置 padding-bottom */
}
​
aspectratio-content {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
}
```

![img](./images/e168063545e5f631501438151c51d56d.gif )

> Demo 地址：<https://codepen.io/airen/full/eYbJRdL>

### 技巧二：生成内容的垂直内距

与第一种技术类似，但又有些不同。技巧二将垂直内距 `padding-top` 或 `padding-bottom` 设置在伪元素 `::before` 或 `::after` 上，通过伪元素来撑开容器的高度。

```CSS
aspectratio-container {
    position: relative;
    
    &::after {
        content:"";
        display: block;
        width: 1px;
        padding-top: calc(100% / (var(--ratio)));
        margin-right: -1px;
        position: relative;
        z-index: -1;
    }
}
```

![img](./images/ecd9398a37be6e67fe93e1393ac561de.gif )

> Demo 地址：<https://codepen.io/airen/full/NWexggw>

这种技巧有一个缺陷存在，当 `aspectratio-content` 内容的高度大于容器根据宽高比计算出来的高度时，将会以 `aspectratio-content` 内容实际高度为准，并且会撑高其容器的高度，使得整个宽高比换效：

![img](./images/b1bd9898f57a215fd5abaa37db0fb7b3.gif )

> Demo 地址：<https://codepen.io/airen/full/bGOERaY>

如果希望避免这个现象的出现，则需要像技巧一一样，将 `aspectratio-content` 设置为绝对定位：

```CSS
aspectratio-container {
    position: relative;
    
    &::after {
        content:"";
        display: block;
        width: 1px;
        padding-top: calc(100% / (var(--ratio)));
        margin-right: -1px;
        position: relative;
        z-index: -1;
    }
    
    & aspectratio-content {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
    }
}
```

![img](./images/64ba6792143d65e4f039d95535821ec6.gif )

> Demo 地址：<https://codepen.io/airen/full/YzdwQvW>

容器的宽高比能正常工作，只是内容溢出容器。现在只需要使用 `overflow` 属性来处理溢出的内容即可。有关于内容溢出更详细的介绍可以阅读《[溢出常见问题与排查](https://juejin.cn/book/7199571709102391328/section/7213705145954074679)》。

## 为什么宽高比有用？

在 CSS 中，宽高比特别有用，因为它们允许我们响应式地缩放元素（比如图片），以便它们始终保持其尺寸而不会变形。

简单地说，宽高比允放我们改变元素的一个维度（例如，它的宽度），而另一个维度相应地缩放，而我们不必去做那些数学计算。这使得宽高比在创建一个响应式布局时尤其有用。

我们来看一个使用 RAM 构建的响应式布局，在这个示例中，每张卡片都有一个缩略图，并且每张卡片的缩略图的宽度和高度上相等。假设卡片缩略图的宽高比是 `16 : 9` ，那么卡片缩略图在随着浏览器视窗宽度调整时，它的高度也会根据宽高比自动匹配。

```HTML
<div class="cards">
    <div class="card">
        <figure>
            <img src="card-thumbnail.jpg" alt="card thumbnail" />
        </figure>
        <h3>Muffins Recipe</h3>
        <p>Servings: 3</p>    
    </div>
    <!-- 其它 Card -->
</div>
```

```CSS
.cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100% - 2rem, 260px), 1fr));
    gap: 1rem;
}
​
.card img {
    display: block;
    max-width: 100%;
    height: auto;
}
```

![img](./images/bba2523fcaa58652ba387f57dcaadda8.gif )

> Demo 地址：<https://codepen.io/airen/full/dywGzMv>

它可以很好的工作。但是，由于某些原因，上传的图片尺寸大小不一致，注意第一行中卡片高度都不相等。

![img](./images/7cca1fcf3f36d36154f4691059f34e7d.webp )

你可能会想着给图片指定一个固定高度和 `object-fit:cover` 来避免这个现象：

```CSS
.card img {
    width: 100%;
    
    height: 200px;
    object-fit: cover;
}
```

![img](./images/c3867ef073265deefcc773aba781d24e.webp )

> Demo 地址：<https://codepen.io/airen/full/wvRMqgY>

问题真的解决了？正如上图所示，这种解决方案在响应式布局中，其效果看起来并不太好。在桌面端上，固定高度的图片的左右两侧裁剪过多，而在移动端上，图片左右两侧裁剪又过少。所有这些都是由于使用了固定的高度所引起的。虽然我们可以使用不同媒体查询手动调整图片高度，但这并不是一个实用的解决方案。

就这个示例而言，卡片缩略图只要在不同的浏览器视口下能保持一致的大小，就可以避免因上传图片尺寸不一致而导致卡片高度不一致的现象。我们只需要给图片设置一个固定的宽高比即可，比如图片的宽高比是 `21:9` ，即 `--ratio: 21 / 9` 。我们可以使用上面提到的 Hack 手段实现它：

```CSS
.card {
    --ratio: 21 / 9;
​
    & figure {
        position: relative;
        width: 100%;
        height: 0;
        padding-top: calc(100% / (var(--ratio)));
    }
​
    & img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}
```

通过上面的代码，我们已经定义了卡片缩略图的容器（`figure`）的高度取决于它的宽度，而 `figure` 的宽度又取决于它的父容器 `.card` 。由于示例整体布局采用的是 RAM 布局技术，这样一来，`.card` 的宽度和浏览器视窗宽度是关联在一起的。也就是说，卡片缩略图的容器的宽度会随着浏览器视窗宽度做出响应，从而它的高度也会根据宽高比做出相应的响应。

此外，卡片缩略图 `img` 是绝对定位的，它的宽高和其父容器 `figure` 的宽高完全相等，并带有 `object-fit: cover` ，用于上传不同大小的图片：

![img](./images/ba5ac797df2377528e78eb4c139ef84f.gif )

> Demo 地址：<https://codepen.io/airen/full/YzdwxOa>

注意，卡片大小如何变化，卡片缩略图的宽高比始终是保持一致的。你也可以尝试着调整缩略图的宽高比：

![img](./images/a71737f668d2974a4ea77d2e166814dd.gif )

> Demo 地址：<https://codepen.io/airen/full/QWzyMXW>

虽然图片上使用宽高比是最典型的例子，但宽高比并不是只用于图片上。你还可以使用宽高比来做一些事情，例如：

-   创建响应式 `iframe` ，其中它们是父元素宽度的 `100%` ，高度应保持特定的视窗比例
-   为图片、视频或嵌入式媒体创建固有的占位符容器，以防止在项目加载和占用空间时重新布局
-   为交互式数据可视化或 SVG 动画创建统一的响应空间
-   为卡片或日历等多元素组件创建统一的响应空间
-   为不同尺寸的多个图片创建统一的响应空间

## 使用 aspect-ratio 设置宽高比

众所周知，[Web 上的图片通常具有自然的宽高比](https://juejin.cn/book/7199571709102391328/section/7199845663143067660)，CSS 布局算法在调整元素大小时会试图保留该宽高比。例如一张 `800px x 600px` 的图片，其自然宽高比是 `800:600` ，即 `4:3` ：

![img](./images/fadddf506526dcaac46ed5c5b81bf8a3.webp )

假设该图片被用于一个 `50vw` 宽的容器中，那么布局算法会根据图片的自然宽高比来调整图片渲染尺寸：

![img](./images/638e25e26fe542ab4a4dd01dbc5fb45c.webp )

CSS 的 `aspect-ratio` 属性允许为未被替换的元素指定此行为，以及更改被替换元素的有效宽高比。简单地说，现在我们可以直接使用 `aspect-ratio` 属性为元素框指定宽高比，这个宽高比可以计算出元素的尺寸。换句话说，现在可以不用垂直内距就可以给元素指定宽高比。

比如前面的卡片示例，我们可以使用 `aspect-ratio` 属性给卡片缩略图的容器指定宽高比（替代以前的 Hack 方法）：

```CSS
/* 宽高比 Hack */
figure {
    position: relative;
    height: 0;
    padding-top: calc(100% / (var(--ratio)));
    
    & img {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}
​
/* aspect-ratio */
figure {
    position: relative;
    aspect-ratio: var(--ratio);
    
    & {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}
```

![img](./images/63f6602386b279c5c3dd6e9bfeedefc7.gif )

> Demo 地址：<https://codepen.io/airen/full/xxmZMoy>

假设卡片的宽度是 `300px` ，当 `figure` 的宽高比是 `21:9` 时，卡片缩略图的高度将是 `300px ÷ 21 × 9 = 128.57px` 。

是不是很简单？那么 `aspect-ratio` 是怎么一回事呢？在阐述 `aspect-ratio` 之前，我们有几个概念需要先理解。

### 可替换元素

**[可替换元素](https://www.w3.org/TR/css-display-3/#replaced-element)** 指的是内容不在 CSS 格式化模型范围内的元素，例如我们熟悉的 `<img>` 、`<iframe>` 和 `<video>` 等元素。HTML 的 `<img>` 元素的内容经常被它的 `src` 属性指定的图片所替代。被替换的元素通常具有固有的尺寸，即固有的宽度、固有的高度和固有的宽高比（它们也被称为内在尺寸，稍后会介绍）。

CSS 格式化模型并不会考虑可替换元素的内容，不过，它们的内在尺寸被用于各种布局计算。也就是说，它的渲染由 CSS 模型决定。或者简单地说，CSS 布局算法在调整可替换元素大小时会试图保留其固有的宽高比（也就是其内在尺寸的宽高比）。

### 内在尺寸

[内在尺寸](https://juejin.cn/book/7161370789680250917/section/7161625601713897508)是指内在高度（Intrinsic Height）、内在宽度（Intrinsic Width）和内在宽高比（即内在宽度与内在高度的比率）的集合。对于给定的对旬，每一个都可能存在，也可能不存在。这些内在尺寸代表了对象本身的首选大小（也称自然大小）。也就是说，它们不是使用对象的上下文的函数。CSS 通常没有定义如何找到内在的尺寸。

通常情况下，可替换元素具有所有内在尺寸（宽度、高度和宽高比），比如 `img` 元素，而 SVG 图像可能只有一个固有的宽高比，也可能只有固有的宽度和高度。另外，CSS 中的渐变（`<gradient>`）是一个根本没有内在尺寸的对象。

其实，对象不会只有两个内在的尺寸，因为任意两个尺寸都会自动定义第三个尺寸。继续拿 `img` 为例：

-   当知道 `img` 的内在宽度和内在高度时，就能计算出其内在的宽高比，即 `width / height`
-   当知道 `img` 的内在宽度和内在的宽高比时，就能计算出其内在的高度，即 `height = width / ratio`
-   当知道 `img` 的内在高度和内在的宽高比时，就能计算出其内在的宽度，即 `width = ratio * height`

上述这些行为一般存在于可替换元素上。对于不可替换的元素，我们就需要使用 CSS 的 `aspect-ratio` 来实现，往往这些行为对于构建响应式 Web 布局又至关重要。

### <ratio> 值类型

`<ratio>` 是 CSS 值类型之一，它被称为比值（或比率值），表示两个数值的比值，例如我们这节课所说的宽高比，即 `w:h` 。其语法规则如下：

```
<ratio> = <number [0,∞]> [ / <number [0,∞]> ]?
```

`<ratio>` 中的第二个 `<number>` 是一个可选值，如果省略，那么它的值为 `1` 。

通常情况下，`<ratio>` 总是两个 `<number>` 出现，并且两个值之间有 `/` 分隔。它的计算值是提供一对数字值，例如 `16/9` 。

-   如果 `<ratio>` 中的任何一个数字值是 `0` 或 `∞` （无穷大），它表示一个退化的比率，它将不会做任何事情
-   如果要比较两个 `<ratio>` ，则先分别对每个 `<ratio>` 的值进行计算， `<ratio>` 的第一个数字值除以第二个数字值，然后比较其计算值。例如 `3/2` 小于 `2/1` ，因为 `3/2` 对应的是 `3 ÷ 2 = 1.5`，`2/1` 对应的是`2 ÷ 1 = 2`

有了这个概念之后，我们可以接着继续往下聊 `aspect-ratio` 属性。

### CSS 的 aspect-ratio

CSS 的 `aspect-ratio` 语法规则很简单：

```CSS
aspect-ratio: auto || <ratio>
```

其默认值为 `auto`。该属性可以运用于除了内联框和内部 `ruby` 或表格框之外的所有元素。

`aspect-ratio` 属性为元素框设置一个首选宽高比，将用于计算元素框的大小。其值的含义是：

-   **`auto`** ：可替换元素使用该宽高比替代其内在的宽度高比，元素盒子没有首选的宽高比。涉及内在宽度高比的尺寸计算总是与内容框（`content-box`）尺寸一起工作
-   **`<ratio>`** ：元素框的首选宽高比是 `<ratio>` 指定的宽高比率。涉及首选宽高比的尺寸计算与 `box-sizing` 指定的盒子尺寸一起工作
-   **`auto && <ratio>`** ：如果同时指定 `auto` 和 `<ratio>`，则首选的宽高比是指定的宽高比（即 `<ratio>`），除非它是具有固有宽高比的可替换元素，在这种情况下使用该宽高比。在所有情况下，涉及此宽高比的大小计算总是与 `content-box` 一起工作

我们单独把 `<ratio>` 值拎出来说。比如上面的示例，`aspect-ratio` 设置的值是 `<ratio>` 类型，即 `16 / 9`。而 `<ratio>` 类型的值可以是：

-   它通常是由 `/` 分隔线分隔的两个数字组成，比如 `16 / 9`。其中第一个参数指定元素宽度，第二个参数指定元素高度
-   它还允许只传入一个数字，比如 `1.7777777`（即 `16 ÷ 9 ≈ 1.7777777`）。在这种情况下，第二个参数默认为 `1`
-   不允许为这两个数字都传入 `0`
-   分隔线 `/` 前后的空格不是必须的，因此 `16/9` 也是一个有效的 `<ratio>` 值，但这里更建议在 `/` 分隔线前后添加一个空格

## CSS aspect-ratio 的使用

在 CSS 中，下面这些属性都可以用来设置元素盒子框的尺寸大小：

![img](./images/8d3d789ddb3bc33467d45b932dd10253.webp )

> 注意，CSS 的盒模型相关的属性，例如 `padding` 、`border` 以及 `box-sizing` 都将会影响元素框的尺寸大小，为了不将问题复杂化，在这里不考虑这些因素，并且将 `box-sizing` 的值默认为 `border-box` 。除此之外，下面的示例中将基于物理尺寸展开，相应的逻辑属性有同样的功能。

CSS 的 `aspect-ratio` 属性也可以用来计算元素框的尺寸。但首先要明确一点的是，**CSS 的** **`aspect-ratio`** **属性的使用和元素类型、盒子框类型以及运用场景有着紧密的联系**。我们先从最简单的开始。

### aspect-ratio 参与元素框尺寸的计算

`aspect-ratio` 属性是可以用来计算出元素框尺寸的，即将根据所设置的宽度或高度计算框的尺寸：

-   当元素显式设置了宽度 `width` 和宽高比 `ratio` ，那么就可以计算出元素的高度 `height = width / ratio`
-   当元素显式设置了高度 height 和宽高比 `ratio` ，那么就可以计算出元素的宽度 `width = height * ratio`

这是因为元素的宽高比 `ratio` 计算公式始终是 `ratio = width / height` 。例如：

```CSS
.element {
    --ratio: 16 / 9;
    width: 20vw;
    aspect-ratio: var(--ratio);/* height = width / ratio = 20vw / var(--ratio)*/
}
​
.element {
    --ratio: 16 / 9;
    height: 20vh;
    aspect-ratio: var(--ratio); /* width = height * ratio = 20vh * var(--ratio) */
}
```

![img](./images/a3f8e7d0f012a5166d592e32aab7964a.gif )

> Demo 地址：<https://codepen.io/airen/full/Yzdwbgb>

### aspect-ratio + width + height = 🚫

上面的示例告诉我们，`aspect-ratio` 属性可以基于指定的宽度或高度来计算元素框的尺寸，但它有一个前提条件，元素的宽度或高度只有一个可以显式设置，另一个应该为 `auto` 。这是因为，`aspect-ratio` 是一个弱声明，虽然它定义了元素框的宽度和高度之间的比率，但如果元素框的宽度（`width`）和高度（`height`）指定的值是非 `auto` 时，浏览器则会使用显式指定的 `width` 和 `height` 值，并且会忽略 `aspect-ratio` 。

注意，元素的宽度和高度可以通过显式指定 `width` 和 `height` （或其相对应的逻辑属性） 属性值来设定，或者通过其他方式来指定，我们将在下面看到。

我们来看一个具体的示例：

```CSS
/* 显式指定 aspect-ratio, width 和 height 为 auto （未显式指定） */
.element {
    --ratio: 16 / 9;
    aspect-ratio: var(--ratio);
}
​
/* 显式指定 aspect-ratio 和 width, height 为 auto（未显式指定），aspect-ratio + width */
.element {
    --ratio: 16 / 9;
    width: 40vw;
    aspect-ratio: var(--ratio);
}
​
/* 显式指定 aspect-ratio 和 height, width 为 auto (未显式指定)， aspect-ratio + height*/
.element {
    --ratio: 16 / 9;
    height: 40vh;
    aspect-ratio: var(--ratio);
}
​
/* 显式指定 aspect-ratio、width 和 height ， aspect-ratio + width + height */
.element {
    --ratio: 16 / 9;
    width: 40vw;
    height: 40vh;
    aspect-ratio: var(--ratio);
}
```

![img](./images/d707c388ac648e6ae99af7ee57046d50.gif )

> Demo 地址：<https://codepen.io/airen/full/dywGBjY>

在这个例子中，元素 `.element` 显式设置了 `aspect-ratio` 为 `16 ``/ 9` ：

-   当元素的 `width` 和 `height` 都未显式指定具体值时（即 `width` 和 `height` 的值为 `auto`），`aspect-ratio` 会获取宽度，将其转换为像素，并应用定义的宽高比来计算元素的高度
-   当元素的 `width` 为 `40vw` 且 `height` 为 `auto` 时，`aspect-ratio` 将会基于指定的宽度值，计算出元素的高度，即 `height = width ÷ ratio = 40vw ÷ 16 × 9 = 22.5vw`
-   当元素的 `width` 为 `auto` 且 `height` 为 `40vh` 时，`aspect-ratio` 将会基于指定的高度值，计算出元素的宽度，即 `width = height × ratio = 40vh × (16 ÷ 9) = 71.11vh`
-   当元素的 `width` 为 `40vw` 且 `height` 为 `40vh` 时（即，`width` 和 `height` 显式指定了具体的值），`aspect-ratio` 将会被忽略

虽然 CSS 的 `aspect-ratio` 可以基于元素框的宽度（`width`）或高度（`height`），计算出元素框的尺寸，但计算出来的尺寸是一种弱尺寸，它和 `width` 和 `height` 显式指定为具体值还是有很大差异的。比如下面这个示例，元素框的尺寸是通过 `aspect-ratio` 计算出来的，但当元素框的内容尺寸超出元素框计算出来的尺寸时，此时元素框的尺寸将会是其内容的尺寸：

![img](./images/076940ab39b97b9e5c4326191a3d0aef.gif )

> Demo 地址：<https://codepen.io/airen/full/vYvLoor>

正如你所看到的，设置宽高比（`aspect-ratio`）会告诉浏览器，这是首选的宽高比。如果元素的内容更大，那么元素盒子框的尺寸就会变大。

为了能让元素保持宽高比，你可以将 `overflow` 属性的值设置为非 `visible` ，建议将 `overflow` 设置为 `auto` ，以便在内容较多时能显示滚动条，不至于数据的丢失。

```CSS
.element {
    aspect-ratio: 16 / 9;
    overflow: auto;
}
```

![img](./images/34f741569d2fe7aefa192de38741a34b.gif )

> Demo 地址：<https://codepen.io/airen/full/YzdqVwv>

当然，你也可以将 `min-height` 设置为 `0` ，也可以让元素保持宽高比，只不过这样处理将会导致内容溢出元素框：

```CSS
.element {
    aspect-ratio: 16 / 9;
    min-height: 0;
}
```

![img](./images/c157d5be53156d62f16e0185e1cb0256.gif )

> Demo 地址：<https://codepen.io/airen/full/jOXqmVP>

### aspect-ratio + min-* / max-* = ❓

在 CSS 中，我们可以使用 `min-width` 、`max-width` 、`min-height` 、`max-height` 或者它们对应的逻辑属性来限制元素框尺寸大小。同样的，宽高比也遵守这个规则。

先来看第一个示例：

```CSS
/* aspect-ratio + min-height */
.element {
    aspect-ratio: 16 / 9;
    min-height: 300px;
}
​
/* aspect-ratio + max-height */
.element {
    aspect-ratio: 16 / 9;
    max-height: 400px;
}
​
/* aspect-ratio + min/max-height */
.element {
    aspect-ratio: 16 / 9;
    min-height: 300px;
    max-height: 400px;
}
```

![img](./images/4e28b7337c0cf58faf67e69fb22e9e8e.gif )

> Demo 地址：<https://codepen.io/airen/full/oNJxWwd>

在这个示例中，CSS 的 `aspect-ratio` 会获取其父元素的宽度，并基于该值计算出元素框尺寸。只不过，代码中添加了 `min-height` 和 `max-height` 对元素框的高度做了一定的限制。元素框的高度始终不会小于 `min-height` 设置的值 `300px` ，也始终不会大于 `max-height` 设置的值 `400px` 。

如果你将上面示例换成 `min-width` 和 `max-width` ，`aspect-ratio` 同样遵循这个规则，计算出来的宽度将会受到相应的限制：

```CSS
/* aspect-ratio + min-width */
.element {
    aspect-ratio: 3 / 4;
    min-width: 300px;
}
​
/* aspect-ratio + max-width */
.element {
    aspect-ratio: 3 / 4;
    max-width: 400px;
}
​
/* aspect-ratio + min-width + max-width */
.element {
    aspect-ratio: 3 / 4;
    min-width: 300px;
    max-width: 400px;
}
```

![img](./images/1ea5fe21173661794aaba35ba2f07be6.gif )

> Demo 地址：<https://codepen.io/airen/full/ZEVWKoK>

### aspect-ratio + min() / max() / clamp() = ❓

在 CSS 中，我们可能还会使用 **[CSS 的比较函数](https://juejin.cn/book/7223230325122400288/section/7241401565653762108)**，即 `min()` 、`max()` 或 `clamp()` 来设置元素框的尺寸。例如：

```CSS
.element {
    width: min(20vw, 200px);
}
```

元素 `.element` 的宽度将会取 `min()` 函数中更小的那个值。

也就是说，`aspect-ratio` 有可能和 CSS 的比较函数一起使用。例如：

```CSS
.min {
    width: min(50vw, 200px);
    aspect-ratio: 16 / 9;
}
​
.max {
    width: max(50vw, 200px);
    aspect-ratio: 16 / 9;
}
​
.clamp {
    width: clamp(200px, 50vw + 100px, 400px);
    aspect-ratio: 16 / 9;
}
```

在这样的场景中，`aspect-ratio` 会基于比较函数返回的值计算出相应的尺寸。

![img](./images/1dd18cb00987d06313bf95ea1a36caf4.gif )

> Demo 地址：<https://codepen.io/airen/full/yLGOXNz>

拿示例中的 `min(50vw, 200px)` 为例：

-   当浏览器视窗的宽度是 `1000px` 时，`50vw` 等于 `500px` ，此时 `min(50vw, 200px)` 函数返回的值是 `200px` （取小的值），那么浏览器会根据 `aspect-ratio` 属性计算出元素框的高度，即 `height = width ÷ ratio = 200px ÷ 16 × 9 = 112.5px`
-   当浏览器视窗的宽度是 `400px` 时，`50vw` 等于 `200px` ，此时 `min(50vw, 200px)` 函数返回的值是 `200px` ，那么浏览器会根据 `aspect-ratio` 属性计算出元素框的高度，即 `height = width ÷ ratio = 200px ÷ 16 × 9 = 112.5px`
-   当浏览器视窗的宽度是 `300px` 时，`50vw` 等于 `150px` ，此时 `min(50vw, 200px)` 函数返回的值是 `150px` （取小的值），那么浏览器会根据 `aspect-ratio` 属性计算出元素框的高度，即 `height = width ÷ ratio = 150px ÷ 16 × 9 = 84.375px`

### Flex 项目上的 aspect-ratio

由于 Flex 项目尺寸受 `flex` 属性（`flex-basis` 、`flex-grow` 和 `flex-shrink`）影响，使得作用于 Flex 项目的 `aspect-ratio` 属性也变得更复杂。甚至会让你感觉用于 Flex 项目的 `aspect-ratio` 不起作用。事实上并非如此。接下来，通过具体的示例来解释，为什么会有这样的错觉。

> 为了能更好的理解接下来的内容，你需要对 Flex 项目的尺寸计算有一定的了解。如果你对这方面的知识不太了解，强烈建议你花点时间阅读《[Flexbox 中的计算：通过扩展因子比例来扩展 Flex 项目](https://juejin.cn/book/7161370789680250917/section/7161623797794078750)》、《[Flexbox 中的计算：通过收缩因子比例收缩 Flex 项目](https://juejin.cn/book/7161370789680250917/section/7164357320367931399)》和《[Flexbox 布局中的 flex-basis ：谁能决定 Flex 项目的大小？](https://juejin.cn/book/7161370789680250917/section/7161623717074698247)》。

假设 Flexbox 容器中包含了四个 Flex 项目，并且显式设置 `flex: 1 1 25%` （即 `flex-grow: 1` 、`flex-shrink: 1` 和 `flex-basis: 25%`），同时给每个 Flex 项目指定不同的宽高比：

```HTML
<ul class="flexbox">
    <li class="item" style="--ratio: 16 / 9;">16 : 9</li>
    <li class="item" style="--ratio: 4 / 3;">4 : 3</li>
    <li class="item" style="--ratio: 1 / 1;">1 : 1</li>
    <li class="item" style="--ratio: 21 / 9;">21 : 9</li>
</ul>
```

```CSS
.flexbox {
    display: flex;
    gap: 10px;
    
    & .item {
        flex: 1 1 25%;
        aspect-ratio: var(--ratio);
    }
}
```

按理说，`aspect-ratio` 会根据 Flex 项目的宽度（由 `flex` 计算之后的 Flex 项目宽度）计算出 Flex 项目的高度，但实际效果是所有 Flex 项目的高度都是一样，即最高的 Flex 项目决定了同一行中所有 Flex 项目的高度。在我们这个例子中，`aspect-ratio` 为 `1:1` 的 Flex 项目，计算出来的 Flex 项目是最高的，所以宽高比为 `16:9` 、`4:3` 和 `21:9` 的 Flex 项目的宽高比都是 `1:1` ：

![img](./images/a85cad1fdc8fe6b13b3209839621436b.gif )

> Demo 地址：<https://codepen.io/airen/full/QWzNgYm>

造成这种现象是由于 `align-items: stretch` 引起的（[Flexbox 容器的 align-items 默认值为 stretch](https://juejin.cn/book/7161370789680250917/section/7161623670622781471)）。也就是说，只需将 `align-items` 属性的值设置为非 `stretch` 就能使 Flex 项目的宽高比变得正常：

```CSS
.flexbox {
    display: flex;
    gap: 10px;
    align-items: flex-start; /* 非 stretch 即可 */
    
    & .item {
        flex: 1 1 25%;
        aspect-ratio: var(--ratio);
    }
}
```

![img](./images/971e124383b244bc8fe06bbc49e81f3b.gif )

> Demo 地址：<https://codepen.io/airen/full/ExGKvzN>

如果出于某种原因，你想只在单个 Flex 项目上不被拉伸，那么你可以给该 Flex 项目设置 `align-self` 属性的值为非 `stretch` ，或者显式设置 Flex 项目的 `height` 的值为 `min-content` 。比如下面这个示例，第一个 Flex 项目设置了 `align-self` 的值为 `flex-start` ，第二个 Flex 项目设置了 `align-self` 的值为 `center` ，第三个 Flex 项目设置了 `align-self` 的值为 `flex-end` ，而第四个 Flex 项目设置了 `height` 为 `min-content` ：

```CSS
.flexbox {
    display: flex;
    gap: 10px;
    
    & .item {
        flex: 1 1 25%;
        aspect-ratio: var(--ratio);
        
        &:nth-child(1) {
            align-self: flex-start;
        }
        
        &:nth-child(2) {
            align-self: center;
        }
        
        &:nth-child(3) {
            align-self: flex-end;
        }
        
        &:nth-child(4) {
            height: min-content;
        }
    }
}
```

![](./images/f6cbd3f0a04140363635c35582c7faba.webp )


> Demo 地址：<https://codepen.io/airen/full/abPNLvW>

除此之外，你还可以将 Flex 项目的 `margin-top` 或 `margin-bottom` 以及其逻辑属性 `magin-block` 设置为 `auto` ，也可以使得 Flex 项目保持正常的宽高比：

```CSS
.flexbox {
    display: flex;
    gap: 10px;
    
    & .item {
        flex: 1 1 25%;
        aspect-ratio: var(--ratio);
        
        margin-block: auto;
    }
}
```

![img](./images/ba5f54b60d3c9ed826a723356f47b89c.webp )

> Demo 地址：<https://codepen.io/airen/full/RwEaLKe>

只要满足以下所述这几种情况，Flex 项目的宽高比就能保持正常，即使是 Flex 项目宽度大小不一：

-   Flexbox 容器的 `align-items` 属性值不是 `stretch` 或 `normal`
-   Flex 项目的 `align-self` 属性值不是 `stretch` 或 `normal`
-   Flex 项目的 `height` 属性值是 `min-content`
-   Flex 项目的 `margin-top` 、`margin-bottom` 或 `margin-block` 属性的值为 `auto`

```CSS
.flexbox {
    display: flex;
    gap: 10px;
    
    & .item {
        flex: var(--grow) 1 0%;
        align-self: flex-start;
        aspect-ratio: var(--ratio);
    }
}
```

![img](./images/302c359a987b90b9d9b1ac3dd36f3153.webp )

> Demo 地址：<https://codepen.io/airen/full/abPNLYE>

需要注意的是，当 Flex 项目显式指定了 `height` 的值，`aspect-ratio` 可以让 Flex 项目保持正常的宽高比，但会致使 `flex` 不起任何作用（比如 `flex:1` 失效）。在这种情况之下，只有 Flex 项目显式设置 `min-width` 的值为 `0` ，才能使得 `flex` 起作用。不过这样操作，又会致使 `aspect-ratio` 失效，Flex 项目的高度始终是 `height` 属性指定的高度：

```CSS
.flexbox {
    display: flexbox;
    gap: 10px;
    
    & .item {
        height: 150px;
        aspect-ratio: var(--ratio);
        
        flex: var(--flex);
    }
}
```

![](./images/7f206024a58a5ca3ab806b3662cd2b07.gif )    


> Demo 地址：<https://codepen.io/airen/full/yLGOzwb>

### Grid 项目上的 aspect-ratio

**[CSS Grid](https://juejin.cn/book/7161370789680250917/section/7161372229123440648)** 已经是[现代 Web 布局](https://s.juejin.cn/ds/iee5BpTN/)的主流技术之一。和 Flexbox 布局一样，也可以在 Grid 项目上指定宽高比，但和 Flex 项目不同的是，Grid 项目上的 `aspect-ratio` 可以使其保持正常的宽高比，而且可以基于 Grid 项目的宽度计算出 Grid 项目的高度。例如：

```HTML
<ul class="grid">
    <li class="item" style="--ratio: 16 / 9;">16 : 9</li>
    <li class="item" style="--ratio: 4 / 3;">4 : 3</li>
    <li class="item" style="--ratio: 1 / 1;">1 : 1</li>
    <li class="item" style="--ratio: 21 / 9;">21 : 9</li>
</ul>
```

```CSS
.grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    
    & .item {
        aspect-ratio: var(--ratio);
    }
}
```

![img](./images/4f37328cd4d83995e38af48701e3bc7b.gif )

> Demo 地址：<https://codepen.io/airen/full/yLGOPLo>

和 Flexbox 布局不同的是，在 Grid 布局中，网格轨道、网格区域以及合并网格单元格都将影响 Grid 项目的宽度。例如：

```CSS
.grid {
    display: grid;
    grid-template-columns: 1fr 2fr 3fr 4fr;
    gap: 10px;
    
    & .item {
        aspect-ratio: var(--ratio);
        
        &:nth-child(1) {
            grid-column: span 2;
        }
        
        &:nth-child(4) {
            grid-column: 1 / 4;
        }
    }
}
```

![img](./images/8b2116bc0ae64a4e5a3ffaf0e2e50a61.gif )

> Demo 地址：<https://codepen.io/airen/full/poqydEW>

## aspect-ratio 用例

`aspect-ratio` 最常见的用例是图片、`iframe` 和视频，比如前面所介绍的卡片缩略图。除此之外，它还有一些别的经典用例。

### 网格中的一致性

有一些商业网站或开源库首页，会有赞助商的 Logo 展示。往往我们会使用 CSS Flexbox 或 CSS Grid 来布局，在展示 Logo 图标时，你可能希望它们保持一定的宽高比来展示，那么使用 `aspect-ratio` 就方便的多了，除此之外，它还能帮助我们更好的处理不同大小 Logo 图标的对齐问题。

```HTML
<ul class="icons">
    <li class="icon">
        <img src="icon.png" alt="Logo Name" />
    </li>
    <!-- 其他图标 -->
</ul>
```

```CSS
body {
    --ratio: 1/1;
}
​
.icons {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 4rem;
  
    & img {
        aspect-ratio: var(--ratio);
        width: 100%;
        object-fit: contain;
    }
}
```

代码中的 `object-fit: contain` 主要用于避免图片失真。

![img](./images/a6de2dee97b40cdc8a4a3aafc389588b.gif )

> Demo 地址：<https://codepen.io/airen/full/NWeNwMv>

### 防止布局累积移位（CLS）

我们在 Web 中总是会引入一些媒体对象，比如图片和视频等。当这些媒体加载完成时，会产生布局偏移。如下图所示：

![img](./images/3e38ff1fb9775503bf1d3ca790920ac0.gif )

这对于 Web 性能来说是昂贵的。这一点，我曾在《[防御式 CSS](https://s.juejin.cn/ds/ieeQtA7w/)》的《[响应式图片：防止图片的拉伸和挤压](https://juejin.cn/book/7199571709102391328/section/7199845663143067660)》也有提到过。

我们可以给图片指定一个宽高比，它会创建一个占位符来防止这种布局变化。简单地说，`aspect-ratio` 的另一个重要特性是，它可以创建占位符空间，以防止累积布局移位：

```CSS
img {
    display: block;
    width: 100%;
    aspect-ratio: 3 / 2 ;
}
```

![img](./images/8d207d2ef4f519e4a4ea0757b75cab49.gif )

### 响应式圆形用户头像

以往我们创建一个圆形用户头像总是将用户头像（`img`）的宽度（`width`）和高度（`height`）设置相等的值，例如：

```CSS
.avatar {
    --size: 100px;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
}
```

如今，你只需要指定 `aspect-ratio` 属性的值为 `1` ，那么调整宽度的时候就会自动调整高度，而且宽度和高度始终是相等的：

```CSS
.avatar {
    --size: 100px;
    width: var(--size);
    aspect-ratio: 1;
    border-radius: 50%;
}
```

![img](./images/6921cc274a2959e6a81c8bfa2855726f.gif )

> Demo 地址：<https://codepen.io/airen/full/OJrNzWQ>

## 小结

`aspect-ratio` 是一个非常有用的特性，它使得你能真正的根据元素宽高比来调整元素框尺寸，这在 Web 布局中是非常有用的。