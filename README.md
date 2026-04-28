# AI 游戏设计大赛 2026 · 报名与展示站

面向赛事的**单页站点**：首屏海报与倒计时、奖项与投稿说明、**参赛展示**列表、**多步报名表单**（含游戏名、制作者昵称、文档解析填入玩法概要等）、简易**管理后台**。技术栈为 **Vite 6 + React 19 + TypeScript + Tailwind CSS v4**（`@tailwindcss/vite`）。

| 路由 | 说明 |
|------|------|
| `/` | 首页（Hero、精选、奖项、最新投稿、提交规范、评审协议等） |
| `/showcase` | 参赛展示：排行榜、筛选/排序、卡片；可选 **Supabase 投票**（Magic Link） |
| `/showcase/:id` | 作品详情：封面叠渐变、Markdown 预览/源码、投票 |
| `/deploy` | 部署指南（网页游戏 GitHub / Supabase / Vercel 流程） |
| `/admin` | 管理（PIN 见环境变量） |

**Supabase 从零配置**：按 **[docs/SUPABASE.md](./docs/SUPABASE.md)** 执行（含 SQL 顺序与 Auth 设置）。

视觉与色板说明见仓库根目录 **[DESIGN.md](./DESIGN.md)**（含 **§7 实现备忘**：全站胶片颗粒叠放、`--film-grain-opacity`、首屏与奖项区 `.home-hero-bottom-blend` / `.home-prizes-section` 衔接等；**§8 线上部署摘要**）。设计令牌与全局样式主要在 **`src/index.css`**（`@theme` + 组件层）。

面向参赛者的**网页游戏托管流程**见站内页面 **部署指南**（路由 **`/deploy`**，上线后为 `https://<你的域名>/deploy`；本地默认 `http://localhost:3000/deploy`，若 3000 被占用请以终端实际端口为准）。该页与 README 互补：README 偏本仓库上线步骤，该页偏通用 GitHub / Supabase / Vercel 操作。

---

## 线上部署

本仓库为 **Vite 静态 SPA**（`npm run build` → **`dist/`**），`react-router` 路由在浏览器端解析，因此托管方必须把**所有路径**回退到 **`index.html`**，否则直接访问 `/showcase`、`/deploy` 等会 404。

### Vercel（推荐）

1. 将代码推送到 **GitHub**（或 GitLab / Bitbucket，视 Vercel 支持而定）。
2. 在 [Vercel](https://vercel.com) **Add New Project** → Import 该仓库。
3. **Framework Preset** 选 **Vite**（或保持自动检测）；**Build Command** `npm run build`；**Output Directory** `dist`（多数情况下 Vite 模板会自动填好）。
4. **Install Command** 默认 `npm install` 即可；Node 版本建议 **20.x**（与本地 README 一致）。
5. 在 **Project → Settings → Environment Variables** 中配置下文 **`VITE_*` 变量**（Production / Preview 按需勾选），保存后 **Redeploy** 一次使构建生效。
6. 仓库根目录已有 **`vercel.json`**：`rewrites` 将任意路径指向 `/index.html`，保证 SPA 深链与刷新可用。

### 环境变量（构建期注入）

`VITE_*` 在 **`npm run build` 时**打入前端产物，**不要**把含真实密钥的 `.env.local` 提交进 Git；仅在托管平台控制台配置。

| 变量 | 上线建议 |
|------|----------|
| `ADMIN_PIN` | **仅服务端变量**（勿 `VITE_`），生产必填，建议 12+ 位高熵字符串。`/api/showcase-admin` 用它做登录校验；前端**不再持有 PIN**，登录通过 `op:"login"` 由服务端时序安全比对后下发短期 HMAC token。 |
| `ADMIN_SESSION_SECRET` | **仅服务端变量**，签发管理员会话 token 用，建议 32+ 位随机串（`openssl rand -hex 32`）。未配置时降级派生（不推荐生产使用）。 |
| `VITE_SUPABASE_URL` | 可选。与 `VITE_SUPABASE_ANON_KEY` **同时设置**时启用远端投稿、展示与 **Auth 投票**（SQL 见 `docs/supabase-showcase.sql` + `docs/supabase-votes.sql`）。 |
| `VITE_SUPABASE_ANON_KEY` | 可选。Supabase anon key；受 RLS 约束，**不要**当作私密密钥。 |
| `SUPABASE_SERVICE_ROLE_KEY` | **仅 Vercel 服务端变量**（勿 `VITE_`）。供 `api/showcase-admin.ts` 管理数据；勿提交进 Git。 |
| ~~`VITE_ADMIN_PIN`~~ | **已废弃**。`VITE_` 前缀变量会被 Vite 在构建期内联到前端 dist，等于把 PIN 公开。服务端为兼容旧部署仍会读，但**生产请立即改用 `ADMIN_PIN`** 并在 Vercel 删除旧变量。 |
| `VITE_GEMINI_API_KEY` | 可选。写入后任何人可从构建产物中尝试提取，**演示 / 内网可接受**；公开站建议改为后端或 Edge 代理调用模型。 |
| `VITE_API_BASE` | 可选。若需「远程截图」等能力，需自行部署可公网访问的 API，再填根 URL。 |
| `VITE_GEMINI_MODEL` | 可选；与当前报名表单文档路径无必填关联。 |

复制字段名与说明见 **`.env.example`**。

### 上线前自检清单

- [ ] 本地执行 **`npm run check`**（类型检查 + 生产构建）通过。
- [ ] 托管平台已配置所需 **`VITE_*`**，且已对最新 commit **重新部署**。
- [ ] 浏览器验证：**首页** `/`、**参赛展示** `/showcase`、**部署指南** `/deploy`、**管理** `/admin`（含刷新页面）均可打开。
- [ ] 首屏 **Mux HLS** 在目标网络环境可播放（公司代理 / 地域限制可能影响 `stream.mux.com`）。
- [ ] 已理解：未配置 Supabase 时投稿在浏览器 **`localStorage`**；配置后全员可读可见稿（见下节）。

### 跨访客：localStorage 与 Supabase「公开只读」

- **未配置 `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`**：投稿写入 **`localStorage`**（键 `ai_game_2026_showcase_submissions`），**`getShowcaseListAsync()`**（`src/lib/showcaseMerge.ts`）无用户稿时展示 `mockShowcase` 6 条兜底；**一旦存在可见用户稿**，列表即切换为纯用户稿展示，不再混入 mock（避免"首位 mock 被挤掉"造成修改错觉）。换设备或清缓存后看不到他人本机数据。

- **已配置 Supabase**（并在控制台执行 **`docs/supabase-showcase.sql`** 与 **`docs/supabase-votes.sql`**，详见 **`docs/SUPABASE.md`**）：展示页用 anon 客户端读可见稿与票数；匿名 **`INSERT`** 投稿；登录用户 **`INSERT`** 本人投票；**改 / 删 / 全量列表** 走 **`POST /api/showcase-admin`**（先用 `ADMIN_PIN` 走 `op:"login"` 换取短期 HMAC token，后续请求只携带 token；服务端用 **`SUPABASE_SERVICE_ROLE_KEY`** 执行），anon 无 `UPDATE`/`DELETE` 稿件权限。

**本地 `npm run dev`**：Vite 不托管 `api/*`，管理接口与远端列表需在 **Vercel 预览 / 生产** 验证，或本地运行 **`vercel dev`**（需安装 [Vercel CLI](https://vercel.com/docs/cli)）以同时提供前端与 Serverless。

其它后端方案仍可自建 API + 数据库，前端通过 `VITE_API_BASE` 等对接。

### 其他平台（Netlify / Cloudflare Pages / OSS 静态站）

同样需配置：**构建命令** `npm run build`，**发布目录** `dist`，以及等价于 `vercel.json` 的 **SPA fallback**（全部路由 → `index.html`）。具体菜单名称因平台而异。

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

开发地址：默认 <http://localhost:3000>（端口占用时 Vite 会自动顺延到 `3001+`）。

### 当前静态资源路径（上线核对）

- Showcase Hero 背景图：`/imge/game_bg4.jpg`（`src/pages/ShowcasePage.tsx`）
- 浏览器 favicon：`/imge/favicon_logo_16px.png`、`/imge/favicon_logo_64px.png`（`index.html`）

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
| `ADMIN_PIN` | **生产必填，仅服务端变量**。`/admin` 登录密钥；前端永远不持有，登录由 `/api/showcase-admin` 服务端时序安全比对，成功后下发 12h 有效期 HMAC 会话 token。 |
| `ADMIN_SESSION_SECRET` | 仅服务端；签发会话 token 用的随机串（建议 `openssl rand -hex 32`）。未配置时降级派生，**不推荐生产使用**。 |
| `VITE_GEMINI_API_KEY` | 可选。当前报名表单**文档上传**仅使用**本地启发式**生成概要，不调用 Gemini；变量保留供后续扩展或其它功能使用。 |
| `VITE_GEMINI_MODEL` | 可选。默认 `gemini-2.0-flash`（同上，与文档上传路径无联动时可不配置）。 |

> **说明：** 若日后在前端直连 Gemini，仅适合演示；正式环境建议由后端或 Edge 代理，避免暴露密钥。

---

## 功能概要

| 模块 | 说明 |
|------|------|
| 首页 | Mux HLS 背景视频（`HeroMuxHlsVideo.tsx`）、投稿截止倒计时、奖项与投稿规范、评审权重展示；首屏底缘与奖项区背景衔接见 `DESIGN.md` §7、`HomePage.tsx` + `index.css` |
| 参赛展示 | `showcaseMerge`：可选 Supabase 远端稿 + `localStorage` + `mockShowcase`；投票与排行榜见 `showcaseVotes.ts` |
| 作品详情 | `/showcase/:id`：Markdown 展示、Hero 叠渐变、投票条 |
| 提交作品 | 多步表单；文档 → 抽文本（pdf.js、mammoth）→ **本地启发式**概要回填；含创作者昵称（组队可用逗号分隔，上限 80 字符，提交时自动规范化） |
| 管理 | 条目可见性、编辑、删除 |

**主要依赖（业务向）：** `react-router-dom`、`motion`、`hls.js`、`pdfjs-dist`、`mammoth`。

---

## 目录结构（摘要）

```
src/
  components/     # UI、布局、报名表单、展示卡等
  pages/          # HomePage、ShowcasePage、ShowcaseDetailPage、DeploymentGuidePage、AdminPage
  lib/            # 存储、展示合并、文档摘要、截图请求等
  data/           # 示例展示数据 mockShowcase
index.html
vite.config.ts
vercel.json       # SPA：全部路径 → /index.html
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
