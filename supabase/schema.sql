-- AI Logic Forum — Supabase schema（欄位與 lib/types.ts 對應）
-- 在 Supabase Dashboard → SQL Editor 執行。登入方式：Authentication → Providers → Google。

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  display_name text not null check (char_length(display_name) <= 20),
  avatar_url text,
  bio text not null default '' check (char_length(bio) <= 150),
  country_code text not null default 'TW',
  created_at timestamptz not null default now(),
  -- 以下為統計欄位，由 trigger 維護
  avg_ai_rating numeric(3, 2) not null default 0,
  post_count integer not null default 0,
  reply_count integer not null default 0,
  likes_received integer not null default 0
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  category text not null check (category in ('日常', '感情', '美食', '籃球', '政治', '汽車')),
  title text not null check (char_length(title) <= 120),
  content text not null check (char_length(content) <= 5000),
  image_url text,
  ai_rating numeric(2, 1) not null check (ai_rating between 1 and 5),
  ai_summary text not null,
  ai_source text not null default 'openai' check (ai_source in ('openai', 'fallback', 'seed')),
  ip_country_code text not null default 'TW',
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  shares_count integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_author_idx on public.posts (author_id);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  parent_id uuid references public.comments (id) on delete cascade,
  content text not null check (char_length(content) <= 1000),
  ai_rating numeric(2, 1) not null check (ai_rating between 1 and 5),
  ai_summary text not null,
  ai_source text not null default 'openai' check (ai_source in ('openai', 'fallback', 'seed')),
  created_at timestamptz not null default now()
);
create index if not exists comments_post_idx on public.comments (post_id, created_at);

create table if not exists public.post_likes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  primary key (user_id, post_id)
);

create table if not exists public.post_shares (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

-- 發文後更新作者的貼文數與歷史平均 AI 評分
create or replace function public.bump_author_stats() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.profiles p
  set post_count = s.cnt,
      avg_ai_rating = coalesce(s.avg_rating, 0)
  from (
    select count(*) as cnt, round(avg(ai_rating), 2) as avg_rating
    from public.posts where author_id = new.author_id
  ) s
  where p.id = new.author_id;
  return new;
end $$;

drop trigger if exists posts_bump_author_stats on public.posts;
create trigger posts_bump_author_stats
after insert on public.posts
for each row execute function public.bump_author_stats();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.post_shares enable row level security;

create policy "profiles are public" on public.profiles for select using (true);
create policy "users edit own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "users create own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "posts are public" on public.posts for select using (true);
create policy "users create own posts" on public.posts for insert with check (auth.uid() = author_id);

create policy "comments are public" on public.comments for select using (true);
create policy "users create own comments" on public.comments for insert with check (auth.uid() = author_id);

create policy "likes are public" on public.post_likes for select using (true);
create policy "users manage own likes" on public.post_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "shares are public" on public.post_shares for select using (true);
create policy "users manage own shares" on public.post_shares for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
