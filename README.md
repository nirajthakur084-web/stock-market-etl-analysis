# Stock Market Data ETL & Analysis

**Author: Niraj Thakur**

An end-to-end data engineering project: a Python ETL pipeline extracts daily
stock-market data, cleans and validates it, computes technical indicators and
loads it into SQLite — and a React + Tailwind dashboard (based on the Cruip
**Mosaic Lite** template) presents the analysis.

## What it does

| Stage | Details |
|---|---|
| **Extract** | Daily OHLCV (1 year) for 8 NSE stocks + NIFTY 50 & SENSEX from the Yahoo Finance chart API — no API key needed |
| **Transform** | pandas cleaning + data-quality checks: null closes, duplicate dates, OHLC-logic violations, negative volume, extreme-move days (>20%) — all counted in `data/quality.json` before dropping. Indicators: daily return %, SMA 20, SMA 50, EMA 20, RSI 14, 20-day rolling volatility, cumulative return % |
| **Load** | SQLite `data/stocks.db` — tables `daily_prices`, `ticker_summary`, `pipeline_runs` + JSON exports in `data/`, mirrored to `public/data/` for the web app |
| **Dashboard** | React + Vite + Tailwind CSS (Mosaic Lite template by Cruip): KPI cards, per-stock cards with RSI/trend signals, price chart with SMA 20/50 overlays, cumulative-return comparison for all 10 tickers, comparison table, ETL data-quality report. Dark/light mode included |

**Tickers:** RELIANCE.NS, TCS.NS, HDFCBANK.NS, INFY.NS, SBIN.NS, ITC.NS,
HINDUNILVR.NS, MARUTI.NS, ^NSEI (NIFTY 50), ^BSESN (SENSEX)

## Run the ETL pipeline

```bash
pip install -r requirements.txt
python3 etl/pipeline.py
```

## Run the dashboard

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
```

## Deploy (Vercel)

Import this repo in Vercel — it auto-detects **Vite** (build `npm run build`,
output `dist`), no environment variables needed. Every push to `main`
redeploys automatically.

## Sample SQL (on data/stocks.db)

```sql
-- Best single-day gain per ticker
SELECT ticker, date, MAX(daily_return_pct) FROM daily_prices GROUP BY ticker;

-- Stocks currently above their 50-day average
SELECT ticker, latest_close, sma_50 FROM ticker_summary WHERE latest_close > sma_50;
```

## Tech stack
Python · pandas · requests · SQLite · React · Vite · Tailwind CSS · Chart.js · Vercel

Dashboard UI based on [Mosaic Lite](https://github.com/cruip/tailwind-dashboard-template) by Cruip (MIT).

*Educational project — not investment advice. Market data: Yahoo Finance.*
