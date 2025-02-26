import * as path from "node:path";
import { defineConfig } from "rspress/config";

const BASE_PATH = "/";

export default defineConfig({
  root: path.join(__dirname, "docs"),
  title: "前端小册",
  description: "前端知识小册",
  icon: "/logo.icon.png",
  logo: "/logo.png",
  base: BASE_PATH,
  logoText: "前端小册",
  search: {
    searchHooks: path.join(__dirname, "./search.tsx"),
  }, // 关闭搜索功能
  builderConfig: {
    output: {
      assetPrefix: BASE_PATH,
    },
  },
  route: {
    cleanUrls: true,
  },
  ssg: true,
  // 覆写主题配置
  themeConfig: {
    enableScrollToTop: true,
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/ChrisSong1994/JueJinBookPress",
      },
    ],
    editLink: {
      docRepoBaseUrl:
        "https://github.com/ChrisSong1994/JueJinBookPress/tree/main/docs",
      text: "📝 在 GitHub 上编辑此页",
    },
    searchNoResultsText: "未搜索到相关结果",
    searchPlaceholderText: "搜索文档",
    searchSuggestedQueryText: "可更换不同的关键字后重试",
    overview: {
      filterNameText: "过滤",
      filterPlaceholderText: "输入关键词",
      filterNoResultText: "未找到匹配的 API",
    },
  },
});
