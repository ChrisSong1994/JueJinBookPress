/**
 * @description: 小册初始化
 * 1、扫描目录生成 index.md 和 _meta.json 文件，根据文件下的 md 名称生成
 * 2、扫描 md 文件，转换图片链接为本地图片，并转换图片格式
 * */

const path = require("path");
const fs = require("fs-extra");
const signale = require("signale");
const {
  bookIndexFileGenerate,
  bookMetaFileGenerate,
  booksFileGenerate,
  addBookToCache,
  isBookInCache,
  checkIsDirectory,
  filenameSortor,
} = require("./utils");

// books 目录
const docsBooksPath = path.join(__dirname, "../docs");
// 缓存目录
const cacheDirPath = path.join(__dirname, "../.cache.json");

async function booksGenerate(booksPath) {
  if (!fs.existsSync(booksPath)) {
    signale.fatal(new Error(`${booksPath} 目录不存在`));
    return;
  }
  const bookName = path.basename(booksPath);
  const isBookInCached = await isBookInCache(bookName, cacheDirPath);
  if (isBookInCached) {
    signale.complete(`${bookName} 已经归档`);
    return;
  }
  signale.start(`${bookName} 开始归档`);
  // 扫描目录生成 index.md 和 _meta.json 文件，根据文件下的 md 名称生成
  const mdFiles = fs
    .readdirSync(booksPath)
    .filter((name) => name.endsWith(".md"))
    .filter((name) => name !== "index.md")
    .sort(filenameSortor);

  console.log(mdFiles);
  //   生成 index.md 文件
  await bookIndexFileGenerate(booksPath, mdFiles);
  //   生成 _meta.json 文件
  await bookMetaFileGenerate(booksPath, mdFiles);
  // 扫描 md 文件，转换图片链接为本地图片，并转换图片格式
  await booksFileGenerate(booksPath, mdFiles);
  // 缓存书籍信息
  await addBookToCache(bookName, cacheDirPath);

  signale.success(`${bookName} 归档成功`);
}

async function run() {
  // 获取执行目录
  const booksPath = process.argv[2]
    ? path.resolve(docsBooksPath, process.argv[2])
    : undefined;

  console.log(booksPath);

  if (booksPath) {
    // 扫描该本书
    await booksGenerate(booksPath);
  } else {
    // 扫描books下的所有书籍
    const books = await fs.readdir(docsBooksPath);
    for (const bookName of books) {
      if (["public"].includes(bookName)) {
        continue;
      }
      const booksPath = path.join(docsBooksPath, bookName);
      const isDirectory = await checkIsDirectory(booksPath);
      if (isDirectory) {
        await booksGenerate(booksPath);
      }
    }
  }
}

run();
