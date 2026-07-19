# Estrutura do banco de dados — OdontoPersonal

Banco de dados: PostgreSQL, hospedado no Supabase.
Este documento acompanha o arquivo `supabase/schema.sql`, que é o código-fonte real das tabelas.

---

## Visão geral

```
auth.users (nativa do Supabase — login e senha)
   │
   ├── profiles         (1 por usuária)
   ├── subscriptions     (1 por usuária)
   ├── clinicas          (várias por usuária)
   └── lancamentos       (vários por usuária, cada um ligado a uma clínica)
```

---

## Tabela `profiles`

Uma linha por usuária, criada na tela "Vamos criar sua loja" (primeiro acesso).

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid (PK) | Mesmo ID da tabela `auth.users` — é o que liga o perfil à conta de login |
| `nickname` | text, único | Nome da loja/consultório, escolhido pela usuária. Não pode repetir entre usuárias |
| `is_admin` | boolean | `true` só para o CEO (você). Controla o acesso ao Painel CEO |
| `created_at` | timestamp | Data de criação do perfil |

**Segurança:** cada usuária só lê/edita o próprio perfil. Só quem tem `is_admin = true` consegue ver os perfis de todas as outras. Um gatilho (`guard_is_admin`) impede que uma usuária comum troque a própria flag `is_admin` para `true`, mesmo tentando pela API diretamente.

---

## Tabela `clinicas`

Cada clínica cadastrada por uma usuária.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid (PK) | Identificador da clínica |
| `user_id` | uuid (FK) | De qual usuária é essa clínica |
| `nome` | text | Nome da clínica |
| `regime` | text | Semanal / Quinzenal / Mensal / Por procedimento / Outro |
| `dia_pagamento` | text | Texto livre, usado só quando `regime = 'Outro'` |
| `dia_semana` | int | 0 a 6 (Domingo a Sábado) — usado quando `regime = 'Semanal'` |
| `dia_mes_1` | int | 1 a 31 — usado em `Mensal` e `Quinzenal` |
| `dia_mes_2` | int | 1 a 31 — segundo dia, usado só em `Quinzenal` |
| `prazo_dias` | int | Quantidade de dias após o atendimento — usado em `Por procedimento` |
| `contato` | text | Telefone ou e-mail de contato |
| `obs` | text | Observações livres |
| `created_at` | timestamp | Data de cadastro |

Esses campos estruturados (`dia_semana`, `dia_mes_1`, `dia_mes_2`, `prazo_dias`) são o que permite calcular a data prevista de pagamento automaticamente ao lançar um atendimento.

**Segurança:** cada usuária só vê, cria, edita e remove as próprias clínicas.

---

## Tabela `lancamentos`

Cada atendimento registrado.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid (PK) | Identificador do lançamento |
| `user_id` | uuid (FK) | De qual usuária é esse lançamento |
| `clinica_id` | uuid (FK, opcional) | Qual clínica — fica vazio se a clínica for removida depois |
| `data_atendimento` | date | Quando o atendimento aconteceu |
| `procedimento` | text | Descrição livre (ex: "Restauração") |
| `valor` | numeric(12,2) | Valor do lançamento |
| `data_prevista` | date | Data prevista de pagamento (calculada automaticamente, editável) |
| `pago` | boolean | Se já foi pago |
| `data_pagamento` | date | Quando foi pago de fato (preenchido só quando `pago = true`) |
| `obs` | text | Observações livres |
| `created_at` | timestamp | Data de criação do registro |

O status exibido no app ("A receber" / "Pago" / "Atrasado") não fica salvo no banco — é calculado na hora, comparando `pago` e `data_prevista` com a data de hoje.

**Segurança:** cada usuária só vê, cria, edita e remove os próprios lançamentos.

---

## Tabela `subscriptions`

Controle manual de assinatura, usado pelo Painel CEO.

| Campo | Tipo | Descrição |
|---|---|---|
| `user_id` | uuid (PK/FK) | Uma linha por usuária |
| `status` | text | `trial` \| `active` \| `inactive` \| `overdue` |
| `valid_until` | date | Data de validade da assinatura (opcional) |
| `notes` | text | Anotações internas do CEO sobre essa assinante |
| `updated_at` | timestamp | Última atualização do status |

Criada automaticamente (status `trial`) toda vez que uma usuária termina o cadastro do perfil — via gatilho `on_profile_created`.

**Segurança:** só o CEO (`is_admin = true`) consegue criar, editar ou remover linhas dessa tabela. Uma usuária comum só consegue *ler* a própria linha, nunca alterá-la — é essa restrição que impede qualquer pessoa de se auto-liberar acesso.

---

## Funções e gatilhos auxiliares

| Nome | Tipo | Para que serve |
|---|---|---|
| `is_admin(uid)` | função | Verifica se um usuário é admin. Usada dentro das políticas de segurança das outras tabelas |
| `prevent_self_admin_escalation` | gatilho em `profiles` | Bloqueia qualquer tentativa de uma usuária comum alterar a própria flag `is_admin` pela API |
| `handle_new_profile` | gatilho em `profiles` | Cria automaticamente uma assinatura `trial` assim que o perfil é criado |

---

## Índices

Criados para manter as consultas rápidas conforme o número de registros cresce:

- `idx_clinicas_user` — em `clinicas(user_id)`
- `idx_lancamentos_user` — em `lancamentos(user_id)`
- `idx_lancamentos_clinica` — em `lancamentos(clinica_id)`

---

## Onde encontrar o código-fonte

- `supabase/schema.sql` — cria tudo do zero (usado em instalação nova)
- `supabase/migration_dia_pagamento.sql` — adiciona os campos estruturados de pagamento (para bancos criados antes desse recurso)
- `supabase/migration_admin_subscriptions.sql` — adiciona o sistema de admin e assinaturas (para bancos criados antes desse recurso)
