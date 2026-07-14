-- ============================================================
-- Arco — esquema do banco de dados (Supabase / Postgres)
-- Rode este arquivo inteiro no SQL Editor do seu projeto Supabase.
-- ============================================================

-- Perfis: um por usuária logada, com nickname exclusivo (nome da loja/consultório)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null unique,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "usuária lê o próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "usuária cria o próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "usuária atualiza o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Clínicas
create table if not exists public.clinicas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  regime text not null default 'Outro',
  dia_pagamento text default '',
  dia_semana int,
  dia_mes_1 int,
  dia_mes_2 int,
  prazo_dias int,
  contato text default '',
  obs text default '',
  created_at timestamptz not null default now()
);

alter table public.clinicas enable row level security;

create policy "usuária vê as próprias clínicas"
  on public.clinicas for select
  using (auth.uid() = user_id);

create policy "usuária cria clínicas"
  on public.clinicas for insert
  with check (auth.uid() = user_id);

create policy "usuária edita as próprias clínicas"
  on public.clinicas for update
  using (auth.uid() = user_id);

create policy "usuária remove as próprias clínicas"
  on public.clinicas for delete
  using (auth.uid() = user_id);

-- Lançamentos
create table if not exists public.lancamentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  clinica_id uuid references public.clinicas(id) on delete set null,
  data_atendimento date not null,
  procedimento text default '',
  valor numeric(12,2) not null default 0,
  data_prevista date not null,
  pago boolean not null default false,
  data_pagamento date,
  obs text default '',
  created_at timestamptz not null default now()
);

alter table public.lancamentos enable row level security;

create policy "usuária vê os próprios lançamentos"
  on public.lancamentos for select
  using (auth.uid() = user_id);

create policy "usuária cria lançamentos"
  on public.lancamentos for insert
  with check (auth.uid() = user_id);

create policy "usuária edita os próprios lançamentos"
  on public.lancamentos for update
  using (auth.uid() = user_id);

create policy "usuária remove os próprios lançamentos"
  on public.lancamentos for delete
  using (auth.uid() = user_id);

-- Índices úteis
create index if not exists idx_clinicas_user on public.clinicas(user_id);
create index if not exists idx_lancamentos_user on public.lancamentos(user_id);
create index if not exists idx_lancamentos_clinica on public.lancamentos(clinica_id);
