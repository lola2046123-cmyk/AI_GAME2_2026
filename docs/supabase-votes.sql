-- 在 Supabase SQL Editor 中执行（在 showcase_submissions 与 Auth 已就绪后）
-- 用途：参赛展示「点赞 + 分类投票」；与前端 src/lib/showcaseVotes.ts 一致

create table if not exists public.showcase_votes (
  id uuid primary key default gen_random_uuid(),
  project_id text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  created_at timestamptz not null default now(),
  constraint showcase_votes_type_ck check (
    type in ('like', 'fun', 'visual', 'gameplay')
  ),
  constraint showcase_votes_one_per_type unique (project_id, user_id, type)
);

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

-- 仅登录用户可插入自己的一行；user_id 须与 JWT 一致
drop policy if exists "showcase_votes_insert_own" on public.showcase_votes;
create policy "showcase_votes_insert_own"
  on public.showcase_votes
  for insert
  with check (auth.uid() = user_id);

-- 不在此开放 UPDATE/DELETE；如需改票由服务端或人工处理
