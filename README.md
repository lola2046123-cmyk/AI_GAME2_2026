# AI 游戏设计大赛 2026 · 报名与展示站

面向赛事的**单页站点**：首屏海报与倒计时、奖项与投稿说明、**参赛展示**列表、**多步报名表单**（文档解析 + 可选 Gemini 摘要）、简易**管理后台**。技术栈为 **Vite 6 + React 19 + TypeScript + Tailwind CSS v4**（`@tailwindcss/vite`）。

| 路由 | 说明 |
|------|------|
| `/` | 首页 |
| `/showcase` | 参赛展示（`localStorage` 用户投稿 + 内置示例合并） |
| `/admin` | 管理（PIN 见环境变量） |

视觉与色板说明见仓库根目录 **[DESIGN.md](./DESIGN.md)**；设计令牌与全局样式主要在 **`src/index.css`**（`@theme` + 组件层）。

---

## 环境要求

- **Node.js ≥ 18**（推荐 **20 LTS**）
- 包管理器：**npm**（也可用 pnpm / yarn）

---

## 快速开始

```bash
npm install
npm run dev
```

开发地址：<http://localhost:3000>

| 命令 | 说明 |
|------|------|
| `npm run build` | 生产构建，输出 `dist/` |
| `npm run preview` | 本地预览构建结果 |
| `npm run lint` | `tsc --noEmit` 类型检查 |
| `npm run check` | **lint + build**，提交前建议执行 |
| `npm run clean` | 删除 `dist/`、`.vite/` |
| `npm run clean:deps` | 删除 `node_modules/`（之后需重新 `npm install`） |

---

## 环境变量

复制 **`.env.example`** 为 **`.env.local`**（已在 `.gitignore` 中忽略，勿提交密钥）。

| 变量 | 说明 |
|------|------|
| `VITE_API_BASE` | 可选。后端根 URL；用于 `POST /api/screenshot` 生成作品缩略图。留空则无远程截图，依赖用户上传封面或占位图。 |
| `VITE_ADMIN_PIN` | 可选。`/admin` 登录 PIN；未设置时开发环境默认 `2026`（**仅前端校验**，生产须配合服务端权限）。 |
| `VITE_GEMINI_API_KEY` | 可选。配置后报名表单上传 PDF / Markdown / Word 可走 **Gemini** 生成玩法摘要；**不配置**则使用**本地启发式摘要**（无需 Key、无需联网）。 |
| `VITE_GEMINI_MODEL` | 可选。默认 `gemini-2.0-flash`。 |

> **安全：** 前端直连 Gemini 仅适合演示；正式环境建议由后端或 Edge 代理，避免暴露密钥。

---

## 功能概要

| 模块 | 说明 |
|------|------|
| 首页 | Mux HLS 背景视频（`HeroMuxHlsVideo.tsx`）、投稿截止倒计时、奖项与投稿规范、评审权重展示 |
| 参赛展示 | `showcaseMerge`：用户投稿（`localStorage`）与 `mockShowcase` 合并列表 |
| 提交作品 | 多步表单；文档 → 抽文本（pdf.js、mammoth）→ 可选 Gemini 或本地摘要回填 |
| 管理 | 条目可见性、编辑、删除 |

**主要依赖（业务向）：** `react-router-dom`、`motion`、`hls.js`、`pdfjs-dist`、`mammoth`。

---

## 目录结构（摘要）

```
src/
  components/     # UI、布局、报名表单、展示卡等
  pages/          # HomePage、ShowcasePage、AdminPage
  lib/            # 存储、展示合并、文档摘要、截图请求等
  data/           # 示例展示数据 mockShowcase
index.html
vite.config.ts
```

---

## 提交作品包说明

**不要**打入压缩包（可本地重建、体积大）：

- `node_modules/`
- `dist/`
- `.vite/`

解压后执行 **`npm install && npm run build`** 即可验证。提交前建议在本机执行 **`npm run check`**。

首屏视频为**在线 HLS**，一般无需在 `public/` 放 mp4。若改为本地资源，将文件放入 `public/` 并调整 `HeroMuxHlsVideo.tsx`。

---

## 许可证

以赛事或主办方要求为准；仓库 `package.json` 为 `private: true`，默认按**内部参赛 / 评审用途**处理。
