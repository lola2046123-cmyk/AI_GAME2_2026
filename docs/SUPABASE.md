# Supabase 配置说明（与当前前端一致）

> 与 `README.md` 线上部署章节配合使用。执行顺序：**建项目 → Auth → 表与 RLS → 环境变量 → 验证**。

---

## 一、控制台必做项（概览）

1. **新建项目**（或选用已有项目），记下 **Project URL**、**anon public key**、**service_role key**（仅服务端使用）。
2. **Authentication**：开启 **Email**（Magic Link）；在 **URL Configuration** 中把 **Site URL** 设为生产站点根地址（如 `https://你的域名`），**Redirect URLs** 加入本地与预览域名（如 `http://localhost:3000/**`），否则邮件链接回调会失败。
3. **SQL**：依次执行仓库内 SQL 文件（见下文「二」）。
4. **环境变量**：在 Vercel（或本地 `.env.local`）配置 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`；服务端再配 `SUPABASE_SERVICE_ROLE_KEY`（勿加 `VITE_` 前缀）。

---

## 二、SQL 文件与顺序

| 顺序 | 文件 | 作用 |
|------|------|------|
| 1 | [supabase-showcase.sql](./supabase-showcase.sql) | 表 `showcase_submissions`、只读可见稿、匿名投稿 `INSERT` RLS |
| 2 | [supabase-votes.sql](./supabase-votes.sql) | 表 `showcase_votes`、公开 `SELECT`、登录用户 `INSERT` 本人投票 |

在 **Supabase → SQL → New query** 中**整段粘贴执行**即可；可重复执行（脚本含 `if not exists` / `drop policy if exists` 时注意与线上已有策略是否冲突）。

---

## 三、与前端功能的对应关系

| 功能 | 依赖 |
|------|------|
| 展示列表合并远端稿 | `VITE_SUPABASE_*` + `showcase_submissions` RLS |
| 匿名投稿写入 Supabase | 同上 `INSERT` 策略 |
| 管理改删 / 列表 | `POST /api/showcase-admin` + `SUPABASE_SERVICE_ROLE_KEY`（见 README） |
| Magic Link 登录 | Auth Email 开启 + Redirect URLs |
| 点赞与分类票 | `showcase_votes` 表 + RLS；`getSupabaseAuth()` 写、`getSupabaseAnon()` 读 |

投票类型枚举与表约束一致：`like` | `fun` | `visual` | `gameplay`（UI 文案「最想氪金」等映射到 `fun`）。

---

## 四、部署后自检（浏览器）

- [ ] 未登录可打开 `/showcase`，能看到列表与票数（有数据时）。
- [ ] 点击投票触发登录弹窗；邮箱收 Magic Link 后可完成点赞/投票，且不重复插入（唯一约束）。
- [ ] 新投稿出现在展示列表（`is_visible = true`）。
- [ ] `/admin` 在配置 PIN 与 Service Role 后可管理条目。

---

## 五、常见问题

- **邮件链接打开后仍未登录**：检查 Site URL / Redirect URLs 是否包含当前访问来源。
- **投票报错 `permission denied`**：检查 `showcase_votes` RLS 是否已执行、用户是否已登录。
- **仅本地有数据**：未配置 Supabase 时数据在 `localStorage`；配置后需从表单重新投稿或导入数据到表。
