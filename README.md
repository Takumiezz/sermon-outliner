# 讲道大纲生成器

基于圣经和合本的讲道大纲自动生成工具。面向教会传道人、小组带领者、主日学教师。

> 在线使用：[https://takumiezz.github.io/sermon-outliner/](https://takumiezz.github.io/sermon-outliner/)

## 功能

- **经文检索**：按卷/章/节选择经文，支持快速输入（如 `创1:1-5`）
- **经文展示**：逐节显示和合本原文，确保一字不差
- **智能大纲生成**：根据经文体裁（叙事/诗歌/书信/预言/律法）自动生成结构化讲道大纲
- **大纲内容**：讲道题目 → 引言要点 → 主体论点（核心陈述+经文引用+生活化解释）→ 应用挑战 → 结语
- **PWA 支持**：可添加到手机主屏幕，离线可用

## 技术栈

纯前端静态应用，无需后端服务：

- HTML + CSS + JavaScript
- PWA（Service Worker + Web App Manifest）
- 圣经文本数据（和合本，JSON 格式）

## 本地运行

直接用浏览器打开 `index.html` 即可。或用 HTTP 服务器：

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```

## 项目结构

```
index.html         主页面
styles.css         样式
manifest.json      PWA 清单
sw.js              Service Worker（离线缓存）
deploy.bat         部署脚本（Windows）
deploy2.ps1        PowerShell 部署脚本
README.md          本文件

js/
  bible-data.js          66卷书章节结构
  bible-text.js          和合本经文文本（已收录10+关键章节）
  outline-generator.js   大纲生成引擎（5种体裁模板）
  app.js                 应用逻辑

icons/
  icon-192.svg    PWA 图标
  icon-512.svg    PWA 图标
```

## 当前收录经文

| 书卷 | 章节 | 
|------|------|
| 创世记 | 第1章（创造天地）、第2章（伊甸园）、第3章（人类堕落） |
| 诗篇 | 第23篇（耶和华是我的牧者） |
| 马太福音 | 第5章（登山宝训·八福）、第28章（大使命） |
| 约翰福音 | 第3章（重生与神爱世人）、第14章（道路真理生命） |
| 罗马书 | 第8章（圣灵中的自由） |
| 哥林多前书 | 第13章（爱的真谛） |
| 以弗所书 | 第2章（恩典与合一） |
| 腓立比书 | 第2章（基督的谦卑） |
| 希伯来书 | 第11章（信心见证人） |
| 启示录 | 第21章（新天新地） |

按 `js/bible-text.js` 的格式添加更多经文即可扩展。

## 部署到 GitHub Pages

双击 `deploy.bat` 即可自动部署（需要 Windows + PowerShell）。

或手动部署：

1. 在 GitHub 创建仓库 `sermon-outliner`
2. 将全部文件 push 到 `main` 分支
3. 在仓库 Settings → Pages 中启用，选择 `main` 分支的 `/` 路径

## 大纲生成原则

- 讲道题目不超过 15 字
- 核心陈述不超过 25 字
- 避免生硬神学术语
- 每个论点有经文支撑
- 应用建议具体可操作
- 语言像慈祥长者娓娓道来

## 许可证

MIT
