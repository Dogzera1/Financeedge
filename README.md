# FinanceEdge

Bot trading cripto.

Modo padrão: paper.
Dashboard web incluso.

## Rodar local

```bash
npm install
cp .env.example .env
npm start
```

Dashboard:
`http://127.0.0.1:3001/dashboard`

## Binance: acesso API

- Sem `EXCHANGE_API_KEY`/`EXCHANGE_API_SECRET`
  - Acesso público OK
  - Sem ordens reais
- Com chaves configuradas
  - `hasCredentials=true`
  - Ainda roda paper

Endpoint:
`GET /exchange-status`

## Banca fictícia BRL

Banca interna em USDT.
Conversão via `USDT/BRL`.

Endpoint:
`POST /set-bankroll-brl`

Body:

```json
{ "valorBrl": 1000 }
```

Se `USDT/BRL` falhar:
defina `USDT_BRL_FALLBACK`.

## Endpoints úteis

- `GET /health`
- `GET /exchange-status`
- `GET /fx/usdtbrl`
- `GET /roi`
- `GET /bankroll`
- `GET /open-trades`
- `GET /trades-history?limit=30`

## Variáveis .env

```env
MODE=paper
SERVER_PORT=3001
DB_PATH=financeedge.db

EXCHANGE_NAME=binance
EXCHANGE_API_KEY=
EXCHANGE_API_SECRET=

USDT_BRL_FALLBACK=

TELEGRAM_TOKEN=
TELEGRAM_CHAT_ID=
ADMIN_KEY=
```

## Aviso

Sem uso dinheiro real.
Paper trading apenas.