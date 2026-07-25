-- Adiciona os dias da semana que a profissional atende em cada clínica
-- (diferente de dia_semana, que é o dia de PAGAMENTO quando o regime é Semanal).
-- Rode este arquivo no SQL Editor do Supabase.

alter table public.clinicas add column if not exists dias_atendimento int[] not null default '{}';
