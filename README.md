# 长航干散货收入分析

React + TypeScript + Vite 前端源码。包含收入总览、船舶分析、单船详情、多维分析及自助分析，沿用原页面的样式、示例数据和交互。

## 本地开发

使用 Node.js 22.16 或更新的 22.x 版本。

```sh
npm ci
npm run dev
```

访问 http://localhost:3019/dry-bulk/index.html 。

```sh
npm test          # 页面对照和交互回归
npm run typecheck # TypeScript 检查
npm run build     # 生产构建，输出 dist
npm run preview   # 本地预览生产构建
```

## Cloudflare Pages 部署

将本目录的源码提交到 GitHub 或 GitLab 仓库（包含 package-lock.json，不包含 node_modules 和 dist），在 Cloudflare 控制台创建 Pages 项目并连接仓库。

| 配置项       | 值                                                                 |
| ------------ | ------------------------------------------------------------------ |
| 框架预设     | React (Vite)                                                       |
| 根目录       | 若仓库直接存放本项目则留空；若提交整个上级目录则填 changhang-react |
| 构建命令     | npm run build                                                      |
| 构建输出目录 | dist                                                               |
| Node.js 版本 | 22.16.0（项目含 .node-version，也可设置 NODE_VERSION）             |

保存并部署后，访问 Pages 提供的域名即可。后续提交到生产分支会触发自动构建。

public/\_redirects 支持根路径、/dry-bulk/index.html 及 /dry-bulk/self-analysis.html 入口。所有静态资源由 Vite 打包，没有 localhost 服务依赖。此项目是静态前端，不需要 Workers、数据库、API 密钥或服务端运行环境。

官方说明：[React 部署指南](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/)、[构建配置](https://developers.cloudflare.com/pages/configuration/build-configuration/)。

## 源码结构

- src/pages：收入总览、船舶、单船、多维、自助分析页面。
- src/components：导航、筛选、指标卡、弹窗、自助查询组件。
- src/charts：趋势、分布、九宫格、结构图等 SVG 图表。
- src/hooks：页面状态、筛选联动、轨迹播放、查询和模板交互。
- src/data：数据类型、示例船舶数据、指标计算、查询引擎。
- src/styles：原页面样式及组件补充样式。
- src/utils：格式化、CSV 导出等通用函数。
- tests：117 组原页面状态对照及关键交互测试。

业务界面使用 TSX 组件实现，没有 iframe 或整页 HTML 注入。根目录 index.html 仅是 Vite 必需的应用挂载入口。自助分析通过 React Portal 在 Shadow DOM 内渲染，以隔离原有样式。

## 数据与验证范围

当前仍使用原型示例数据，尚未接入真实业务接口。最近搜索及查询模板保存于浏览器 localStorage；部署到新域名后不会自动带入本地站点的存储记录。

回归覆盖页面文字、表格结构、提示内容、SVG 坐标，以及筛选、排序、指标切换、单船跳转、轨迹播放、自助查询、分页和模板保存。自动测试不代替真实浏览器的逐像素视觉验收。
# csc_dbincome_web
