# FinanceEdge

Bot trading cripto.

Modo padrão: paper.
Dashboard web incluso.

## Segurança API (Binance/CCXT)

Chaves API:

- Habilitar: Spot Trading
- Desabilitar: Withdrawals
- Opcional: Reading

Nunca commitar `.env`.

## Rodar local

```bash
npm install
cp .env.example .env
npm start
```

Dashboard:
`http://127.0.0.1:3001/dashboard`

## Deploy Railway

Start:

- `node start.js`

Porta:

- Railway usa `PORT`
- `start.js` propaga para `SERVER_PORT`

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

## Dashboard web

Página:

- `GET /dashboard`

Dados:

- `GET /roi`
- `GET /bankroll`
- `GET /open-trades`
- `GET /trades-history?limit=30`

## API: endpoints úteis

- `GET /health`
- `GET /exchange-status`
- `GET /fx/usdtbrl`
- `GET /roi`
- `GET /bankroll`
- `GET /open-trades`
- `GET /trades-history?limit=30`

## Debug endpoints

- `GET /debug-risk`
- `GET /debug-indicators`
- `GET /debug-regime`

## Circuit breaker

Perdas 24h:

- soma `ABS(pnl_usdt)` de trades `loss` nas últimas 24h
- bloqueia novos trades quando passa `CIRCUIT_BREAKER_PCT`

## Stop-loss / take-profit

Padrão:

- ATR baseado
- fallback % fixo opcional

Se quiser bloquear trade sem ATR:

- `ALLOW_FIXED_SL_FALLBACK=false`

## Backtesting

Rodar:

```bash
node backtest.js
```

Config:

- `BACKTEST_SYMBOL=BTC/USDT`
- `BACKTEST_TIMEFRAME=1h`
- `BACKTEST_BANKROLL=10000`

## Calibração de probabilidade

Cache:

- `probability-cache.json` (ignorado no git)

Gerar:

```bash
node calibrate-probabilities.js
```

## Logs: decodificação rápida

| Log | Significado | Ação |
|-----|-------------|------|
| `[RISK] Circuit breaker ativado` | perdas 24h acima limite | reduzir risco / esperar 24h |
| `[TG] 409 Conflict` | duas instâncias polling | parar instância duplicada |
| `[DATA] Exchange inicializada` | CCXT OK | verificar `/exchange-status` |
| `[ML] ... ev=... conf=...` | sinal gerado | checar `/signals` e `/debug-indicators` |

## Variáveis .env

```env
MODE=paper
SERVER_PORT=3001
DB_PATH=financeedge.db

EXCHANGE_NAME=binance
EXCHANGE_API_KEY=
EXCHANGE_API_SECRET=

USDT_BRL_FALLBACK=
ALLOW_FIXED_SL_FALLBACK=true

TELEGRAM_TOKEN=
TELEGRAM_CHAT_ID=
ADMIN_KEY=
```

## Aviso

Sem uso dinheiro real.
Paper trading apenas.