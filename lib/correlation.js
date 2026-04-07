function pearsonCorrelation(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return null;
  const n = Math.min(a.length, b.length);
  if (n < 3) return null;

  let sumA = 0, sumB = 0;
  for (let i = 0; i < n; i++) { sumA += a[i]; sumB += b[i]; }
  const meanA = sumA / n;
  const meanB = sumB / n;

  let cov = 0, varA = 0, varB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    cov += da * db;
    varA += da * da;
    varB += db * db;
  }
  if (varA === 0 || varB === 0) return null;
  return cov / Math.sqrt(varA * varB);
}

function pctReturnsFromCloses(closes) {
  if (!Array.isArray(closes) || closes.length < 3) return [];
  const out = [];
  for (let i = 1; i < closes.length; i++) {
    const prev = closes[i - 1];
    const cur = closes[i];
    if (!prev || !cur) continue;
    out.push((cur - prev) / prev);
  }
  return out;
}

module.exports = { pearsonCorrelation, pctReturnsFromCloses };

