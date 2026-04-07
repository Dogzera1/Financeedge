function fmt(n, dec = 2) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  return Number(n).toFixed(dec);
}

function money(n, ccy) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  const v = Number(n);
  if (ccy === 'BRL') return `R$ ${v.toFixed(2)}`;
  return `$ ${v.toFixed(4)}`;
}

async function jget(p) {
  const r = await fetch(p);
  return await r.json();
}

async function jpost(p, body) {
  const r = await fetch(p, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  return await r.json();
}

function setDot(ok, txt) {
  const dot = document.getElementById('dot');
  dot.classList.remove('ok', 'bad');
  dot.classList.add(ok ? 'ok' : 'bad');
  document.getElementById('statusTxt').textContent = txt;
}

function rowOpen(t, fx) {
  const pnl = t?.unrealized?.pnlUsdt;
  const pnlBrl = fx ? pnl * fx : null;
  const cls = pnl > 0 ? 'good' : pnl < 0 ? 'bad' : '';
  return `
    <tr>
      <td class="num">${t.id}</td>
      <td>${t.symbol}</td>
      <td>${String(t.direction || '').toUpperCase()}</td>
      <td class="num">${fmt(t.entry_price, 4)}</td>
      <td class="num">${t.currentPrice ? fmt(t.currentPrice, 4) : '—'}</td>
      <td class="num ${cls}">${pnl != null ? money(pnl, 'USDT') : '—'} <span class="muted">${pnlBrl != null ? `(${money(pnlBrl, 'BRL')})` : ''}</span></td>
    </tr>
  `;
}

function rowHist(t, fx) {
  const pnl = t.pnl_usdt;
  const pnlBrl = fx ? pnl * fx : null;
  const cls = pnl > 0 ? 'good' : pnl < 0 ? 'bad' : '';
  return `
    <tr>
      <td class="num">${t.id}</td>
      <td>${t.symbol}</td>
      <td>${String(t.direction || '').toUpperCase()}</td>
      <td class="num">${fmt(t.entry_price, 4)}</td>
      <td class="num">${t.exit_price ? fmt(t.exit_price, 4) : '—'}</td>
      <td>${t.result || '—'}</td>
      <td class="num ${cls}">${pnl != null ? money(pnl, 'USDT') : '—'} <span class="muted">${pnlBrl != null ? `(${money(pnlBrl, 'BRL')})` : ''}</span></td>
      <td class="muted">${t.closed_at || '—'}</td>
    </tr>
  `;
}

async function refresh() {
  try {
    setDot(true, 'carregando');
    const [health, roi, open, hist, fx, ex, risk, inds] = await Promise.all([
      jget('/health'),
      jget('/roi'),
      jget('/open-trades'),
      jget('/trades-history?limit=30'),
      jget('/fx/usdtbrl'),
      jget('/exchange-status'),
      jget('/debug-risk'),
      jget('/debug-indicators'),
    ]);

    const rate = fx?.rate || null;
    document.getElementById('fx').textContent = rate ? fmt(rate, 4) : '—';

    document.getElementById('exName').textContent = ex?.name || '—';
    document.getElementById('exPub').textContent = ex?.publicOk ? 'ok' : 'falha';
    document.getElementById('exCred').textContent = ex?.hasCredentials ? 'sim' : 'não';

    const bk = roi?.bankroll;
    const now = bk?.current;
    const initial = bk?.initial;
    const profit = bk?.profit;

    document.getElementById('bkNow').textContent = now != null ? money(now, 'USDT') : '—';
    document.getElementById('bkProfit').textContent = profit != null ? money(profit, 'USDT') : '—';
    document.getElementById('bkRoi').textContent = bk?.growthPct != null ? `${fmt(bk.growthPct, 2)}%` : '—';

    const nowBrl = rate && now != null ? now * rate : null;
    const profitBrl = rate && profit != null ? profit * rate : null;
    document.getElementById('bkNowBrl').textContent = nowBrl != null ? money(nowBrl, 'BRL') : '—';
    document.getElementById('bkProfitBrl').textContent = profitBrl != null ? money(profitBrl, 'BRL') : '—';

    document.getElementById('openCount').textContent = Array.isArray(open) ? String(open.length) : '0';
    document.getElementById('winRate').textContent = roi?.overall?.winRate != null ? `${roi.overall.winRate}%` : '—';
    document.getElementById('pnlTotal').textContent = roi?.overall?.totalPnlUsdt != null ? money(roi.overall.totalPnlUsdt, 'USDT') : '—';

    document.getElementById('meta').textContent =
      `modo=${health?.mode || '—'} | symbols=${(health?.symbols || []).join(', ') || '—'} | timeframe=${health?.timeframe || '—'} | circuito=${health?.circuitBreaker ? 'on' : 'off'}`;

    const losses24 = risk?.losses24hUsdt;
    const totalExp = risk?.totalExposureUsdt;
    document.getElementById('riskMeta').textContent =
      `losses24h=${losses24 != null ? money(losses24, 'USDT') : '—'} | exposure=${totalExp != null ? money(totalExp, 'USDT') : '—'} | wouldTrip=${risk?.wouldTrip ? 'sim' : 'não'}`;

    const openRows = document.getElementById('openRows');
    openRows.innerHTML = Array.isArray(open) && open.length
      ? open.map(t => rowOpen(t, rate)).join('')
      : `<tr><td colspan="6" class="muted">Sem posições abertas</td></tr>`;

    const histRows = document.getElementById('histRows');
    histRows.innerHTML = Array.isArray(hist) && hist.length
      ? hist.map(t => rowHist(t, rate)).join('')
      : `<tr><td colspan="8" class="muted">Sem histórico</td></tr>`;

    setDot(true, 'ok');
  } catch (e) {
    setDot(false, 'erro');
  }
}

document.getElementById('btnRefresh').addEventListener('click', refresh);

document.getElementById('btnSetBrl').addEventListener('click', async () => {
  const v = Number(String(document.getElementById('bkBrl').value || '').replace(',', '.'));
  if (!v || v <= 0) return;
  // precisa ADMIN_KEY via header; este botão serve p/ uso local com proxy/reverse.
  // Se estiver via Railway, use curl com x-admin-key.
  await jpost('/set-bankroll-brl', { valorBrl: v });
  await refresh();
});

refresh();
setInterval(refresh, 8000);

