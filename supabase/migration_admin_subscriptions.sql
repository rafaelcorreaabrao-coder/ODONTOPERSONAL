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
