# Analysis

Reproducible analytics layer for Cadence. Every number in the dashboard and the
case study is computed here from the raw event log — nothing is hand-typed.

## Contents
| File | What it does |
|---|---|
| `build_metrics.py` | Reads the raw log, computes all dashboard aggregates → `data/derived/*.json` |
| `churn_analysis.py` | Churn case study: significance tests + logistic-regression model → `data/derived/churn_stats.json`, `churn_model.json` |
| `sql/*.sql` | Stand-alone, runnable DuckDB queries for the headline metrics |
| `FINDINGS.md` | The case study writeup (method, results, limitations) |
| `EXEC_MEMO.md` | One-page recommendation + A/B test design for product leadership |

## Reproduce
```bash
# 1. get the data (~128 MB, not committed)
mkdir -p data/raw
curl -L -o data/raw/mini_sparkify_event_data.json \
  https://udacity-dsnd.s3.amazonaws.com/sparkify/mini_sparkify_event_data.json

# 2. install analysis deps
python -m pip install duckdb pandas scipy scikit-learn

# 3. build everything
python analysis/build_metrics.py
python analysis/churn_analysis.py
```

## Run a single SQL query
```bash
python -m pip install duckdb
python -c "import duckdb; [print(r) for r in duckdb.sql(open('analysis/sql/01_churn_rate.sql').read()).fetchall()]"
```

## Data source
[Sparkify](https://udacity-dsnd.s3.amazonaws.com/sparkify/) — a public,
anonymized event log for a fictional music-streaming service (Udacity). The
`mini` sample is 225 users / 286,500 events / Oct–Dec 2018. Small n is called
out as a limitation wherever it matters.
