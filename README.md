# AI 游戏设计大赛 2026 · 报名与展示站

基于 **Vite 6 + React 19 + TypeScript + Tailwind CSS v4** 的单页应用：首页海报、参赛作品展示、报名表单（含文档解析与可选 AI 摘要）、简易管理后台。

## 环境要求

- **Node.js ≥ 18**（推荐 **20 LTS**；Vite 6 需较新运行时）
- 包管理器：`npm`（或自行用 `pnpm` / `yarn` 安装依赖）

## 快速开始

```bash
npm install
npm run dev
```

默认开发地址：<http://localhost:3000>

```bash
npm run build    # 静态资源输出至 dist/
npm run preview  # 本地预览构建结果
npm run lint     # TypeScript 检查（tsc --noEmit）
npm run check    # lint + build，提交前自检
```

## 环境变量

复制 `.env.example` 为 `.env.local` 后按需填写（`.env.local` 已在 `.gitignore` 中忽略）。

| 变量 | 说明 |
|------|------|
| `VITE_API_BASE` | 可选。后端根 URL；用于 `POST /api/screenshot` 生成作品缩略图。留空时无截图服务，依赖用户上传封面或使用站内占位图。 |
| `VITE_ADMIN_PIN` | 可选。管理页登录 PIN；未设置时开发环境默认 `2026`（仅前端校验，生产请配合服务端权限）。 |
| `VITE_GEMINI_API_KEY` | 可选。配置后报名表单上传 PDF/Markdown/Word 可走 **Gemini** 生成玩法摘要；**不配置**则使用**本地启发式摘要**（无需 Key、无需联网）。 |
| `VITE_GEMINI_MODEL` | 可选。默认 `gemini-2.0-flash`，可按账号可用模型修改。 |

> **安全提示：** 前端直连 Gemini 仅适合演示；正式环境建议由后端或 Edge Function 代理，避免暴露密钥。

## 功能概要

| 模块 | 说明 |
|------|------|
| 首页 | 全屏背景视频（Mux HLS，见 `HeroMuxHlsVideo.tsx`）、倒计时、奖项与提交规范、评审权重展示 |
| 参赛展示 | 本地 `localStorage` 持久化用户投稿 + 内置示例数据合并列表（`showcaseMerge`） |
| 提交作品 | 多步表单；支持文档上传 → 抽文本（pdf.js / mammoth）→ 可选 Gemini 或本地摘要回填 |
| 管理 | `/admin` 可见性切换、编辑、删除（PIN 见上） |

## 提交作品包说明

**请勿**将下列目录打入压缩包（体积大且可重建）：

- `node_modules/`
- `dist/`
- `.vite/`

收件方解压后执行 `npm install && npm run build` 即可。若需最小体积，可先在本机执行：

```bash
npm run clean        # 删除 dist、.vite
npm run clean:deps   # 删除 node_modules（之后需重新 npm install）
```

## 大体积素材

首屏视频为在线 HLS，**无需**在 `public/` 放置 mp4。若改成本地视频，将文件放入 `public/` 并修改 `HeroMuxHlsVideo.tsx` 引用方式即可（`public/*.mp4` 已默认忽略进 Git）。

## 许可证

以赛事/主办方要求为准；若未特别说明，可按仓库内 `package.json` 的 `private: true` 视为内部参赛作品使用。
