# Deploy — Render (API + Postgres) + Vercel (frontend)

Este guia assume a estratégia: **Render** hospeda a API + o banco Postgres (serviço que
fica sempre no ar, com o cron interno rodando em background), e **Vercel** hospeda o
frontend estático (build do Vite), com deploy automático a cada `git push`.

Os arquivos de configuração já estão prontos no repositório:
- [`render.yaml`](render.yaml) — Blueprint do Render (API + banco)
- [`apps/web/vercel.json`](apps/web/vercel.json) — build do frontend no monorepo
- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — typecheck + build automáticos em todo push/PR

## 1. Ambientes: dev e produção

- **Local (dev)**: como já está no [README](README.md) — `npm run dev:api` / `dev:web` na sua máquina.
- **Produção**: branch `main` → deploy automático no Render (API) e Vercel (frontend).
- **Preview**: a Vercel cria automaticamente uma URL de preview para cada Pull
  Request. Para testar essas previews contra uma API real, crie um segundo serviço
  no Render apontando para uma branch de staging, com seu próprio banco.

## 2. Passo a passo (você faz, nas contas Render/Vercel)

### Render — API + banco

1. Crie uma conta em [render.com](https://render.com) e conecte sua conta do GitHub.
2. **New → Blueprint** → selecione o repositório `allmyworks` → Render detecta o
   `render.yaml` automaticamente e propõe criar o banco `allmyworks-db` e o serviço
   web `allmyworks-api`.
3. Antes de confirmar, revise: os secrets `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` são
   gerados automaticamente (`generateValue: true`). As variáveis marcadas como
   "preencher manualmente" (`CORS_ORIGIN`, `APP_BASE_URL`, `SMTP_*`, `EMAIL_FROM`)
   ficam vazias — você as edita em **Environment** depois que o serviço existir.
4. Depois do primeiro deploy, anote a URL pública da API (algo como
   `https://allmyworks-api.onrender.com`).
5. Rode o seed de dados de exemplo uma vez (opcional), via **Shell** do próprio Render
   no serviço da API: `npm run db:seed -w apps/api`.

### Vercel — frontend

1. Crie uma conta em [vercel.com](https://vercel.com) e conecte o GitHub.
2. **Add New → Project** → selecione `allmyworks`.
3. Em **Root Directory**, selecione `apps/web` (importante — o `vercel.json` de
   dentro dessa pasta assume isso).
4. Em **Environment Variables**, adicione:
   - `VITE_API_URL` = `https://allmyworks-api.onrender.com/api` (a URL do Render do
     passo anterior, com `/api` no final)
5. Deploy. Anote a URL pública (ex: `https://allmyworks.vercel.app`).

### Fechando o ciclo: CORS

Volte no Render, no serviço da API, e defina:
- `CORS_ORIGIN` = `https://allmyworks.vercel.app` (a URL da Vercel do passo anterior)
- `APP_BASE_URL` = a mesma URL — é usada para montar os links dentro dos e-mails

Pode listar múltiplas origens separadas por vírgula em `CORS_ORIGIN` se precisar
liberar mais de um domínio.

### E-mail (SMTP)

Enquanto não configurar um provedor real, deixe `EMAIL_DRY_RUN=true` no Render — os
e-mails só são logados, não enviados. Quando for configurar de verdade, veja as
opções (Resend, SendGrid, SMTP próprio) na seção **E-mail** do
[README](README.md#e-mail-smtp).

## 3. Primeiro administrador

O sistema não tem cadastro público — todo usuário é criado por um administrador.
Para o primeiro acesso em produção, crie o admin diretamente no banco (via
**Shell** do Render ou `psql`) ou rode um seed ajustado. O jeito mais simples é
rodar `npm run db:seed -w apps/api` uma vez após o primeiro deploy (cria o usuário
`admin@example.com` com a senha de exemplo) e depois trocar a senha e os dados
pelo próprio sistema — ou editar o `prisma/seed.ts` com os dados reais da editora
antes do deploy.

## 4. Domínio próprio (opcional)

Se quiser usar um domínio seu em vez das URLs `.vercel.app` / `.onrender.com`:
- Na Vercel: **Project → Settings → Domains** → adicione o domínio e siga as
  instruções de DNS (geralmente um registro `CNAME`).
- No Render, também é possível apontar um domínio próprio para a API se quiser,
  embora normalmente só o frontend precise de um domínio "bonito".

## 5. O que o CI (GitHub Actions) já garante

A cada push ou Pull Request, [`.github/workflows/ci.yml`](.github/workflows/ci.yml)
roda automaticamente: instala dependências, gera o Prisma Client, faz o typecheck da
API e do frontend, e builda o frontend de produção. O Render e a Vercel fazem o
deploy de forma independente (via a própria integração deles com o GitHub), então a
CI aqui funciona como um "portão de qualidade", não como o disparador do deploy em si.
