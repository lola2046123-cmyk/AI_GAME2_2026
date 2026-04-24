# 全站页面结构 · 文本层级 · 交互方式

> 供后续基于框架改版或迁移时对照。技术栈：React 19、Vite 6、React Router 7、Tailwind CSS 4、Motion；入口 `src/main.tsx` → `App.tsx`。

---

## 一、全局壳层（所有路由共用）

| 层级 | 组件 / 文件 | 职责 |
|------|----------------|------|
| 根 | `#root` → `App` | `BrowserRouter` |
| 路由树 | `App.tsx` → `RoutedTree` | `Routes` + `Outlet`（注入上下文） |
| 全局 UI | `AppChrome` | 背景氛围（`.app-atmosphere`）、胶片颗粒、固定顶栏占位、`overflow-x-clip` 包裹页面主体 |
| 顶栏 | `SiteHeader` | 品牌链接、主导航、「提交作品」、`管理`（链至 `/admin`）、移动端全屏菜单；**登录 / 退出**未挂在顶栏，当前由参赛展示相关页内的 `LoginModal` 在需要投票时触发 |
| 全局浮层 | `RegistrationModal` | 与路由并列渲染在 `AppChrome` 内，受 `modal` 状态驱动 |

**布局常量（`index.css`）**

- `--site-header-height`：顶栏总高（含安全区）
- 主阅读列：`.max-w-home`（`min(100%, 1024px)`），顶栏与多数区块 `px-6 md:px-12` 与之一致

**跨页上下文**

- `RegistrationUiContext`：`openRegister()`，供顶栏「提交作品」等调用
- `Outlet` context（`AppOutletContext`）：`openRegister`、`openEdit(record)`，供首页/管理页打开报名表单

---

## 二、路由与页面地图

| 路径 | 页面组件 | 说明 |
|------|-----------|------|
| `/` | `HomePage` | 营销首页：Hero → 精选展示 → 奖项 → 最新投稿 → 提交规范 → 评审协议 → Footer（模块顺序以 `HomePage.tsx` 为准） |
| `/showcase` | `ShowcasePage` | 参赛作品「展览页」：排行榜、筛选/排序、卡片栅格；集成投票与 Magic Link 登录弹窗 |
| `/showcase/:id` | `ShowcaseDetailPage` | 单作品详情：封面与 CTA、Markdown 正文（`react-markdown` + `remark-gfm`）、预览 / 源码切换、投票条与登录弹窗 |
| `/deploy` | `DeploymentGuidePage` | 部署教程长文 |
| `/admin` | `AdminPage` | PIN 登录后作品列表与可见性/删除 |
| `*` | `Navigate` → `/` | 兜底 |

**提交后导航（`RegistrationModal`）**

- 普通提交成功：`navigate("/showcase")`
- 管理侧保存等：`navigate("/admin")`（以组件 props 为准）

---

## 三、文本层级约定（语义 → 典型样式）

以下为**信息架构层级**，便于 CMS 或设计系统映射；具体 class 以代码为准。

### 3.1 全站级

| 层级 | 含义 | 典型实现 |
|------|------|-----------|
| **L0 品牌** | 站点标识 | 顶栏 `AI_GAME_2026`，`Link` → `/` |
| **L1 导航** | 一级频道 | `NavLink`：首页海报、参赛展示、部署指南 |
| **L1 行动** | 全局主 CTA | 「提交作品」→ `openRegistration()` |

### 3.2 区块标题组件 `SectionTitleEnDecor`

用于「中文主标题 + 英文弱装饰」：

| 角色 | DOM | 说明 |
|------|-----|------|
| **一级区块标题（中文）** | `h1` 或 `h2`（`headingLevel`） | `titleZh`，大字 `font-headline` |
| **英文装饰** | `span[aria-hidden]` | `titleEn`，小号大写、低对比，不参与同级阅读 |

- 独立页可把 `headingLevel={1}`（如参赛展示页主标题）
- 首页内区块默认 `h2`

### 3.3 首页 `HomePage` 内层级（当前模块顺序）

| 顺序 | 区块 | 前置标签 / 装饰 | 一级标题（中） | 二级 / 正文 |
|------|------|-----------------|----------------|---------------|
| 1 | Hero | — | 大赛主标题 | 副文案、倒计时、CTA（含「浏览展示」等） |
| 2 | 精选展示 | 英文弱标签 | `SectionTitleEnDecor` | 1 大 + 2 小卡片，链至 `/showcase/:id` |
| 3 | 奖项 | `Prizes & Seats` 等 | 「奖项设置 / PRIZES」 | 导语；奖励卡片 HUD |
| 4 | 最新投稿 | — | 区块标题 | 横向或栅格展示近期作品入口 |
| 5 | 提交规范 | `Rules & Platform` | 「提交规范与平台 / SUBMISSION」 | 小节卡片 |
| 6 | 评审协议 | `Scoring Weight Matrix` | 「评审协议 / PROTOCOL」 | 维度说明等 |
| — | Footer | — | — | 版权与占位链接 |

第二屏起的区块标题在实现上多为**左对齐**，与早期居中海报区区分。

### 3.4 参赛展示 `ShowcasePage`

| 层级 | 内容 |
|------|------|
| **L1** | `SectionTitleEnDecor` `headingLevel={1}`：参赛作品 / SHOWCASE（二级页首屏高度与部署指南对齐） |
| **L2** | 副文案（人类 × AI 主题说明 + 英文辅助） |
| **排行榜** | 四个 `RankingList`（各 Top 5）：热门、视觉最佳、最有趣、最想氪金（`fun`）；独立图标与配色，名次 1–3 有视觉区分 |
| **筛选 / 排序** | 客户端：分类 `全部 | AI | 叙事 | 策略 | 实验`（与 `techStack` / 文案关键词匹配）；排序 `最新 | 热门 | 获奖`（热门按 `voteMap` 中 `like` 计数；获奖按内置 `AWARD_STATUS` 映射） |
| **卡片** | `ShowcaseCard`：16:9 封面、标题一行、摘要（`summary` 优先，否则从 Markdown 剥离截断）、标签、获奖角标、悬停「查看作品」；底部可选 `ShowcaseVoteBar`（紧凑模式） |

### 3.5 参赛详情 `ShowcaseDetailPage`

| 层级 | 内容 |
|------|------|
| **L1** | 作品名、封面叠渐变、简介（行截断）、标签、外链 CTA（仅「立即体验」） |
| **正文** | Markdown 安全渲染；`预览` / `源码` 切换 |
| **互动** | `ShowcaseVoteBar` 全功能条；未登录时触发 `LoginModal` |

数据来源：`getShowcaseListAsync()` 解析当前 `id`（含 mock 与用户投稿）；富文本 Markdown 优先读 `SHOWCASE_DETAILS[id]`，无则回退作品字段。

### 3.6 部署指南 `DeploymentGuidePage`

| 层级 | 内容 |
|------|------|
| **L1** | `h1`：把你的网页游戏 / 部署上线（两行） |
| **L2** | 首屏说明 `p`（`#FFFFFF`、较小字号） |
| **整体架构** | 四节点：**Lucide 图标**（Monitor / Github / Triangle / Database）+ 文案，箭头连接；非系统 Emoji |
| **工具外链** | 三个 `<a target="_blank">`：GitHub / Supabase / Vercel |
| **路线图标签** | `font-label`：部署路线图 — 四步完成 |
| **步骤卡** | 四个 `button` 滚动锚点 |
| **正文小节** | `DeploySection`：`h2` + 副标题 `font-label`；`SubCard` 内 `h3`（编号 pill + 标题）+ 正文 / 代码块 / Callout |
| **FAQ** | `h2` 常见问题 + `details`/`summary` |
| **收尾** | `h2` + 说明 + 示例 URL pill + 脚注 |
| **固定** | 回到顶部 `button`；顶栏下进度条（滚动宽度） |

### 3.7 管理页 `AdminPage`

| 状态 | 层级 |
|------|------|
| 未登录 | 主说明 + PIN 表单 |
| 已登录 | 列表标题、表格/卡片行、操作（编辑弹窗、可见性、删除确认） |

---

## 四、交互方式汇总

### 4.1 路由与导航

- **顶栏 `NavLink`**：高亮当前路径；切换路由关闭移动菜单
- **移动菜单**：全屏 `role="dialog"`，`body` 滚动锁定
- **品牌 `Link`**：回首页
- **展示卡片主区域**：`Link` → `/showcase/:id`；外链按钮仍可在新标签打开（以 `ShowcaseCard` 为准）

### 4.2 报名 / 编辑（`RegistrationModal`）

- **打开**：`openRegister()`（新建）或 `openEdit(record)`（编辑已有展示项）
- **关闭**：内部状态机 `RegistrationModalState`（`closed` / `create` / `edit`）
- **成功回调**：见第二节路由跳转

### 4.3 首页

- **Hero「立即参赛」等**：`openRegister()` 或链至展示页（以具体按钮为准）
- **精选 / 最新模块**：链至 `/showcase/:id` 或列表
- **奖项 / 规范卡片**：主要为展示；`surface-card` 悬停有全局 CSS 动效

### 4.4 参赛展示（列表 + 排行榜 + 投票）

- **列表数据**：`getShowcaseListAsync()`（合并 mock、本地与 Supabase 可见稿件，逻辑见 `showcaseMerge` / `submissionsStorage`）
- **投票读数**：`getVoteStateForProjects(projectIds, user?.id)`，经 **`getSupabaseAnon()`** 查询表 `showcase_votes`（未配置 Supabase 时返回全零计数）
- **排行榜**：`buildRankings(items, voteMap)` 在客户端聚合四类票数，各取 Top 5；仅展示票数大于 0 的条目
- **排序「热门」**：按投票状态中的 `like` 计数排序（与真实点赞一致）
- **卡片投票条 `ShowcaseVoteBar`**：
  - 未登录：点击点赞或分类票 → `onRequireLogin` → 打开 `LoginModal`
  - 已登录：写入经 **`getSupabaseAuth()`** 的同一 `showcase_votes` 表；成功后有轻量 +1 反馈；重复投票由唯一约束拦截，文案见下节
  - 请求中禁用按钮，避免连点

### 4.5 参赛详情

- **进入条件**：`id` 在合并列表中不存在时 `Navigate` 回 `/showcase`（以页面实现为准）
- **投票**：与列表共用 `ShowcaseVoteBar` + `LoginModal`；按当前作品 id 拉取单条 `voteState`

### 4.6 身份与点赞 / 投票逻辑（Supabase）

| 项目 | 说明 |
|------|------|
| **环境变量** | `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`（与投稿只读/写入共用同一 anon key；鉴权仍走 Supabase Auth） |
| **双客户端** | `getSupabaseAnon()`：`persistSession: false`，适合匿名读票；`getSupabaseAuth()`：`persistSession: true`、`detectSessionInUrl: true`，供 Magic Link 与写票 |
| **会话** | `useCurrentUser()`：`getSession` + `onAuthStateChange`，向 UI 提供 `user` / `loading` |
| **登录 UI** | `LoginModal`：`signInWithOtp` 发邮件魔法链接；仅在需要投票的页面挂载 |
| **数据表** | `showcase_votes`：字段含 `project_id`、`user_id`、`type`（见 `VoteType`） |
| **投票类型** | `like`、`fun`、`visual`、`gameplay`（UI：最想氪金 / 视觉最佳 / 最有趣） |
| **不可重复规则** | 同一用户对同一作品的**同一 `type` 至多一条记录**；违反唯一约束时前端提示「你已经点过赞了。」（like）或「这个分类你已经投过了。」（分类票） |
| **并存** | 点赞与三种分类票互不冲突：同一用户可对同一作品分别投 `like` 与至多各一条的 `fun` / `visual` / `gameplay`（依赖表上 `(project_id, user_id, type)` 唯一约束；若线上未建表或未配 RLS，以实际报错为准） |

> **运维提示**：投稿与投票 SQL 见 `docs/supabase-showcase.sql`、`docs/supabase-votes.sql`；步骤汇总见 `docs/SUPABASE.md`。

### 4.7 部署指南

- **路线图四卡**：`scrollToId` 平滑滚动至对应 `DeploySection`
- **外链**：GitHub / Supabase / Vercel 官方站
- **FAQ**：原生 `<details>` 展开
- **回到顶部**：`window.scrollTo`

### 4.8 管理页

- **PIN 登录**：本地 `adminSession` 与 `getAdminPin()`（环境变量）
- **列表**：加载 `loadUserSubmissionsAsync`；删除 / 可见性写回存储或远端（见 `submissionsStorage`）
- **编辑**：`openEdit` 打开同一套 `RegistrationModal`

### 4.9 全局装饰（非业务交互）

- `ArenaCursorTrail`：光标轨迹（可配置关闭类名见 `arenaFxConfig`）
- `app-film-grain`：胶片颗粒层

---

## 五、改版时可复用的「框架契约」

1. **新页面**：放入 `Routes`，内容放在 `AppChrome` 的 `Outlet` 下即可继承顶栏与氛围；主列用 `max-w-home` + 与首页一致的横向 `padding`。
2. **需要打开报名表单**：在路由下使用 `useOutletContext<AppOutletContext>()` 取 `openRegister` / `openEdit`；或 `useOpenRegistration()` 仅新建。
3. **区块标题**：优先复用 `SectionTitleEnDecor`，区分首页内 `h2` 与独立页 `h1`。
4. **内容卡片**：优先 `surface-card` + `rounded-xl` + `border-white/[0.08]`，与部署指南 FAQ、SubCard 一致。
5. **展示类动效**：以 `hover` 与进入视口的轻量 `fade-in` 为主；首页可继续使用 `motion/react`。改版时注意 `prefers-reduced-motion`（首页 Hero 已有订阅示例）。
6. **投票相关新页面**：复用 `useCurrentUser` + `getVoteStateForProjects` + `ShowcaseVoteBar`；写操作统一走 `getSupabaseAuth()`。

---

## 六、相关文件索引（按需深入）

| 领域 | 路径 |
|------|------|
| 路由与上下文 | `src/App.tsx`、`src/types/outlet.ts` |
| 布局 | `src/components/layout/AppChrome.tsx`、`SiteHeader.tsx` |
| 报名 | `src/components/registration/RegistrationModal.tsx`、`RegistrationUiContext.tsx` |
| 页面 | `src/pages/HomePage.tsx`、`ShowcasePage.tsx`、`ShowcaseDetailPage.tsx`、`DeploymentGuidePage.tsx`、`AdminPage.tsx` |
| 展示卡片 / 投票 UI | `src/components/showcase/ShowcaseCard.tsx`、`ShowcaseVoteBar.tsx`、`RankingList.tsx` |
| 投票与排行数据层 | `src/lib/showcaseVotes.ts` |
| 摘要（Markdown 剥离） | `src/lib/showcaseCardSummary.ts` |
| Supabase 客户端 | `src/lib/supabaseClient.ts` |
| 当前用户 | `src/hooks/useCurrentUser.ts` |
| 登录弹窗 | `src/components/auth/LoginModal.tsx` |
| 详情 Markdown 示例 | `src/data/showcaseDetails.ts` |
| 投稿表 RLS 示例 | `docs/supabase-showcase.sql` |
| 主题与组件层样式 | `src/index.css`（`@theme`、`surface-card`、`max-w-home`） |
| 设计说明（视觉理念） | `DESIGN.md` |

文档版本与仓库同步；若路由、`showcase_votes` 表结构或 `Outlet` 字段变更，请更新本节。
