"""
Stock Market Data ETL & Analysis
Author: Niraj Thakur

Pipeline:
  Extract   -> Daily OHLCV for NSE stocks + indices from Yahoo Finance chart API (no API key)
  Transform -> Cleaning + data-quality checks + technical indicators with pandas
               (daily return, SMA 20/50, EMA 20, RSI 14, 20-day volatility, cumulative return)
  Load      -> SQLite (stocks.db) + JSON exports that power the static dashboard
  Analyse   -> Per-ticker summary: period return, best/worst day, avg volume,
               latest RSI / trend signal vs SMA 50

Run:  python3 etl/pipeline.py
Outputs:
  data/stocks.db
  data/summary.json
  data/series/<TICKER>.json
  data/quality.json
"""
import json
import sqlite3
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
import requests

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
SERIES_DIR = DATA_DIR / "series"
DB_PATH = DATA_DIR / "stocks.db"

TICKERS = {
    "RELIANCE.NS": "Reliance Industries",
    "TCS.NS": "Tata Consultancy Services",
    "HDFCBANK.NS": "HDFC Bank",
    "INFY.NS": "Infosys",
    "SBIN.NS": "State Bank of India",
    "ITC.NS": "ITC Limited",
    "HINDUNILVR.NS": "Hindustan Unilever",
    "MARUTI.NS": "Maruti Suzuki India",
    "^NSEI": "NIFTY 50 (Index)",
    "^BSESN": "SENSEX (Index)",
}

HEADERS = {"User-Agent": "Mozilla/5.0 (stock-market-etl; educational project)"}
RANGE = "1y"
INTERVAL = "1d"


# ---------------------------------------------------------------- extract
def extract(symbol: str) -> pd.DataFrame:
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
    r = requests.get(url, params={"range": RANGE, "interval": INTERVAL},
                     headers=HEADERS, timeout=30)
    r.raise_for_status()
    result = r.json()["chart"]["result"][0]
    quote = result["indicators"]["quote"][0]
    df = pd.DataFrame({
        "date": pd.to_datetime(result["timestamp"], unit="s", utc=True).tz_convert("Asia/Kolkata").date,
        "open": quote.get("open"),
        "high": quote.get("high"),
        "low": quote.get("low"),
        "close": quote.get("close"),
        "volume": quote.get("volume"),
    })
    df["ticker"] = symbol
    return df


# ---------------------------------------------------------------- transform
def transform(df: pd.DataFrame):
    """Return (clean_df_with_indicators, quality_report_dict)."""
    raw_rows = len(df)
    quality = {"raw_rows": int(raw_rows)}

    df = df.copy()
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date")

    # quality checks (counted BEFORE fixing, so the report is honest)
    quality["null_close_rows"] = int(df["close"].isna().sum())
    quality["duplicate_dates"] = int(df.duplicated(subset=["date"]).sum())
    quality["ohlc_violations"] = int(
        ((df["high"] < df["low"]) |
         (df["close"] > df["high"] + 1e-9) |
         (df["close"] < df["low"] - 1e-9)).sum()
    )
    quality["negative_volume_rows"] = int((df["volume"].fillna(0) < 0).sum())

    # cleaning
    df = df.dropna(subset=["open", "high", "low", "close"])
    df = df.drop_duplicates(subset=["date"], keep="last")
    df = df[(df["high"] >= df["low"]) & (df["close"] <= df["high"]) & (df["close"] >= df["low"])]
    df["volume"] = df["volume"].fillna(0).astype("int64")
    for c in ["open", "high", "low", "close"]:
        df[c] = df[c].round(2)

    # indicators
    df["daily_return_pct"] = (df["close"].pct_change() * 100).round(3)
    quality["extreme_move_days_gt20pct"] = int((df["daily_return_pct"].abs() > 20).sum())
    df["sma_20"] = df["close"].rolling(20).mean().round(2)
    df["sma_50"] = df["close"].rolling(50).mean().round(2)
    df["ema_20"] = df["close"].ewm(span=20, adjust=False).mean().round(2)

    delta = df["close"].diff()
    gain = delta.clip(lower=0).rolling(14).mean()
    loss = (-delta.clip(upper=0)).rolling(14).mean()
    rs = gain / loss.replace(0, pd.NA)
    df["rsi_14"] = (100 - (100 / (1 + rs))).round(2)

    df["volatility_20d"] = (df["daily_return_pct"].rolling(20).std()).round(3)
    first_close = df["close"].iloc[0]
    df["cumulative_return_pct"] = ((df["close"] / first_close - 1) * 100).round(3)

    quality["clean_rows"] = int(len(df))
    quality["rows_dropped"] = int(raw_rows - len(df))
    quality["date_from"] = str(df["date"].min().date())
    quality["date_to"] = str(df["date"].max().date())
    return df.reset_index(drop=True), quality


def summarise(symbol: str, name: str, df: pd.DataFrame) -> dict:
    last = df.iloc[-1]
    period_return = float(df["cumulative_return_pct"].iloc[-1])
    best = df.loc[df["daily_return_pct"].idxmax()]
    worst = df.loc[df["daily_return_pct"].idxmin()]
    rsi = None if pd.isna(last["rsi_14"]) else float(last["rsi_14"])
    sma50 = None if pd.isna(last["sma_50"]) else float(last["sma_50"])
    if sma50 is None:
        signal = "Not enough data"
    elif float(last["close"]) > sma50:
        signal = "Above SMA 50 (uptrend)"
    else:
        signal = "Below SMA 50 (downtrend)"
    if rsi is not None and rsi >= 70:
        signal += " · RSI overbought"
    elif rsi is not None and rsi <= 30:
        signal += " · RSI oversold"
    return {
        "ticker": symbol,
        "name": name,
        "rows": int(len(df)),
        "date_from": str(df["date"].min().date()),
        "date_to": str(df["date"].max().date()),
        "latest_close": float(last["close"]),
        "latest_date": str(last["date"].date()),
        "period_return_pct": period_return,
        "best_day": {"date": str(best["date"].date()), "return_pct": float(best["daily_return_pct"])},
        "worst_day": {"date": str(worst["date"].date()), "return_pct": float(worst["daily_return_pct"])},
        "avg_daily_volume": int(df["volume"].mean()),
        "rsi_14": rsi,
        "sma_50": sma50,
        "volatility_20d": None if pd.isna(last["volatility_20d"]) else float(last["volatility_20d"]),
        "signal": signal,
    }


# ---------------------------------------------------------------- load
def load(frames: dict, summaries: list, qualities: dict, run_at: str):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    SERIES_DIR.mkdir(parents=True, exist_ok=True)
    if DB_PATH.exists():
        DB_PATH.unlink()
    con = sqlite3.connect(DB_PATH)
    all_rows = []
    for symbol, df in frames.items():
        out = df.copy()
        out["date"] = out["date"].dt.strftime("%Y-%m-%d")
        out.to_sql("daily_prices", con, if_exists="append", index=False)
        all_rows.append(out)
        series = out[["date", "open", "high", "low", "close", "volume",
                      "daily_return_pct", "sma_20", "sma_50", "ema_20",
                      "rsi_14", "cumulative_return_pct"]].where(pd.notna(out), None)
        safe = symbol.replace("^", "IDX_")
        (SERIES_DIR / f"{safe}.json").write_text(
            json.dumps({"ticker": symbol, "points": series.to_dict(orient="records")}, indent=1))
    flat = [{**s,
             "best_day": json.dumps(s["best_day"]),
             "worst_day": json.dumps(s["worst_day"])} for s in summaries]
    pd.DataFrame(flat).to_sql("ticker_summary", con, if_exists="replace", index=False)
    pd.DataFrame([{"run_at_utc": run_at, "tickers": len(frames),
                   "total_clean_rows": int(sum(len(f) for f in frames.values()))}]).to_sql(
        "pipeline_runs", con, if_exists="replace", index=False)
    con.commit(); con.close()

    (DATA_DIR / "summary.json").write_text(json.dumps(
        {"generated_at_utc": run_at, "author": "Niraj Thakur",
         "source": "Yahoo Finance chart API (daily OHLCV, 1 year)",
         "tickers": summaries}, indent=1))
    (DATA_DIR / "quality.json").write_text(json.dumps(qualities, indent=1))


# ---------------------------------------------------------------- main
def main():
    run_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    frames, summaries, qualities = {}, [], {}
    for symbol, name in TICKERS.items():
        try:
            raw = extract(symbol)
        except Exception as e:
            print(f"[FAIL] {symbol}: {e}", file=sys.stderr)
            continue
        clean, quality = transform(raw)
        if clean.empty:
            print(f"[SKIP] {symbol}: no clean rows", file=sys.stderr)
            continue
        frames[symbol] = clean
        summaries.append(summarise(symbol, name, clean))
        qualities[symbol] = quality
        print(f"[OK] {symbol:14s} raw={quality['raw_rows']:4d} clean={quality['clean_rows']:4d} "
              f"return={summaries[-1]['period_return_pct']:+.2f}%  {summaries[-1]['signal']}")
        time.sleep(0.4)
    if not frames:
        print("No data extracted — aborting.", file=sys.stderr)
        sys.exit(1)
    load(frames, summaries, qualities, run_at)
    total = sum(len(f) for f in frames.values())
    print(f"\nLoaded {total} clean rows for {len(frames)} tickers -> {DB_PATH}")
    print(f"Dashboard data -> {DATA_DIR}/summary.json, {SERIES_DIR}/")


if __name__ == "__main__":
    main()
