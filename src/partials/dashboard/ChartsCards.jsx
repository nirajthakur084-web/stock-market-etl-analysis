import React, { useMemo, useState } from 'react';
import StockLineChart from '../../charts/StockLineChart';

const cardCls = 'flex flex-col col-span-full bg-white dark:bg-gray-800 shadow-xs rounded-xl';
const PALETTE = ['#8470ff', '#38bdf8', '#22c55e', '#f59e0b', '#ef4444', '#f472b6', '#2dd4bf', '#fb923c', '#60a5fa', '#e879f9'];

export function PriceChartCard({ tickers, series, selected, setSelected }) {
  const pts = series[selected] || [];
  const labels = useMemo(() => pts.map((p) => p.date), [pts]);
  const datasets = useMemo(
    () => [
      { label: 'Close', data: pts.map((p) => p.close), color: '#38bdf8', width: 2 },
      { label: 'SMA 20', data: pts.map((p) => p.sma_20), color: '#f59e0b' },
      { label: 'SMA 50', data: pts.map((p) => p.sma_50), color: '#8470ff' },
    ],
    [pts]
  );
  const t = tickers.find((x) => x.ticker === selected);
  return (
    <div id="price-chart" className={cardCls}>
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-800 dark:text-gray-100">Price Chart — Close with SMA 20 / SMA 50</h2>
          <div className="text-xs text-gray-500 dark:text-gray-400">{t ? `${t.name} · latest ${t.latest_date}` : ''}</div>
        </div>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="form-select text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700/60 text-gray-800 dark:text-gray-100 rounded-lg"
        >
          {tickers.map((x) => (
            <option key={x.ticker} value={x.ticker}>{x.ticker} — {x.name}</option>
          ))}
        </select>
      </header>
      <div className="p-3">
        {pts.length ? <StockLineChart labels={labels} datasets={datasets} height={340} /> : <div className="p-5 text-sm">Loading…</div>}
      </div>
    </div>
  );
}

export function CumReturnCard({ tickers, series }) {
  const first = tickers[0]?.ticker;
  const labels = useMemo(() => (first && series[first] ? series[first].map((p) => p.date) : []), [series, first]);
  const datasets = useMemo(
    () =>
      tickers.map((t, i) => ({
        label: t.ticker,
        data: (series[t.ticker] || []).map((p) => p.cumulative_return_pct),
        color: PALETTE[i % PALETTE.length],
        width: 1.4,
      })),
    [tickers, series]
  );
  return (
    <div className={cardCls}>
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Cumulative Return % — all tickers, rebased to day 1</h2>
        <div className="text-xs text-gray-500 dark:text-gray-400">Who actually grew your money over the last year?</div>
      </header>
      <div className="p-3">
        {labels.length ? <StockLineChart labels={labels} datasets={datasets} ySuffix="%" height={320} /> : <div className="p-5 text-sm">Loading…</div>}
      </div>
    </div>
  );
}
