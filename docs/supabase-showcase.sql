-- 在 Supabase SQL Editor 中整段执行（项目 → SQL → New query）
-- 用途：参赛展示「公开只读」+ 匿名投稿写入；管理改删走 Vercel /api + Service Role

create table if not exists public.showcase_submissions (
  id uuid primary key,
  game_name text not null,
  creator_nickname text,
  gameplay text not null,
  card_summary text,
  gameplay_source text,
  tech_stack jsonb not null default '[]'::jsonb,
  evolution text not null,
  deploy_url text not null,
  thumbnail_url text not null,
  created_at timestamptz not null default now(),
  is_visible boolean not null default true,
  source text not null default 'user',
  constraint showcase_submissions_gameplay_source_ck check (
    gameplay_source is null
    or gameplay_source in ('manual', 'ai', 'local')
  ),
  constraint showcase_submissions_source_ck check (source in ('user', 'mock'))
);

create index if not exists showcase_submissions_created_at_idx
  on public.showcase_submissions (created_at desc);

alter table public.showcase_submissions enable row level security;

-- 任何人（含匿名）只读「前台展示」为 true 的稿件
drop policy if exists "showcase_select_visible" on public.showcase_submissions;
create policy "showcase_select_visible"
  on public.showcase_submissions
  for select
  using (is_visible = true);

-- 匿名投稿：仅允许 source=user 且默认可见（防插入即隐藏）
drop policy if exists "showcase_insert_public" on public.showcase_submissions;
create policy "showcase_insert_public"
  on public.showcase_submissions
  for insert
  with check (
    source = 'user'
    and coalesce(is_visible, true) = true
  );

-- 注意：UPDATE/DELETE 不开放给 anon；管理端使用 Service Role（见 README /api/showcase-admin）
