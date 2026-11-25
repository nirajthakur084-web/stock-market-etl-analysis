# Stock Market Data ETL & Analysis

**Author: Niraj Thakur**

An end-to-end data engineering project that extracts daily stock-market data,
cleans and validates it, computes technical indicators, loads it into SQLite,
and publishes an interactive analysis dashboard.

## What it does

| Stage | Details |
|---|---|
| **Extract** | Daily OHLCV (1 year) for 8 NSE stocks + NIFTY 50 & SENSEX from the Yahoo Finance chart API — no API key needed |
| **Transform** | pandas cleaning + data-quality checks: null closes, duplicate dates, OHLC-logic violations, negative volume, extreme-move days (>20%) — all counted in `data/quality.json` before dropping |
| **Indicators** | Daily return %, SMA 20, SMA 50, EMA 20, RSI 14, 20-day rolling volatility, cumulative return % |
| **Load** | SQLite `data/stocks.db` — tables `daily_prices`, `ticker_summary`, `pipeline_runs` (upsert-style full refresh per run) + JSON exports in `data/` |
| **Analyse** | Static dashboard (`index.html`): price chart with SMA overlays, cumulative-return comparison for all tickers, per-stock cards with RSI / trend signal, comparison table, ETL quality report |

**Tickers:** RELIANCE.NS, TCS.NS, HDFCBANK.NS, INFY.NS, SBIN.NS, ITC.NS,
HINDUNILVR.NS, MARUTI.NS, ^NSEI (NIFTY 50), ^BSESN (SENSEX)

## Run the pipeline

```bash
pip install -r requirements.txt
python3 etl/pipeline.py
```

## View the dashboard locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy (Vercel)

This is a fully static site (`index.html` + `data/*.json`) — import the repo
in Vercel with no build command and no environment variables, or run:

```bash
npx vercel --prod
```

## Sample SQL (on data/stocks.db)

```sql
-- Best single-day gain per ticker
SELECT ticker, date, MAX(daily_return_pct) FROM daily_prices GROUP BY ticker;

-- Stocks currently above their 50-day average
SELECT ticker, latest_close, sma_50 FROM ticker_summary WHERE latest_close > sma_50;
```

## Tech stack
Python · pandas · requests · SQLite · HTML/CSS/JS · Chart.js · Vercel

*Educational project — not investment advice. Market data: Yahoo Finance.*
