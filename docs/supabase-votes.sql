-- 在 Supabase SQL Editor 中执行（在 showcase_submissions 就绪后）
-- 用途：参赛展示「点赞 + 分类投票」；与前端 src/lib/showcaseVotes.ts 一致
--
-- 说明：
--   本方案为"无登录匿名投票"：
--   - 前端首次访问在 localStorage 生成一个 UUID（见 src/lib/clientId.ts），
--     作为 user_id 写入本表；同一浏览器视为同一投票人。
--   - 不再依赖 Supabase Auth，因此本表 user_id 不挂 auth.users 外键。
--   - unique(project_id, user_id, type) 仍可避免单浏览器重复点赞。

create table if not exists public.showcase_votes (
  id uuid primary key default gen_random_uuid(),
  project_id text not null,
  -- 匿名客户端 UUID（来自浏览器 localStorage），非 auth.users 主键
  user_id uuid not null,
  type text not null,
  created_at timestamptz not null default now(),
  constraint showcase_votes_type_ck check (
    type in ('like', 'fun', 'visual', 'gameplay')
  ),
  constraint showcase_votes_one_per_type unique (project_id, user_id, type)
);

-- 若之前已经创建过带 auth.users 外键的版本，执行下面这条语句解绑：
-- alter table public.showcase_votes
--   drop constraint if exists showcase_votes_user_id_fkey;

create index if not exists showcase_votes_project_id_idx
  on public.showcase_votes (project_id);

create index if not exists showcase_votes_project_type_idx
  on public.showcase_votes (project_id, type);

alter table public.showcase_votes enable row level security;

-- 任何人（含匿名）可读票数，供列表聚合
drop policy if exists "showcase_votes_select_public" on public.showcase_votes;
create policy "showcase_votes_select_public"
  on public.showcase_votes
  for select
  using (true);

-- 任何人（含匿名）可插入一行；不强校验 user_id，
-- 由前端 localStorage 提供稳定 UUID；重复由 unique 约束兜底。
drop policy if exists "showcase_votes_insert_own" on public.showcase_votes;
drop policy if exists "showcase_votes_insert_anon" on public.showcase_votes;
create policy "showcase_votes_insert_anon"
  on public.showcase_votes
  for insert
  with check (true);

-- 不开放 UPDATE/DELETE；如需改票由服务端或人工处理
