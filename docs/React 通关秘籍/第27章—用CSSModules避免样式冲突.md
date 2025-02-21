# 第27章—用CSSModules避免样式冲突

﻿每个组件里有 js 逻辑和 css 样式。

js 逻辑是通过 es module 做了模块化的，但是 css 并没有。

所以不同组件样式都在全局，很容易冲突。

那 css 如何也实现像 js 类似的模块机制呢？

最容易想到的是通过命名空间来区分。

比如 aaa 下面的 bbb 下的 button，就可以加一个 aaa__bb__btn 的 class。

而 ccc 下的 button，就可以加一个 ccc__btn 的 class。

常用的 BEM 命名规范就是解决这个问题的。

BEM 是 block、element、modifier 这三部分：

- 块（Block）：块是一个独立的实体，代表一个可重用的组件或模块。

块的类名应该使用单词或短语，并使用连字符（-）作为分隔符。例如：.header、.left-menu。

- 元素（Element）：元素是块的组成部分，不能独立存在。

元素的类名应该使用双下划线（__）作为分隔符，连接到块的类名后面。例如：.left-menu__item、.header__logo。

- 修饰符（Modifier）：修饰符用于描述块或元素的不同状态或变体，用来更改外观或行为。

修饰符的类名应该使用双连字符（--）作为分隔符，连接到块或元素的类名后面。例如：.left-menu__item--active、.header__logo--small。

但是，BEM 规范毕竟要靠人为来约束，不能保证绝对不会冲突。

所以最好是通过工具来做模块化，比如 CSS Modules。

我们先用一下 css modules 再介绍。

```
npx create-vite
```
用 vite 创建个 react 项目。

![](./images/e56fd4b0950d7cab0b24324c19f902af.png )

进入项目，安装依赖，把开发服务跑起来：

```
npm install
npm run dev
```

![](./images/4db16a1ce086599db0f104e7eed3b006.png )

添加两个组件 Button1、Button2

Button1.tsx

```javascript
import './Button1.css';

export default function() {
    return <div className='btn-wrapper'>
        <button className="btn">button1</button>
    </div>
}
```
Button1.css
```css
.btn-wrapper {
    padding: 20px;
}

.btn {
    background: blue;
}
```
Button2.tsx
```javascript
import './Button2.css';

export default function() {
    return <div className='btn-wrapper'>
        <button className="btn">button2</button>
    </div>
}
```
Button2.css
```css
.btn-wrapper {
    padding: 10px;
}

.btn {
    background: green;
}
```
在 App.tsx 引入下：

![](./images/904b8c56bced2ead3d6f680819965a7e.png )

渲染出来是这样的：

![](./images/6c6a083f83acdd8312dda40ca992fa2a.png )

很明显，是样式冲突了：

![](./images/99699941fc7fdc3a6a37b2ff36e74ca5.png )

这时候可以改下名字，把 Button1.css 该为 Button1.module.css

![](./images/c541c2e1529d37add494909598bd7d6a.png )

并且改下写 className 的方式。

```javascript
import styles from './Button1.module.css';

export default function() {
    return <div className={styles['btn-wrapper']}>
        <button className={styles.btn}>button1</button>
    </div>
}
```

在浏览器看下：

![](./images/6e0543fc71371652a99c46dbae4f8117.png )

现在就不会样式冲突了。

为什么呢？

![](./images/4240dac8a40740a2951d77cd043de9cb.png )

可以看到，button1 的 className 变成了带 hash 的形式，全局唯一的，自然就不会冲突了。

这就是 css modules。

那它是怎么实现的呢？

看下编译后的代码就明白了：

![](./images/021a3dce34e6292dcf3468fe12263710.png )

它通过编译给 className 加上了 hash，然后导出了这个唯一的 className。

所以在对象里用的，就是编译后的 className：

![](./images/55ca3be6045910de26459b313f4baa06.png )

在 vscode 里安装 css modules 插件：

![](./images/57e1eede0db36933c913807ee310ab6e.png )

就可以提示出 css 模块下的 className 了：

![](./images/b715252ebcf0da7a9838b7cb7098c9f2.png )

其实 vue 里也有类似的机制，叫做 scoped css

比如：

```html
<style scoped> 
.guang { 
    color: red; 
} 
</style>  
<template>  
    <div class="guang">hi</div>  
</template>
```
会被编译成：

```html
<style> 
.guang[data-v-f3f3eg9] 
{ 
    color: red; 
} 
</style> 
<template> 
    <div class="guang" data-v-f3f3eg9>hi</div> 
</template>
```

通过给 css 添加一个全局唯一的属性选择器来限制 css 只能在这个范围生效，也就是 scoped 的意思。

它和 css modules 还不大一样，css modules 是整个 clasName 都变了，所以要把 className 改成从 css modules 导入的方式：

![](./images/9ee096be31e3e1ce4dabd2be4be76ef5.png )

而 scoped css 这种并不需要修改 css 代码，只是编译后会加一个选择器

![](./images/00ab2eb5567854a8e5b0d6e2d01304ee.png )

![](./images/52b82a007dc0765258ec0b1d7554d3ae.png )

两者的使用体验有一些差别。

当然，在 vue 里可以选择 scoped css 或者 css modules，而在 react 里就只能用 css modules 了。

css modules 是通过 [postcss-modules](https://github.com/madyankin/postcss-modules) 这个包实现的，vite 也对它做了集成。

我们可以在 vite.config.ts 里修改下 css modules 的配置：

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      generateScopedName: "guang_[name]__[local]___[hash:base64:5]"
    }
  }
})

```
比如通过 generateScopedName 来修改生成的 className 的格式：

![](./images/f57d347d1657e3a450b207025a0ae1b1.png )

generateScopedName 也可以是个函数，自己处理：

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      // generateScopedName: "guang_[name]__[local]___[hash:base64:5]"
      generateScopedName: function (name, filename, css) {
        console.log(name, filename, css)
  
        return "xxx"
      },
    }
  }
})

```
传入了 className、filename 还有 css 文件的内容：

![](./images/39b930f6e80417c9bb6e867fb0a72d1d.png )

你可以通过 getJSON 来拿到编译后的 className：

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      getJSON: function (cssFileName, json, outputFileName) {
        console.log(cssFileName, json, outputFileName)
      },
    }
  }
})
```
第二个参数就是 css 模块导出的对象：

![](./images/4d960958e41ba2e6016d6e5a054e7456.png )

那如果在 Button1.module.css 里想把 .btn-wrapper 作为全局样式呢？

这样写：

![](./images/eebe3a03b6468140a94c09c86ec47827.png )

可以看到，现在编译后的 css 里就没有对 .btn-wrapper 做处理了：

![](./images/51a3263433482eef32083eedb4d25fd1.png )

只不过，因为 global 的 className 默认不导出，而我们用 styles.xxx 引入的：

![](./images/748814ca7fa4ef15f9230b4040254dcb.png )

所以 className 为空：

![](./images/9139733f674d07e8f2baf9258fcbd4ae.png )

这时候，或者把 className 改为这样：

![](./images/231902101fef8a96770e164fe1b05ee8.png )

或者在配置里加一个 exportsGlobals:true

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      getJSON: function (cssFileName, json, outputFileName) {
        console.log(cssFileName, json, outputFileName)
      },
      exportGlobals: true
    }
  }
})

```

可以看到，现在 global 样式也导出了：

![](./images/0452702ddbac3dfb3e2f62e085900441.png )

![](./images/9ffe65b7d93cabf06b01c67c879ceac1.png )

相对的，模块化的 className 就用 :local() 来声明：

![](./images/e0b6812bcfdaf2fc1060a88237552d1a.png )

默认是 local。

如果你想默认 global，那也可以配置：

![](./images/dd6423039677138e298c4d86be0f19b7.png )

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      getJSON: function (cssFileName, json, outputFileName) {
        console.log(cssFileName, json, outputFileName)
      },
      exportGlobals: true,
      scopeBehaviour: 'global'
    }
  }
})

```

可以看到，现在就正好反过来了：

![](./images/b1b8f694ec56fc5e0a25b55b59d27301.png )

默认是 global，如果是 local 的要单独用 :local() 声明。

你还可以通过正则表达式来匹配哪些 css 文件是默认全局：

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      getJSON: function (cssFileName, json, outputFileName) {
        console.log(cssFileName, json, outputFileName)
      },
      exportGlobals: true,
      globalModulePaths: [/Button1/]
    }
  }
})
```

![](./images/c35e5266c7ee16eaad5f6bd43de0c071.png )

还有一个配置比较常用，就是 localsConvention：

![](./images/dadec1783e66307b382e8e7ee33faa11.png )

当 localsConvention 改为 camelCase 的时候，导出对象的 key 会变成驼峰的：

![](./images/8420f48be780a84833d426852a9caa75.png )

那在组件里就可以这样写：

![](./images/751e83df0c7d6316d406c084620cca51.png )

这些就是 css modules 相关的配置了。

此外，还有一个地方需要注意，就是多层的 className 的时候：

```javascript
.btn-wrapper {
    padding: 20px;
}

.btn .xxx{
    background: blue;
}
```

每一层的 className 都会编译：

![](./images/60fbf033c8b17aa20315a9a847207a72.png )

有时候只要最外层 className 变了就好了，内层不用变，就可以用 :global() 声明下：

```css
.btn-wrapper {
    padding: 20px;
}

.btn :global(.xxx){
    background: blue;
}
```

![](./images/e0fdedb6fdf4cd5c1180035b121837a6.png )

用 scss 之类的预处理时也是一样。

![](./images/83bd466abd811c1274fc5890c1ef02ed.png )

用 :global 包裹一层，内层的 className 不会被编译：

```css
.btn {
    :global {
        .xxx {
            background: blue;
            .yyy {
                color: #000;
            }
        }
    }
}

```
![](./images/35f30b18561c07ee91c116c5862142fa.png )

在 vite 里用 css modules 是这么用，在 cra 里也是一样。

创建个 cra 的项目：

```
npx create-react-app --template=typescript css-modules-cra
```

![](./images/7e6d7f1c15faab745fc96d0fa234d6d1.png )

把服务跑起来：

```
npm run start
```
把 App.css 改为 App.module.css

![](./images/457bbfc9992114982641286fe8dce026.png )

在 App.tsx 引入下：

![](./images/322a32bc8a6c383491b6b003df767ca6.png )

这样就开启了 css modules：

![](./images/5a9019080143c7ccfdafc674c4ee821e.png )

用法是一样的。

实现 css modules 也是用的 postcss-modules 这个 postcss 插件。

只不过是用 webpack 的 css-loader 封装了一层。

我们把本地代码保存：

```
git init 
git add .
git commit -m 'init'
```
然后把 webpack 配置放出来：

```
npm run eject
```
项目下会多一个 config 目录这下面就是 webpack 配置：

![](./images/efc8ff075202ad984650d282b90d537c.png )
改一下配置：
```javascript
modules: {
  mode: 'local',
  // getLocalIdent: getCSSModuleLocalIdent,
  localIdentName: "guang__[path][name]__[local]--[hash:base64:5]"
},
```
重新跑开发服务：
```
npm run start
```
现在的 className 就变了：

![](./images/340a13d7da245be1b77674f33e297d0d.png )
更多配置可以看 [css-loader 的文档](https://github.com/webpack-contrib/css-loader?tab=readme-ov-file#object-2)

和 vite 的 css modules 配置都差不多，虽然配置项名字不一样。

## 总结

不同组件的 className 可能会一样，导致样式冲突。

为此，我们希望 css 能实现像 js 的 es module 一样的模块化功能。

可以用 BEM 的命名规范来避免冲突，但是这需要人为保证，不够可靠。

一般都是用编译的方式，比如 CSS Modules 或者 vue 的 Scoped CSS。

它是通过 postcss-modules 实现的，可以把 css 的 className  编译成带 hash 的形式。

然后在组件里用 styles.xxx 的方式引入。

在 vite、cra 里都对 css modules 做了支持，只要用 xx.module.css、xxx.module.scss 等结尾，就默认开启了 css modules。

还可以通过各种配置来做更多定制：

- scopeBehaviour： 默认 local 或者 global
- getJSON：可以拿到 css 模块导出的对象
- exportGlobals： 全局的 className 也导出到对象
- globalModulePaths：哪些文件路径默认是全局 className
- generateScopedName：定制 local className 的格式
- localsConvention： 导出的对象的 key 的格式

在 webpack 的 css-loader 里也有类似的配置。

现在的组件开发基本都有模块化的要求，所以 CSS Modules 在日常开发中用的特别多。
