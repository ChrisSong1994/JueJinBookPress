const path = require("path");
const fs = require("fs-extra");
const signale = require("signale");
const sharp = require("sharp");
// 生成 index.md 文件
const bookIndexFileGenerate = async (booksPath, mdFiles) => {
  const content = `
# ${path.basename(booksPath)}

${mdFiles
  .map(
    (file) =>
      `- [${file.replace(".md", "")}](./${encodeURIComponent(
        file.replace(".md", "")
      )})`
  )
  .join("\n")}
`;
  await fs.writeFile(path.join(booksPath, "index.md"), content);
};

// 生成 _meta.json 文件
const bookMetaFileGenerate = async (booksPath, mdFiles) => {
  const content = JSON.stringify(mdFiles);
  await fs.writeFile(path.join(booksPath, "_meta.json"), content);
};

//  重新生成 book md 文件
const booksFileGenerate = async (booksPath, mdFiles) => {
  // 定义图片目录
  const booksImagesPath = path.join(booksPath, "images");
  fs.ensureDirSync(booksImagesPath);
  for (const mdFile of mdFiles) {
    await bookUrlImageToLocalPathGenerate(booksPath, mdFile, booksImagesPath);
  }
};
// 扫描 md 文件，转换图片链接为本地图片，并转换图片格式
async function bookUrlImageToLocalPathGenerate(
  booksPath,
  mdFile,
  booksImagesPath
) {
  const imgUrlMap = new Map();
  const mdFilePath = path.join(booksPath, mdFile);

  signale.pending("图片地址解析...");
  let content = await fs.readFile(mdFilePath, { encoding: "utf8" });
  const matchedUrls = parseMarkdownImagesUrls(content);
  if (matchedUrls.length === 0) return;
  // 创建图片 http url 和 local path 的映射
  matchedUrls.forEach((url) => imgUrlMap.set(url, null));

  signale.pending("图片地址转换...");
  for (const url of imgUrlMap.keys()) {
    const imgLocalPath = await imageUrlConvertToLocalPath(url, booksImagesPath);
    imgUrlMap.set(url, imgLocalPath);
  }

  signale.pending("图片地址替换...");
  for (const url of imgUrlMap.keys()) {
    const imgLocalPath = imgUrlMap.get(url);
    if (imgLocalPath) {
      content = content.replaceAll(url, imgLocalPath);
    }
  }
  await fs.writeFile(mdFilePath, content, { encoding: "utf8" });
}

/**
 * 图片下载到cacheDir ，并转换成可识别格式 png
 *  @param {string} url
 *  @param {number} quality // 图片压缩比
 */
async function imageUrlConvertToLocalPath(url, booksImagesPath) {
  const formatUrl = url.replace(/\\/g, "");
  const filename = `${path.parse(new URL(formatUrl).pathname).base}.png`;
  try {
    const response = await fetch(formatUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const filepath = path.join(booksImagesPath, filename);
    // image sharp 特殊处理
    if (path.extname(new URL(formatUrl).pathname) === ".image") {
      await fs.writeFile(filepath, buffer);
    } else {
      await sharp(buffer).toFile(filepath);
    }
  } catch (e) {
    console.log(`${formatUrl} 转换失败`, e.message);
    return formatUrl;
  }
  return `./images/${filename}`;
}

/**
 * 获取 markdown 中的 image 标签
 * @param {string} input
 */
function parseMarkdownImagesUrls(input, filter) {
  const reg = /.*\!\[.*\]\((.*)\).*/g;
  const matchs = [...input.matchAll(reg)];
  let urls = matchs.map((m) => m[1]).filter((url) => url.startsWith("http")); // 过滤掉 base64 和 相对路径

  if (filter) {
    urls = urls.filter((url) => filter.test(url));
  }

  return urls;
}

// 添加 book 到缓存
async function addBookToCache(bookPath, cacheDirPath) {
  const cacheData = await fs.readJSON(cacheDirPath);
  cacheData.books.push(path.basename(bookPath));
  await fs.writeJSON(cacheDirPath, cacheData);
}

// 判断书籍是否已经在缓存中
async function isBookInCache(bookPath, cacheDirPath) {
  const cacheData = await fs.readJSON(cacheDirPath);
  return cacheData.books.includes(path.basename(bookPath));
}

// 判断是否是目录
async function checkIsDirectory(path) {
  try {
    const stats = await fs.stat(path);
    if (stats.isDirectory()) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error(err);
    return false;
  }
}

module.exports = {
  bookIndexFileGenerate,
  bookMetaFileGenerate,
  booksFileGenerate,
  addBookToCache,
  isBookInCache,
  checkIsDirectory,
};
