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

Nota:

- `tradeEnabled=false` (paper-only)

## Telegram: alertas

Preferido:

- definir `TELEGRAM_CHAT_ID`

Fallback:

- se `TELEGRAM_CHAT_ID` vazio
- bot envia alertas para chats que rodaram `/start` após boot

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

## Kelly (stake)

Odds padrão:

- `ODDS=2.0`

Fórmula Kelly:

```text
b = odds - 1
f* = (p*b - (1 - p)) / b
stake = f* * kellyFraction
```

Stake final:

- `0` quando edge <= 0
- limite superior: `MAX_STAKE_PCT`

`p` vem de:

- `probability-calibrator` (quando calibrado)
- fallback por EV (quando só EV disponível)

## EV (como calculado)

EV real:

```text
EV = (p * (odds - 1)) - (1 - p)
EV% = EV * 100
```

`MIN_EV` filtra `EV%`.

## Stop-loss / take-profit

Padrão:

- ATR baseado
- fallback % fixo opcional

Se quiser bloquear trade sem ATR:

- `ALLOW_FIXED_SL_FALLBACK=false`

## Global Risk Manager (correlação)

Ativo por padrão.

Lógica:

- calcula correlação (Pearson) de retornos
- compara símbolo novo vs trades abertos
- soma exposição do cluster correlacionado
- bloqueia se passar limite

Variáveis:

- `GLOBAL_RISK_ENABLED`
- `CORR_LOOKBACK_CANDLES`
- `CORR_THRESHOLD`
- `MAX_CLUSTER_EXPOSURE_PCT`

## Settlement (fechamento)

Auto:

- bot checa trades abertos
- fecha em `stop_loss` ou `take_profit`
- atualiza `bankroll` e grava P&L

Fonte:

- candles via CCXT `fetchOHLCV()`

## Backtesting

Rodar:

```bash
node backtest.js
```

Walk-forward:

```bash
node backtest.js btc_1h_sample.csv --walk-forward --train=1500 --test=500 --step=500
```

Requisito:

- walk-forward precisa CSV maior que `btc_1h_sample.csv`

Config:

- `BACKTEST_SYMBOL=BTC/USDT`
- `BACKTEST_TIMEFRAME=1h`
- `BACKTEST_BANKROLL=10000`
- `WF_TRAIN_CANDLES=1500`
- `WF_TEST_CANDLES=500`
- `WF_STEP_CANDLES=500`
- `BT_LOOKBACK_CANDLES=100`

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
| `[SETTLE] ... stop_loss` | trade fechado no SL | checar `/open-trades` |
| `[SETTLE] ... take_profit` | trade fechado no TP | checar `/trades-history` |
| `[BOT] 0 sinais gerados` | sem setup | ajustar `SYMBOLS` / `TIMEFRAME` |
| `[BOT] Circuit breaker ativo` | ciclo cancelado | reduzir risco / resetar |
| `[SERVER] FinanceEdge API em` | API no ar | abrir dashboard |
| `[RISK] ... ATR ausente ...` | fallback SL desativado | ajustar `ALLOW_FIXED_SL_FALLBACK` |
| `[RISK] ... cluster exposure bloqueado` | correlação alta + exposição | reduzir `MAX_CLUSTER_EXPOSURE_PCT` |
| `[BOT] Trade aberto:` | nova posição paper | checar dashboard |
| `[BOT] ... trade já aberto` | duplicado por símbolo | aguardar settlement |
| `[BOT] risco recusado` | travas risco | rever stake/exposição |
| `[SETTLE] Erro ao verificar trade` | fetchOHLCV falhou | checar exchange/network |
| `[DATA] fetchOHLCV ...` | rate limit/timeout | reduzir símbolos / aumentar timeout |
| `[TG] TELEGRAM_CHAT_ID vazio` | sem alertas | definir `TELEGRAM_CHAT_ID` |
| `[TG] TELEGRAM_TOKEN ausente` | sem comandos | definir `TELEGRAM_TOKEN` |
| `[SERVER] 404 Not found` | rota inexistente | conferir endpoint |

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
LOOKBACK_CANDLES=250

GLOBAL_RISK_ENABLED=true
CORR_LOOKBACK_CANDLES=120
CORR_THRESHOLD=0.75
MAX_CLUSTER_EXPOSURE_PCT=0.20

TELEGRAM_TOKEN=
TELEGRAM_CHAT_ID=
ADMIN_KEY=

MIN_CONFIDENCE=BAIXA
MIN_EV=0.5
```

## Aviso

Sem uso dinheiro real.
Paper trading apenas.