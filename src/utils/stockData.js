// Data loading for the Stock Market ETL dashboard.
// All JSON is produced by etl/pipeline.py and served from /data (public/data).
export const fileFor = (t) => (t.startsWith('^') ? 'IDX_' + t.slice(1) : t);

export const inr = (v) =>
  v == null ? '–' : '₹' + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 });

export const pct = (v, digits = 2) =>
  v == null ? '–' : (v >= 0 ? '+' : '') + Number(v).toFixed(digits) + '%';

export const num = (v) => (v == null ? '–' : Number(v).toLocaleString('en-IN'));

async function getJSON(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(path + ' → HTTP ' + r.status);
  return r.json();
}

export async function loadStockData() {
  const summary = await getJSON('data/summary.json');
  const quality = await getJSON('data/quality.json');
  const series = {};
  for (const t of summary.tickers) {
    series[t.ticker] = (await getJSON('data/series/' + fileFor(t.ticker) + '.json')).points;
  }
  return { summary, quality, series };
}
