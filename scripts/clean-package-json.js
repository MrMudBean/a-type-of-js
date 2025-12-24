import {
  pathJoin,
  readFileToJsonSync,
  getDirectoryBy,
  writeJsonFile,
  fileExist,
} from 'a-node-tools';
import { readdirSync } from 'node:fs';
import { basename, extname } from 'node:path';

// 原始 package.json 内容
let packageJson = readFileToJsonSync('./package.json');
// 移除冗余的键
['scripts', 'devDependencies', 'lint-staged', 'private'].forEach(
  key => delete packageJson[key],
);
// 查看当前打包 dist 文件路径
const distParentPath = getDirectoryBy('dist', 'directory');
// 查看当前的源码文件路径（原则上与上面值一致）
const srcParentDirectory = getDirectoryBy('src', 'directory');
// 当前 src 的路径
const srcDirectory = pathJoin(srcParentDirectory, 'src');
// src 目录下的文件列表
const srcChildrenList = readdirSync(srcDirectory);
// 打包的 exports
const exportsList = {};

for (const childrenName of srcChildrenList) {
  // 如果是测试文件则跳过
  if (
    // 剔除测试文件
    childrenName.endsWith('.test.ts') ||
    // 剔除非导出模块
    ['testData.ts', 'types.ts'].includes(childrenName)
  )
    continue;
  // 文件名（不带后缀）
  const childrenBaseName = basename(childrenName, extname(childrenName));
  // 子文件/夹的路径
  const childPath = pathJoin(srcDirectory, childrenName);
  console.log(childPath);
  const childFile = fileExist(childPath); // 文件元数据
  if (!childFile) throw new RangeError(`${childrenName} 文件未能读取`);
  // 子文件是文件夹时以 index.xxx.js 为准
  if (childFile.isDirectory()) {
    exportsList[`./${childrenBaseName}`] = {
      default: `./src/${childrenName}/index.mjs.js`,
      import: `./src/${childrenName}/index.mjs.js`,
      require: `./src/${childrenName}/index.cjs.js`,
      types: `./src/${childrenName}/index.d.ts`,
    };
  } else if (childFile.isFile()) {
    exportsList[`./${childrenBaseName}`] = {
      default: `./src/${childrenBaseName}.mjs.js`,
      import: `./src/${childrenBaseName}.mjs.js`,
      require: `./src/${childrenBaseName}.cjs.js`,
      types: `./src/${childrenBaseName}.d.ts`,
    };
  } else {
    throw new Range(`${childrenName} 文件类型不符合要求`);
  }
}

// 整理后的 package.json 内容
packageJson = {
  main: 'index.cjs.js', // 旧版本 CommonJs 入口
  module: 'index.mjs.js', // 旧版本 ESM 入口
  types: 'index.d.ts', // 旧版本类型入口
  author: {
    name: '花生亻',
    email: 'earthnut.dev@outlook.com',
    url: 'https://earthnut.dev',
  },
  description: 'JavaScript/TypeScript 的类型检测工具，支持 TypeScript 类型收缩',
  sideEffects: false, // 核心：开启 Tree Shaking
  engines: {
    // 新增：声明 Node.js 兼容版本
    node: '>=14.0.0',
  },
  license: 'MIT',
  ...packageJson,
  files: ['index.cjs.js', 'index.mjs.js', 'index.d.ts', 'src'],
  exports: {
    '.': {
      import: './index.mjs.js',
      default: './index.mjs.js',
      require: './index.cjs.js',
      types: './index.d.ts',
    },
    ...exportsList,
  },
  keywords: [
    'a-type-of-js',
    'earthnut',
    'Mr.MudBean',
    'type of js',
    'type check',
    'type validation',
    'javascript type',
    'typescript type',
    '类型检测',
    '类型判断',
    '类型收缩',
    'JS 类型',
    'TS 类型',
  ],
  homepage: 'https://earthnut.dev/npm/a-type-of-js',
  bugs: {
    url: 'https://github.com/MrMudBean/a-type-of-js/issues',
    email: 'Mr.MudBean@outlook.com',
  },
  repository: {
    type: 'git',
    url: 'git+https://github.com/MrMudBean/a-type-of-js.git',
  },
  publishConfig: {
    access: 'public',
    registry: 'https://registry.npmjs.org/',
  },
};

{
  // 整理打包后 package.json 文件路径
  const distPackagePath = pathJoin(distParentPath, './dist/package.json');
  // 写入新的 packages.json 文件
  writeJsonFile(distPackagePath, packageJson);
}
