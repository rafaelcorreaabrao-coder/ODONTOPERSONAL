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
-- ============================================================
-- Painel CEO: sistema de admin + controle manual de assinaturas
-- Rode este arquivo no SQL Editor do Supabase.
-- ============================================================

-- 1. Marca quem é administrador
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- 2. Tabela de assinaturas (separada de profiles por segurança —
--    assim uma usuária comum nunca consegue mudar o próprio status sozinha)
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'trial' check (status in ('trial', 'active', 'inactive', 'overdue')),
  valid_until date,
  notes text default '',
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- 3. Função auxiliar: verifica se um usuário é admin (usada nas políticas abaixo)
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = uid), false);
$$;

-- 4. Políticas de acesso das assinaturas
drop policy if exists "usuária vê a própria assinatura" on public.subscriptions;
create policy "usuária vê a própria assinatura"
  on public.subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "admin vê todas as assinaturas" on public.subscriptions;
create policy "admin vê todas as assinaturas"
  on public.subscriptions for select
  using (public.is_admin(auth.uid()));

drop policy if exists "admin insere assinaturas" on public.subscriptions;
create policy "admin insere assinaturas"
  on public.subscriptions for insert
  with check (public.is_admin(auth.uid()));

drop policy if exists "admin atualiza assinaturas" on public.subscriptions;
create policy "admin atualiza assinaturas"
  on public.subscriptions for update
  using (public.is_admin(auth.uid()));

drop policy if exists "admin remove assinaturas" on public.subscriptions;
create policy "admin remove assinaturas"
  on public.subscriptions for delete
  using (public.is_admin(auth.uid()));

-- 5. Permite que o admin veja o nickname/loja de todas as usuárias (pra listar no painel)
drop policy if exists "admin vê todos os perfis" on public.profiles;
create policy "admin vê todos os perfis"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

-- 6. Trava de segurança: impede que uma usuária comum se auto-promova a admin
--    editando o próprio perfil (mesmo que tente pela API diretamente)
create or replace function public.prevent_self_admin_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Só bloqueia quando é uma usuária logada tentando pelo site.
  -- Alterações feitas direto no SQL Editor (sem sessão) sempre passam.
  if new.is_admin is distinct from old.is_admin
     and auth.uid() is not null
     and not public.is_admin(auth.uid()) then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

drop trigger if exists guard_is_admin on public.profiles;
create trigger guard_is_admin
  before update on public.profiles
  for each row execute function public.prevent_self_admin_escalation();

-- 7. Toda vez que uma usuária cria o perfil (tela "criar sua loja"),
--    já nasce uma assinatura em modo "trial" automaticamente
create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.subscriptions (user_id, status)
  values (new.id, 'trial')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_profile_created on public.profiles;
create trigger on_profile_created
  after insert on public.profiles
  for each row execute function public.handle_new_profile();

-- 8. Cria uma assinatura "trial" pra quem já tinha conta antes desta migração
insert into public.subscriptions (user_id, status)
select id, 'trial' from public.profiles
on conflict (user_id) do nothing;

-- ============================================================
-- ÚLTIMO PASSO — faça você mesmo, manualmente, trocando o e-mail:
-- Isso te transforma no admin (CEO). Rode só esta linha depois de
-- tudo acima já ter rodado com sucesso.
-- ============================================================
-- update public.profiles set is_admin = true
-- where id = (select id from auth.users where email = 'seuemail@exemplo.com');
