-- Adiciona o campo de nome do paciente em cada lançamento.
-- Rode este arquivo no SQL Editor do Supabase.

alter table public.lancamentos add column if not exists paciente text default '';
