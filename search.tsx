import React from "react";
import type {
  BeforeSearch,
  OnSearch,
  AfterSearch,
  RenderSearchFunction,
} from "rspress/theme";
import { RenderType } from "rspress/theme";
const beforeSearch: BeforeSearch = (query: string) => {
  // 可以在这里做一些搜索前的操作
  console.log("beforeSearch");
  // 返回处理后的 query
  return query.replace(" ", "");
};

const onSearch: OnSearch = async (query, defaultSearchResult) => {
  // 可根据 query 请求数据
  console.log(query);
  // 默认的搜索源的结果，为一个数组
  console.log(defaultSearchResult);
  // const customResult = await searchQuery(query);

  // 可直接操作默认搜索结果
  defaultSearchResult.pop();

  // 返回值为一个数组，数组中的每一项为一个搜索源的结果，它们会被添加到搜索结果中
  return [
    {
      group: "Custom",
      result: {
        list: [
          {
            title: "Search Result 1",
            path: "/search1",
          },
          {
            title: "Search Result 2",
            path: "/search2",
          },
        ],
      },
      renderType: RenderType.Custom,
    },
  ];
};

const afterSearch: AfterSearch = async (query, searchResult) => {
  // 搜索关键词
  console.log(query);
  // 搜索结果
  console.log(searchResult);
};

interface ResultData {
  list: {
    title: string;
    path: string;
  }[];
}

const render: RenderSearchFunction<ResultData> = (item) => {
    debugger
  return (
    <div>
      {item.list.map((i) => (
        <div>
          <a href={i.path}>{i.title}</a>
        </div>
      ))}
    </div>
  );
};
export { beforeSearch, onSearch, afterSearch, render };
