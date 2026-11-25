import React from 'react';
import { inr, pct, num } from '../../utils/stockData';

const cardCls = 'flex flex-col col-span-full bg-white dark:bg-gray-800 shadow-xs rounded-xl';
const thCls = 'text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider p-2';
const tdCls = 'p-2 text-sm text-gray-800 dark:text-gray-100';

export function ComparisonTable({ tickers }) {
  const rows = [...tickers].sort((a, b) => b.period_return_pct - a.period_return_pct);
  return (
    <div id="comparison" className={cardCls}>
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Comparison Table</h2>
        <div className="text-xs text-gray-500 dark:text-gray-400">Sorted by 1-year return · RSI &gt; 70 = overbought, &lt; 30 = oversold</div>
      </header>
      <div className="overflow-x-auto">
        <table className="table-auto w-full dark:text-gray-300">
          <thead>
            <tr>
              <th className={thCls}>Ticker</th><th className={thCls}>Latest Close</th><th className={thCls}>1Y Return</th>
              <th className={thCls}>RSI 14</th><th className={thCls}>Volatility 20d</th><th className={thCls}>Avg Volume</th>
              <th className={thCls}>Best Day</th><th className={thCls}>Worst Day</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {rows.map((t) => (
              <tr key={t.ticker} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                <td className={tdCls}><b>{t.ticker}</b><div className="text-xs text-gray-500">{t.name}</div></td>
                <td className={tdCls}>{inr(t.latest_close)}</td>
                <td className={`${tdCls} font-semibold ${t.period_return_pct >= 0 ? 'text-green-500' : 'text-red-500'}`}>{pct(t.period_return_pct)}</td>
                <td className={tdCls}>{t.rsi_14 ?? '–'}</td>
                <td className={tdCls}>{t.volatility_20d ?? '–'}</td>
                <td className={tdCls}>{num(t.avg_daily_volume)}</td>
                <td className={`${tdCls} text-green-500`}>{pct(t.best_day.return_pct)}<div className="text-xs text-gray-500">{t.best_day.date}</div></td>
                <td className={`${tdCls} text-red-500`}>{pct(t.worst_day.return_pct)}<div className="text-xs text-gray-500">{t.worst_day.date}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function QualityCard({ quality }) {
  return (
    <div id="quality" className={cardCls}>
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">ETL Data Quality</h2>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Every raw row is checked before loading — null closes, duplicate dates, OHLC-logic violations and extreme moves are counted, not silently dropped.
        </div>
      </header>
      <div className="overflow-x-auto">
        <table className="table-auto w-full dark:text-gray-300">
          <thead>
            <tr>
              <th className={thCls}>Ticker</th><th className={thCls}>Raw</th><th className={thCls}>Clean</th>
              <th className={thCls}>Dropped</th><th className={thCls}>Null Close</th><th className={thCls}>OHLC Violations</th><th className={thCls}>Extreme Days &gt;20%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {Object.entries(quality).map(([k, q]) => (
              <tr key={k} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                <td className={tdCls}><b>{k}</b></td>
                <td className={tdCls}>{q.raw_rows}</td>
                <td className={tdCls}>{q.clean_rows}</td>
                <td className={tdCls}>{q.rows_dropped}</td>
                <td className={tdCls}>{q.null_close_rows}</td>
                <td className={tdCls}>{q.ohlc_violations}</td>
                <td className={tdCls}>{q.extreme_move_days_gt20pct}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-700/60">
        <b className="text-gray-700 dark:text-gray-200">How the ETL works:</b> Extract — daily OHLCV from the Yahoo Finance chart API (no key).
        Transform — pandas cleaning + the checks above, then indicators: daily return, SMA 20/50, EMA 20, RSI 14, 20-day volatility, cumulative return.
        Load — SQLite <i>stocks.db</i> (daily_prices, ticker_summary, pipeline_runs) + JSON exports powering this page.
        Re-run anytime with <code className="text-violet-500">python3 etl/pipeline.py</code>. Educational project — not investment advice.
      </div>
    </div>
  );
}
