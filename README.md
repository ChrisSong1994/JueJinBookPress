# JueJinBookPress

> **郑重声明**：该项目全部资源来自于网络，仅供学习参考，不得用于商业盈利。

改项目基于 [Rspress](https://rspress.dev/zh/index) 作为站点构建工具，主要资源来源于改项目[NuggetsBooklet](https://github.com/lm-rebooter/NuggetsBooklet)和部分网络资源；
由于大部分 markdown 资源在本地或 github 访问体验都不是很好，图片展示不友好以及阅读体验不友好，这个项目旨在将这些资源整合到一起，并能够提炼图片资源，以方便本地阅读。

## 开发
假如你想加入该项目或者提供资源，请把资源放在 `/docs/books/` 目录下，并在本地执行`npm run generate` 后，会启动文件扫描程序，每个`books` 目录下的文件夹会被作为一本独立的书的目录被扫描，并根据目录下的 `markdown` 文档生成文档文件 `_meta.json` 和 `index.md` 文件。假如扫描 `markdown` 的文档过程中遇到网络链接图片，会自动下载图片到本地，并替换掉网络链接，以达到去网络防盗链的目的。

执行 `npm run generate` 成功后，再执行本地文档服务器 `npm run dev` 并打开 `http://localhost:3000`查看文档是否能正常运行。

运行成功即可提交 `PR`; 

