# 🎵 Cadence — Streaming Analytics Copilot

A self-serve product-analytics tool for a music/audio streaming service. Anyone
in the org — PM, marketing, content — can see how retention, engagement and
churn are doing, **ask the AI copilot *why* a metric moved**, and **write a basic
query in plain English** instead of waiting on an analyst for every small ask.

Every number is **computed from a real event log** (the public
[Sparkify](https://udacity-dsnd.s3.amazonaws.com/sparkify/) dataset — 225 users,
286,500 events, Oct–Dec 2018). Nothing is hand-typed or faked.

> **Live demo:** _add your Vercel/host URL here_ · **AI needs** a free key from your chosen provider (default [Google Gemini](https://aistudio.google.com/apikey))

---

## What it does

| Module | What it is |
|---|---|
| 📊 **Dashboard** | DAU, weekly retention, funnel, top artists, churn signals — all computed from the event log |
| 📉 **Churn Analysis** | Significance tests (Welch's t-test) + a logistic-regression model explaining *why* users cancel |
| 🤖 **AI Copilot** | Chat grounded on the live metrics; diagnoses metric movements with structured RCA. Pluggable LLM (Gemini/Groq/OpenAI/Ollama) |
| ⌨️ **Ask with SQL** | Plain-English question → **live, guarded SQL** on the event log → answer + the SQL + the data table |
| 🧪 **Experiment Planner** | A real A/B **sample-size + significance calculator** (not LLM guesswork) + an AI test-plan generator |
| 📚 **Metric Library** | Reference definitions, formulas and benchmarks for 25+ product metrics |
| 📁 **Data Upload** | Drop a CSV → AI suggests analyses, flags data-quality issues, writes SQL |

## The analysis (start here if you're evaluating the analytics)

This repo is also a worked **product-analyst case study**:

- **[analysis/FINDINGS.md](analysis/FINDINGS.md)** — why users churn: method, significance tests, a churn model (ROC-AUC 0.665), and limitations.
- **[analysis/EXEC_MEMO.md](analysis/EXEC_MEMO.md)** — a one-page recommendation + a fully specified A/B test (hypothesis, guardrails, ~1,151 users/arm, decision rule).

**Headline:** churn is 23.1%. Friction (ads +64%, dislikes +72% per 100 songs) and
weak social connection (Add-Friend −42%, p=0.0002) predict it — **not** price
(paid vs free churn is not significant, p=0.45).

## Architecture

```
raw event log (JSON, 128 MB, gitignored)
      │  analysis/build_metrics.py + churn_analysis.py   (DuckDB SQL + scipy/sklearn)
      ▼
data/derived/*.json      ← dashboard reads these (computed aggregates)
data/derived/events.parquet (5.7 MB, committed)
      │
      ▼
Next.js App Router
  ├─ pages read the derived JSON (lib/metricsData.js)
  ├─ /api/chat, /api/generate → lib/llm.js adapter → Gemini/Groq/OpenAI/Ollama (key held server-side)
  └─ /api/query → text-to-SQL → lib/sqlGuard.js (SELECT-only, LIMIT, no writes) → DuckDB over the parquet
```

**Text-to-SQL is guarded:** generated SQL must be a single `SELECT`/`WITH`, no
DDL/DML, and is row-capped — see [lib/sqlGuard.js](lib/sqlGuard.js) (unit-tested).

## Tech stack
- **Framework:** Next.js 16 (App Router) · React 19
- **Data/engine:** DuckDB (Python pipeline + `@duckdb/node-api` at runtime), Parquet
- **Analysis:** Python · pandas · scipy · scikit-learn
- **AI:** pluggable provider via `lib/llm.js` — Gemini (default) / Groq / OpenAI / Ollama, server-side key, streaming
- **Charts:** Recharts

## Setup

```bash
# 1. install
npm install

# 2. configure the AI provider (default: Gemini)
cp .env.example .env.local      # set LLM_PROVIDER + the matching key

# 3. get the data + build the computed metrics (see analysis/README.md)
mkdir -p data/raw
curl -L -o data/raw/mini_sparkify_event_data.json \
  https://udacity-dsnd.s3.amazonaws.com/sparkify/mini_sparkify_event_data.json
python -m pip install duckdb pandas scipy scikit-learn
npm run build:metrics

# 4. run
npm run dev        # http://localhost:3000
```

The committed `data/derived/` already contains the aggregates + Parquet, so the
app and the text-to-SQL feature **work out of the box** — step 3 only re-derives them.

## Tests
```bash
npm test      # node --test — statistics (lib/stats.js) + SQL guardrails (lib/sqlGuard.js)
```

## Honesty note
This is a portfolio project on a **public dataset**. It's a 225-user sample, so
findings are explicitly treated as *directional* and every significance test
reports its n. There are no fabricated "millions of users" — the point is to show
the method on real data.

## License
[MIT](LICENSE) © 2026 Diya Mittal
