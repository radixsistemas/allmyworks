# Editora — Sistema de Lançamento de Trabalhos

Sistema para uma editora controlar os trabalhos entregues por colaboradores PJ
(designers, preparadores de texto, revisores etc.) e realizar o fechamento
financeiro periódico. Cada colaborador lança suas próprias entregas em uma
tela no formato de "planilha de custos"; o administrador configura perfis de
remuneração, projetos, usuários e realiza o fechamento mensal.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS + React Query |
| Backend | Node.js + Express + TypeScript |
| Banco | PostgreSQL + Prisma ORM (migrations versionadas) |
| Autenticação | JWT (access token curto + refresh token rotativo, hash em banco) |
| E-mail | Nodemailer via SMTP genérico (compatível com Resend, SendGrid, SES, etc.) |
| Agendador | `node-cron` (lembrete de fechamento próximo ao dia 20) |
| Exportação | `pdfkit` (PDF) e `exceljs` (Excel) para o relatório de pagamentos |

Monorepo com **npm workspaces**:

```
allmyworks/
├── apps/
│   ├── api/     # Backend Express + Prisma
│   └── web/     # Frontend React + Vite
├── packages/
│   └── shared/  # Enums, tipos e a regra de período/competência, compartilhados
└── docker-compose.yml  # Postgres local para desenvolvimento
```

## Modelo de dados

Schema completo em [`apps/api/prisma/schema.prisma`](apps/api/prisma/schema.prisma).

- `User` — colaboradores e administradores (`papel`: `ADMIN` | `COLABORADOR`; `status`: `ATIVO` | `BLOQUEADO` | `ARQUIVADO`; `senhaTemporaria` força a troca de senha no primeiro acesso)
- `Projeto` — cadastro simples (`nome`, `status` ativo/inativo)
- `TipoTrabalho` — tipos de trabalho configuráveis livremente pelo admin (capa, diagramação, revisão, preparação, etc.)
- `RegraRemuneracao` — a regra de cálculo por usuário × tipo de trabalho (`modalidade`: `FIXO_POR_TRABALHO` | `FIXO_POR_UNIDADE` | `LIVRE`, com `valorUnitario` quando aplicável)
- `Lancamento` — cada entrega lançada (projeto, tipo, quantidade, valores, link, competência/período calculados automaticamente, status aberto/fechado)
- `Fechamento` — cada fechamento de período realizado (com suporte a reabertura)
- `AuditLog` — quem fechou/reabriu um período e quem editou um lançamento após o fechamento
- `ConfiguracaoSistema` — guarda a data de início do próximo período em aberto, usada para sugerir automaticamente o próximo filtro de fechamento

### Regra de período e competência

```
Todo período vai do dia 21 de um mês até o dia 20 do mês seguinte.
Ex.: período 21/06 a 20/07 -> competência "Julho/2026".
```

Implementada uma única vez em [`packages/shared/src/periodo.ts`](packages/shared/src/periodo.ts)
e usada tanto pelo backend (ao calcular a competência de cada lançamento) quanto pelo
frontend (para exibir a sugestão do próximo período a fechar).

### Regra de remuneração (perfil de lançamento)

Cada combinação usuário × tipo de trabalho pode ter uma modalidade diferente:

1. **Valor fixo por trabalho** — todo lançamento daquele tipo, para aquele usuário, vale o mesmo valor.
2. **Valor fixo por unidade** — o usuário informa a quantidade (páginas/laudas) e o sistema calcula `valor_total = quantidade × valor_unitário`.
3. **Livre** — o valor unitário não é pré-configurado; o próprio colaborador o informa no momento do lançamento.

Quando existe uma regra configurada para o usuário + tipo de trabalho com modalidade
fixa, o campo "valor unitário" no lançamento vem preenchido automaticamente e
**bloqueado** — o valor enviado pelo cliente é ignorado; o backend sempre recalcula
a partir da regra. Isso é validado no servidor (`lancamentos.service.ts`), nunca
apenas na UI.

## Setup local

### Pré-requisitos

- Node.js 20+
- PostgreSQL 14+ (local via `docker-compose`, ou uma instância própria/hospedada)

### 1. Instalar dependências

```bash
npm install
```

### 2. Banco de dados

Suba um Postgres local com Docker:

```bash
docker compose up -d
```

Ou aponte `DATABASE_URL` para qualquer Postgres já existente (local ou em nuvem).

### 3. Variáveis de ambiente

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Edite `apps/api/.env`:

- `DATABASE_URL` — string de conexão do Postgres.
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — gere valores fortes, ex: `openssl rand -hex 32`.
- `SMTP_*` / `EMAIL_FROM` — configuração do provedor de e-mail (veja seção **E-mail** abaixo). Deixe `EMAIL_DRY_RUN=true` para apenas logar os e-mails no console durante o desenvolvimento.
- `CLOSING_REMINDER_CRON` — expressão cron do lembrete de fechamento pendente.
- `APP_BASE_URL` — URL do frontend, usada para montar links nos e-mails.

`apps/web/.env` só precisa de `VITE_API_URL` (padrão `http://localhost:3333/api`).

### 4. Migrations + seed

```bash
npm run db:migrate   # cria o schema no banco (prisma migrate dev)
npm run db:seed       # popula com dados de exemplo
```

Usuários de teste criados pelo seed (todos com senha `senha123`):

| E-mail | Papel |
|---|---|
| `admin@example.com` | Administrador |
| `diego@example.com` | Colaborador (Designer) |
| `renata@example.com` | Colaboradora (Revisora) |

O seed cria projetos, tipos de trabalho, perfis de remuneração já configurados para
os dois colaboradores de exemplo, e alguns lançamentos no período em aberto.

### 5. Rodar em desenvolvimento

Em dois terminais:

```bash
npm run dev:api   # http://localhost:3333
npm run dev:web   # http://localhost:5173
```

### 6. Rodar o lembrete de fechamento manualmente

```bash
npm run closing-reminder:check
```

Envia (ou loga, se `EMAIL_DRY_RUN=true`) um e-mail para todos os colaboradores ativos
lembrando do prazo do período em aberto.

## E-mail (SMTP)

O envio usa Nodemailer com um transporte SMTP genérico — funciona com qualquer provedor:

| Provedor | Host | Porta | Usuário | Senha |
|---|---|---|---|---|
| Resend | `smtp.resend.com` | 587 | `resend` | sua API key |
| SendGrid | `smtp.sendgrid.net` | 587 | `apikey` | sua API key |
| SMTP próprio | seu host | conforme seu provedor | — | — |

Com `EMAIL_DRY_RUN=true` (padrão), nada é enviado de verdade — os e-mails são apenas
logados no console da API. Usado ao: criar um usuário (senha temporária), resetar
senha, e no lembrete de fechamento.

## Perfis de acesso

- **Administrador**: cria/gerencia usuários (bloquear, arquivar, resetar senha,
  reativar); cadastra projetos e tipos de trabalho; configura perfis de remuneração;
  realiza o fechamento de períodos (com reabertura auditada); edita/exclui
  lançamentos de qualquer colaborador a qualquer momento, mesmo em períodos
  fechados; acessa o relatório de pagamentos com exportação em PDF/Excel.
- **Colaborador**: troca a senha no primeiro acesso (obrigatório); lança seus
  próprios trabalhos; edita/exclui apenas lançamentos dentro do período em aberto;
  visualiza apenas seus próprios lançamentos.

## Scripts principais (raiz)

| Comando | O que faz |
|---|---|
| `npm run dev:api` / `dev:web` | Sobe API e frontend em modo desenvolvimento |
| `npm run build` | Typecheck da API + build de produção do frontend |
| `npm run start:api` | Roda a API (via `tsx`, sem etapa de bundle separada) |
| `npm run db:migrate` | Aplica migrations (`prisma migrate dev`) |
| `npm run db:migrate:deploy` | Aplica migrations em produção (`prisma migrate deploy`) |
| `npm run db:seed` | Popula o banco com dados de exemplo |
| `npm run db:studio` | Abre o Prisma Studio para inspecionar o banco visualmente |
| `npm run closing-reminder:check` | Roda o lembrete de fechamento uma vez, manualmente |

## Deploy

Guia passo a passo para colocar em produção (Render para API + banco, Vercel para o
frontend, deploy automático a cada push) em [`DEPLOY.md`](DEPLOY.md).

## Limitações conhecidas (v1)

- Sem upload de anexos — o link da entrega aceita apenas uma URL externa (Drive, etc.).
- O relatório de pagamentos não paginação para competências muito grandes — para o
  volume esperado de uma editora isso não deve ser um problema, mas pode ser revisitado.
