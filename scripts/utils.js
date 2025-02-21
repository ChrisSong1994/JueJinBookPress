const path = require("path");
const fs = require("fs-extra");
const signale = require("signale");
const sharp = require("sharp");
const crypto = require("crypto");

// 文件重命名
const booksFilenameFormat = async (booksPath, mdFiles) => {
  const renameMdFiles = [];
  for (const file of mdFiles) {
    const newFileName = await renameMdFilename(booksPath, file);
    renameMdFiles.push(newFileName);
  }
  return renameMdFiles;
};
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
  const fileName = path.parse(booksPath).base;
  const mateData = [
    { type: "file", label: `主页：${fileName}`, name: "index" },
    ...mdFiles,
  ];
  const content = JSON.stringify(mateData, null, 2);
  await fs.writeFile(path.join(booksPath, "_meta.json"), content);
};

//  重新生成 book md 文件
const booksFileGenerate = async (booksPath, mdFiles) => {
  // 定义图片目录
  const booksImagesPath = path.join(booksPath, "images");
  fs.ensureDirSync(booksImagesPath);

  for (const mdFile of mdFiles) {
    signale.start(`文档： ${mdFile} 开始生成...`);
    await bookUrlImageToLocalPathGenerate(booksPath, mdFile, booksImagesPath);
    signale.success(`文档： ${mdFile} 正在生成完成！`);
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

  let content = await fs.readFile(mdFilePath, { encoding: "utf8" });
  const matchedUrls = parseMarkdownImagesUrls(content);
  if (matchedUrls.length !== 0) {
    // 创建图片 http url 和 local path 的映射
    matchedUrls.forEach((url) => imgUrlMap.set(url, null));

    for (const url of imgUrlMap.keys()) {
      const imgLocalPath = await imageUrlConvertToLocalPath(
        url,
        booksImagesPath
      );
      imgUrlMap.set(url, imgLocalPath);
    }

    for (const url of imgUrlMap.keys()) {
      const imgLocalPath = imgUrlMap.get(url);
      if (imgLocalPath) {
        content = content.replaceAll(url, imgLocalPath);
      }
    }
  }

  content = await addTitle(content, mdFile.replace(".md", ""));
  await fs.writeFile(mdFilePath, content, { encoding: "utf8" });
}

// 给 markdown 添加 title
async function addTitle(content, title) {
  const titleReg = /^#\s+(.*)/gm;
  const titleMatch = titleReg.exec(content);
  if (titleMatch) {
    content = content.replace(titleMatch[0], `# ${title}`);
  } else {
    content = `# ${title}\n\n${content}`;
  }
  return content;
}
/**
 * 图片下载到cacheDir ，并转换成可识别格式 png
 *  @param {string} url
 *  @param {number} quality // 图片压缩比
 */
async function imageUrlConvertToLocalPath(url, booksImagesPath) {
  let formatUrl = url.replace(/\\/g, ""); // 处理 url 中有反斜杠的情况
  if (formatUrl.includes(" ")) {
    formatUrl = formatUrl.split(" ")[0]; // 处理 url 中有空格的情况
  }

  try {
    const response = await fetch(formatUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    // 图片重命名
    const filename = `${crypto
      .createHash("md5")
      .update(formatUrl)
      .digest("hex")}`;
    // 图片路径
    let filepath = path.join(booksImagesPath, filename);
    const urlObj = new URL(formatUrl.replace(/\#/g, ""));
    // image sharp 特殊处理
    if (path.extname(urlObj.pathname) === ".image") {
      if (
        urlObj.searchParams.get("e") === "gif" ||
        urlObj.searchParams.get("f") === "gif"
      ) {
        filepath = `${filepath}.gif`;
        await sharp(buffer, { animated: true, limitInputPixels: false })
          .gif({
            // 压缩核心参数
            reductionEffort: 1, // 优化等级 (0-7)
            colours: 24, // 颜色数量 (2-256)
            interFrameMaxError: 4, // 帧间优化 (0-32)
            interPaletteMaxError: 4, // 调色板优化 (0-32)
          })
          .toFile(filepath);
      } else {
        // 根据 url 中带不带 ? e 参数
        filepath = `${filepath}.webp`;
        await sharp(buffer)
          .webp({
            quality: 70,
            effort: 6,
          })
          .toFile(filepath);
      }
    } else {
      filepath = `${filepath}.webp`;
      await sharp(buffer)
        .webp({
          quality: 70,
          effort: 6,
        })
        .toFile(filepath);
    }
    // 返回相对路径
    return `./images/${path.parse(filepath).base} `; // 多增加一个空格，避免垃圾参数影响替换后路径识别
  } catch (e) {
    console.log(`${formatUrl} 转换失败`, e.message);
    await fs.appendFile(path.join(__dirname, "../.error.log"), formatUrl);
    return formatUrl;
  }
}

/**
 * 获取 markdown 中的 image 标签
 * @param {string} markdown
 */
function parseMarkdownImagesUrls(markdown, filter) {
  const regex = /!\[.*?\]\((['"]?)(.*?)\1(?:\s+["']\S*["'])?\)/g;
  let urls = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const url = match[2].trim(); // 提取并清理 URL
    urls.push(url);
  }
  urls = urls.filter((url) => url.startsWith("http")); // 过滤掉 base64 和 相对路径

  if (filter) {
    urls = urls.filter((url) => filter.test(url));
  }

  return urls;
}

// 添加 book 到缓存
async function addBookToCache(bookPath, cacheDirPath) {
  const cacheData = await fs.readJSON(cacheDirPath);
  cacheData.books.push(path.basename(bookPath));
  await fs.writeFile(cacheDirPath, JSON.stringify(cacheData, null, 2), {
    type: "utf8",
  });
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

// 判断文件名是否以数字加点或者空格开头
function filenameSortor(a, b) {
  // 正则分割：将字符串拆分为数字和非数字段
  const splitRegex = /(\d+)/;
  const aParts = a.split(splitRegex).filter((x) => x);
  const bParts = b.split(splitRegex).filter((x) => x);

  // 逐段比较
  for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
    const aPart = aParts[i];
    const bPart = bParts[i];

    // 若两段均为数字，按数值比较
    if (/\d/.test(aPart) && /\d/.test(bPart)) {
      const aNum = parseInt(aPart, 10);
      const bNum = parseInt(bPart, 10);
      if (aNum !== bNum) return aNum - bNum;
    } else {
      // 否则按字符串字典序比较（不区分大小写可添加 .toLowerCase()）
      if (aPart < bPart) return -1;
      if (aPart > bPart) return 1;
    }
  }

  // 若前缀相同，长度短的排在前面（如 "file1" vs "file1-extra"）
  return aParts.length - bParts.length;
}

// 重命名文件，优化显示
async function renameMdFilename(booksPath, mdFilePath) {
  const filePathParse = path.parse(mdFilePath);
  let newFileName = filePathParse.name; // 去除首尾空格
  // windows 下 路径中不能有 <, >, :, ", /, \, |, ?, * 等符号
  const illegalCharsTo_ = /[\\/:\*|]+/g;
  newFileName = newFileName.replaceAll(/\?/g, ""); // 替换 ? 为 空
  newFileName = newFileName.replaceAll(/[\"\'<>]/g, " "); // 替换 " 为
  newFileName = newFileName.replaceAll(illegalCharsTo_, "_"); // 其他替换为 _
  newFileName = newFileName.trim();
  const newMdFilePath = `${newFileName}${filePathParse.ext}`;
  await fs.rename(
    path.join(booksPath, mdFilePath),
    path.join(booksPath, newMdFilePath)
  );
  return newMdFilePath;
}

module.exports = {
  bookIndexFileGenerate,
  bookMetaFileGenerate,
  booksFileGenerate,
  addBookToCache,
  isBookInCache,
  checkIsDirectory,
  filenameSortor,
  booksFilenameFormat,
};
