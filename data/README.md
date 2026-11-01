# Data

## Layout
- `raw/` — the raw event log. **Not committed** (128 MB, gitignored). Download it:
  ```bash
  mkdir -p data/raw
  curl -L -o data/raw/mini_sparkify_event_data.json \
    https://udacity-dsnd.s3.amazonaws.com/sparkify/mini_sparkify_event_data.json
  ```
- `derived/` — **committed** outputs of the pipeline:
  - `*.json` — small aggregates the dashboard reads (via `lib/metricsData.js`)
  - `events.parquet` — slim (5.7 MB) columnar copy the text-to-SQL feature queries at runtime

## Regenerate
```bash
python -m pip install duckdb pandas scipy scikit-learn
npm run build:metrics   # runs analysis/build_metrics.py + analysis/churn_analysis.py
```

## Source
[Sparkify](https://udacity-dsnd.s3.amazonaws.com/sparkify/) — a public, anonymized
event log for a fictional music-streaming service (Udacity Data Science Nanodegree).
The `mini` sample: 225 users · 286,500 events · Oct–Dec 2018.

Schema (per event): `userId`, `ts` (epoch ms), `registration`, `sessionId`,
`page` (`NextSong`, `Thumbs Up/Down`, `Add Friend`, `Roll Advert`, `Submit Upgrade`,
`Cancellation Confirmation`, …), `level` (`free`/`paid`), `artist`, `song`,
`length`, `gender`, `location`.
