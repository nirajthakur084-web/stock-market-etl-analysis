import React, { useEffect, useState } from 'react';

import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import { KpiCards, TickerCards } from '../partials/dashboard/TickerGrid';
import { PriceChartCard, CumReturnCard } from '../partials/dashboard/ChartsCards';
import { ComparisonTable, QualityCard } from '../partials/dashboard/TablesCards';
import { loadStockData } from '../utils/stockData';

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState('RELIANCE.NS');

  useEffect(() => {
    loadStockData()
      .then((d) => {
        setData(d);
        if (d.summary?.tickers?.length) setSelected(d.summary.tickers[0].ticker);
      })
      .catch((e) => setError(e.message));
  }, []);

  const pick = (ticker) => {
    setSelected(ticker);
    document.getElementById('price-chart')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div id="overview" className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">Stock Market Data ETL &amp; Analysis 📈</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Daily OHLCV pipeline · Yahoo Finance → pandas ETL → SQLite → this dashboard · By <b>Niraj Thakur</b>
                  {data?.summary?.generated_at_utc ? ` · Last run: ${new Date(data.summary.generated_at_utc).toLocaleString('en-IN')}` : ''}
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> LIVE DATA
              </span>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
                Could not load pipeline data ({error}). Run <b>python3 etl/pipeline.py</b> first, then reload.
              </div>
            )}
            {!data && !error && <div className="text-sm text-gray-500 dark:text-gray-400">Loading pipeline data…</div>}

            {data && (
              <div className="grid grid-cols-12 gap-6">
                <KpiCards summary={data.summary} />
                <div id="stocks" className="col-span-full -mb-2">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Stocks &amp; Indices</h2>
                </div>
                <TickerCards tickers={data.summary.tickers} onPick={pick} />
                <PriceChartCard tickers={data.summary.tickers} series={data.series} selected={selected} setSelected={setSelected} />
                <CumReturnCard tickers={data.summary.tickers} series={data.series} />
                <ComparisonTable tickers={data.summary.tickers} />
                <QualityCard quality={data.quality} />
              </div>
            )}

            <footer className="text-xs text-gray-400 dark:text-gray-500 mt-8 leading-relaxed">
              Dashboard template: Mosaic Lite (Cruip) — Tailwind CSS + React. Data: Yahoo Finance. Built by Niraj Thakur. Educational project — not investment advice.
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
