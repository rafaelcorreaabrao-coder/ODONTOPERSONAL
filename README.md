# OdontoPersonal — passo a passo para colocar no ar (grátis)

Tempo estimado: 15-20 minutos na primeira vez. Não precisa de nenhum serviço pago.

## 1. Criar o projeto no Supabase (banco de dados + login)

1. Acesse https://supabase.com e crie uma conta grátis.
2. Clique em "New project". Escolha um nome (ex: `arco`) e uma senha de banco (guarde essa senha, mas não vai precisar dela no dia a dia).
3. Espere o projeto ser criado (leva 1-2 minutos).
4. No menu lateral, vá em **SQL Editor** → **New query**.
5. Abra o arquivo `supabase/schema.sql` deste projeto, copie todo o conteúdo, cole no editor e clique em **Run**. Isso cria as tabelas de clínicas, lançamentos e perfis, já com as regras de segurança (cada usuária só vê os próprios dados).

> **Já tinha criado o banco antes?** Rode também o arquivo `supabase/migration_dia_pagamento.sql` no SQL Editor — ele adiciona as colunas novas usadas para calcular automaticamente a data prevista de pagamento. Se está criando o banco pela primeira vez, pode ignorar esse arquivo (o `schema.sql` já vem completo).

> **Painel CEO (novo):** rode também `supabase/migration_admin_subscriptions.sql` no SQL Editor. Ele cria o sistema de assinaturas e a permissão de administrador. **Depois de rodar**, é preciso um último passo manual pra você virar o CEO: no final desse mesmo arquivo tem uma linha comentada (começando com `--`), tipo:
> ```sql
> update public.profiles set is_admin = true
> where id = (select id from auth.users where email = 'seuemail@exemplo.com');
> ```
> Copie essa linha à parte, tire o `--` do início, troque pelo seu e-mail de cadastro, e rode sozinha no SQL Editor. Só você deve fazer isso — quem mais criar conta continua como usuária comum.

O login por e-mail e senha já vem ativado por padrão no Supabase — não precisa configurar nada a mais aqui.

**Dica para testes**: por padrão, o Supabase exige que a pessoa confirme o e-mail antes de conseguir entrar (clicando num link que chega na caixa de entrada). Para agilizar os testes com sua esposa, você pode desativar isso temporariamente em **Authentication → Providers → Email → "Confirm email"** (desmarque a opção). Assim ela cria a conta e já entra direto, sem precisar checar o e-mail. Vale reativar depois, quando for para uso real.

## 2. Pegar as chaves do projeto

1. No Supabase, vá em **Project Settings** → **API**.
2. Copie a **Project URL** e a chave **anon public**.
3. Neste projeto, duplique o arquivo `.env.example` e renomeie a cópia para `.env`.
4. Cole a URL e a chave nos campos correspondentes.

## 3. Testar localmente (opcional, mas recomendado)

Se quiser ver funcionando antes de publicar, com Node.js instalado:

```
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## 4. Publicar no Vercel (o site fica no ar, com link público)

1. Crie uma conta grátis em https://vercel.com (pode entrar com GitHub, Google ou e-mail).
2. A forma mais simples: suba esta pasta para um repositório no GitHub (crie uma conta em https://github.com se não tiver, crie um repositório novo, e envie os arquivos — o próprio site do GitHub permite arrastar e soltar arquivos num repositório novo).
3. No Vercel, clique em **Add New → Project**, escolha o repositório que você acabou de criar.
4. Antes de clicar em "Deploy", vá em **Environment Variables** e adicione:
   - `VITE_SUPABASE_URL` → cole a URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY` → cole a chave anon public
5. Clique em **Deploy**. Em 1-2 minutos o Vercel te dá um link (tipo `arco-app.vercel.app`).
6. Pronto — manda esse link para sua esposa testar, de qualquer aparelho.

## Como funciona o cadastro

1. **Criar conta**: e-mail e senha (mínimo 6 caracteres).
2. **Primeiro acesso**: o app pede para criar o nome da "loja" dela — um nome exclusivo, geralmente o nome do consultório ou como ela é conhecida profissionalmente (ex: "Dra. Ana Silva Odontologia"). Isso fica salvo e aparece no menu lateral do app.
3. Dali em diante, é só cadastrar clínicas e lançamentos normalmente.
4. Cada pessoa só vê os próprios dados — isso é garantido pelo banco de dados (Row Level Security), não só pelo site.

## Se quiser mudar algo depois

Todo o código está organizado em `src/`:
- `src/pages/Dashboard.jsx`, `Clinicas.jsx`, `Lancamentos.jsx` — as três telas principais
- `src/pages/Auth.jsx` — tela de login/criar conta
- `src/pages/Onboarding.jsx` — tela de criação da "loja" no primeiro acesso
- `src/theme.js` — cores do tema claro/escuro
- `src/components/ui.jsx` — botões, cards e outros elementos reutilizáveis

Qualquer ajuste de texto, cor ou comportamento, é só pedir.

## Instalando como app no celular

O site agora funciona como PWA (Progressive Web App) — ou seja, dá para "instalar" no celular como se fosse um app de verdade, com ícone na tela inicial e abrindo em tela cheia, sem precisar passar pela App Store ou Play Store.

**No iPhone (Safari):**
1. Abra o link do site no Safari (precisa ser Safari, não funciona pelo Chrome no iOS)
2. Toque no ícone de compartilhar (o quadrado com a seta pra cima)
3. Role e toque em **"Adicionar à Tela de Início"**
4. Confirme — o ícone do dente aparece na tela inicial, igual um app

**No Android (Chrome):**
1. Abra o link do site no Chrome
2. Toque nos três pontinhos no canto superior direito
3. Toque em **"Adicionar à tela inicial"** ou **"Instalar app"** (o texto varia um pouco por versão)
4. Confirme

Depois de instalado, abre direto pelo ícone, sem barra de endereço, com a mesma sensação de um app nativo — e continua puxando os dados do mesmo banco de dados de sempre.

## Evoluindo depois

Quando quiser migrar para login por celular com código SMS (mais parecido com apps bancários), dá para adicionar depois sem perder os dados já cadastrados — é só um ajuste na tela de login, mantendo o resto do app igual.
