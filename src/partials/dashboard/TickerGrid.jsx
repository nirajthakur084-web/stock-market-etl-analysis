import React from 'react';
import { inr, pct, num } from '../../utils/stockData';

const cardCls = 'flex flex-col bg-white dark:bg-gray-800 shadow-xs rounded-xl';

export function KpiCards({ summary }) {
  const T = summary.tickers;
  const totalRows = T.reduce((a, t) => a + t.rows, 0);
  const best = [...T].sort((a, b) => b.period_return_pct - a.period_return_pct)[0];
  const kpis = [
    { label: 'Tickers tracked', value: String(T.length), sub: '8 NSE stocks + NIFTY 50 + SENSEX' },
    { label: 'Clean rows in SQLite', value: num(totalRows), sub: 'daily_prices table · stocks.db' },
    { label: 'Data period', value: T[0].date_from.slice(0, 4) + ' → ' + T[0].date_to, sub: '1 year of daily OHLCV' },
    { label: 'Best 1-year performer', value: best.ticker.replace('.NS', '') + ' ' + pct(best.period_return_pct), sub: best.name, good: best.period_return_pct >= 0 },
  ];
  return (
    <>
      {kpis.map((k) => (
        <div key={k.label} className={`${cardCls} col-span-full sm:col-span-6 xl:col-span-3`}>
          <div className="px-5 py-5">
            <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{k.label}</div>
            <div className={`text-2xl font-bold mt-2 ${k.good === false ? 'text-red-500' : k.good ? 'text-green-500' : 'text-gray-800 dark:text-gray-100'}`}>{k.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{k.sub}</div>
          </div>
        </div>
      ))}
    </>
  );
}

export function TickerCards({ tickers, onPick }) {
  return (
    <>
      {tickers.map((t) => {
        const up = t.period_return_pct >= 0;
        return (
          <div key={t.ticker} className={`${cardCls} col-span-full sm:col-span-6 lg:col-span-4 xl:col-span-3`}>
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">{t.ticker}</h3>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t.name}</div>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${up ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                  {up ? '▲' : '▼'} {Math.abs(t.period_return_pct).toFixed(2)}%
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-3">{inr(t.latest_close)}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                RSI 14: <b className="text-gray-700 dark:text-gray-200">{t.rsi_14 ?? '–'}</b> · Vol 20d: <b className="text-gray-700 dark:text-gray-200">{t.volatility_20d ?? '–'}</b>
                <br />Avg volume: {num(t.avg_daily_volume)} · Latest: {t.latest_date}
              </div>
              <div className="text-xs mt-3 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/60 rounded-lg px-2.5 py-2 text-gray-600 dark:text-gray-300">
                {t.signal}
              </div>
              <button
                onClick={() => onPick(t.ticker)}
                className="text-xs font-semibold text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 mt-3"
              >
                View price chart →
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
