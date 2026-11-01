# Analyst Guide — Cadence

How to use Cadence as a product/data analyst, and where every number comes from.
All metrics are computed from the public Sparkify event log (225 users, 286,500
events, Oct–Dec 2018) — see [data/README.md](data/README.md).

> **Written for:** analysts and reviewers who want to know what's real and how it's derived.

## The question this project answers
*Why do ~1 in 4 users churn, and what should we do about it?* — plus a self-serve
layer so non-analysts can answer simple questions without pinging you.

## Where the numbers come from
Nothing is hand-typed. The pipeline reads the raw log and writes aggregates:

| Metric | Computed in | Reads |
|---|---|---|
| Churn rate, DAU/MAU, funnel, retention, top artists | [analysis/build_metrics.py](analysis/build_metrics.py) | raw event log |
| Churn significance tests + logistic model | [analysis/churn_analysis.py](analysis/churn_analysis.py) | raw event log |
| Stand-alone SQL for each headline metric | [analysis/sql/](analysis/sql/) | raw event log |

Run `npm run build:metrics` to regenerate everything.

## The modules
1. **Dashboard** — headline KPIs, DAU trend, weekly active retention, funnel, top artists, churn signals.
2. **Churn Analysis** — the core study: churned-vs-retained means with Welch's t-test p-values, a logistic-regression model (odds ratios + 5-fold CV ROC-AUC), and the paid-vs-free finding. This is the "why did it move" view.
3. **AI Copilot** — grounded on the live KPIs; use it for root-cause analysis and metric explanations.
4. **Ask with SQL** — type a question in English, get the answer + the generated SQL (editable, re-runnable) + the data. This is the self-serve layer for the rest of the org.
5. **Experiment Planner** — size an A/B test and check significance with the real calculator in [lib/stats.js](lib/stats.js); generate a full test plan with AI.
6. **Metric Library** — definitions, formulas, benchmarks, and an AI deep-dive per metric.

## Key findings (summary)
- **Churn = 23.1%** (52 / 225).
- **Friction predicts churn:** ads +64%, dislikes +72% per 100 songs (both significant).
- **Social connection protects:** Add-Friend −42%, p = 0.0002 (strongest signal).
- **Not a taste problem:** Thumbs-Up *rate* is identical across groups (p = 0.75).
- **Price is not the lever:** paid vs free churn is not significant (p = 0.45).

Full write-up: [analysis/FINDINGS.md](analysis/FINDINGS.md) · Recommendation + A/B design: [analysis/EXEC_MEMO.md](analysis/EXEC_MEMO.md).

## Recommended analyst workflow
1. Start on **Churn Analysis** to see what's driving cancellations and whether it's significant.
2. Use **Ask with SQL** to slice a hypothesis quickly (e.g. "ads per song for churned vs retained paid users").
3. Use the **Experiment Planner** to size the intervention before proposing it.
4. Hand leadership the one-page **EXEC_MEMO**.

## Limitations (always state these)
n = 225 — findings are directional, not production-grade. The study is observational
(correlation, not proven causation); the recommended A/B test is how you'd establish
causality. The window is two months, so no seasonality is captured.
