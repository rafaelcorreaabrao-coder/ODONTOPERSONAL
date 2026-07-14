-- Rode este arquivo no SQL Editor do Supabase SE você já tinha criado o banco antes
-- (ou seja, já rodou o schema.sql em algum momento anterior a este recurso de
-- cálculo automático da data prevista de pagamento).
--
-- Se você está criando o banco pela primeira vez, não precisa rodar este arquivo:
-- o schema.sql já vem atualizado com essas colunas.

alter table public.clinicas add column if not exists dia_semana int;
alter table public.clinicas add column if not exists dia_mes_1 int;
alter table public.clinicas add column if not exists dia_mes_2 int;
alter table public.clinicas add column if not exists prazo_dias int;
