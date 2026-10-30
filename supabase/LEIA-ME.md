# Ligando o CartaVirtual ao Supabase

O código já está pronto: **sem configurar nada, o site continua guardando as cartas em arquivos (só no seu computador).
Quando você coloca as duas chaves do Supabase, ele passa a usar o banco de dados sozinho.**

## 1. Criar o projeto
1. Entre em https://supabase.com, crie uma conta e clique em **New project**.
2. Escolha um nome (ex.: `cartavirtual`), defina uma senha do banco (guarde) e a região **South America (São Paulo)**.
3. Espere uns 2 minutos até o projeto ficar pronto.

## 2. Criar as tabelas
1. No painel do projeto: **SQL Editor → New query**.
2. Abra o arquivo `supabase/setup.sql`, copie **tudo**, cole e clique em **Run**.
3. Deve aparecer "Success". Pode rodar de novo sem problema.
4. Os arquivos antigos `schema.sql` e `002_letters_content.sql` **não devem ser usados** (pode apagar).
   O `schema.sql` antigo tinha uma regra que deixava qualquer pessoa listar todas as cartas pagas.

## 3. Copiar as chaves
No painel: **Project Settings → API**.
- **Project URL** → vai em `SUPABASE_URL`
- **service_role** (clique em "Reveal") → vai em `SUPABASE_SERVICE_ROLE_KEY`

Atenção: a `service_role` é uma chave **secreta**. Nunca coloque em arquivo que vai para o GitHub,
nunca use no navegador e nunca mande para ninguém.

## 4. Testar no seu computador
1. Copie `.env.example` para `.env.local` (mesma pasta do `package.json`) e preencha as duas chaves.
2. Pare o servidor e rode `npm run dev` de novo.
3. Crie uma carta pelo editor ("Gerar Link"). No painel do Supabase, em **Table Editor → letters**, a carta deve aparecer.
4. Em **Storage → letter-photos**, as fotos (plano pago) aparecem depois de gerar um link com foto.

Se aparecer erro, o terminal do `npm run dev` mostra a mensagem. Os mais comuns:
- `Invalid API key` → a chave foi colada errada ou com espaço no final.
- `relation "public.letters" does not exist` → o `setup.sql` não foi executado.
- `Bucket not found` → o `setup.sql` não foi executado até o fim. Rode de novo.

## 5. Publicar (quando tiver o domínio)
Na hospedagem (Vercel), em **Settings → Environment Variables**, cadastre:
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `NEXT_PUBLIC_SITE_URL` (ex.: `https://seudominio.com.br`).
Em produção, sem as duas primeiras o site recusa salvar cartas (de propósito, para não perder dados).

## O que fica guardado onde
- **Banco (letters):** a carta, o plano, a validade do link e o acompanhamento (aberturas, SIM, tentativas no "Não").
- **Código do painel de acompanhamento:** guardado só como hash (se o banco vazar, o código não vaza).
- **Storage (letter-photos):** as fotos, com nome aleatório. Quem tem o endereço da foto consegue ver, como na carta.
- **Segurança:** as tabelas ficam fechadas para a chave pública. Só o servidor do site consegue ler e gravar.
