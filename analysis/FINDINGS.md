# Churn Case Study — Why users cancel, and by how much

**Dataset:** Sparkify public event log (`mini` sample) · 225 users · 286,500 events · 1 Oct – 3 Dec 2018.
**Reproduce:** `python analysis/build_metrics.py && python analysis/churn_analysis.py`

---

## 1. The question
We lose roughly **1 in 4 users**. *Which behaviours predict cancellation, how big is each effect, and what is the single most actionable lever?*

## 2. Data & method
- **User** = a non-empty `userId`. Logged-out/guest rows are excluded from user-grain metrics.
- **Churn** = the user reached the `Cancellation Confirmation` page (Sparkify's definitive delete event). **52 of 225 users churned → 23.1%.**
- **Tests:** Welch's t-test (unequal variance) per feature; two-proportion z-test for the paid-vs-free gap; L2 logistic regression with 5-fold cross-validated ROC-AUC.
- **Confound handled:** raw totals (songs, sessions) are biased because a user who leaves early simply has fewer days to rack up events. We therefore lead with **time-normalized rates** (per-100-songs) and treat totals as secondary context.

## 3. Headline findings

| Signal (per user) | Churned | Retained | Lift | p-value | Significant |
|---|---|---|---|---|---|
| **Add-Friend actions** | 12.2 | 21.1 | **−42%** | 0.0002 | ✅ |
| **Dislikes / 100 songs** | 1.75 | 1.02 | **+72%** | 0.003 | ✅ |
| Sessions | 10.3 | 15.3 | −32% | 0.004 | ✅ |
| Songs played | 700 | 1,108 | −37% | 0.003 | ✅ (confounded by tenure) |
| **Ads / 100 songs** | 5.87 | 3.58 | **+64%** | 0.017 | ✅ |
| Thumbs-Up / 100 songs | 5.36 | 5.51 | −3% | 0.75 | ❌ |

**Three things that matter:**

1. **Friction predicts churn.** Churned users hit ~72% more dislikes and ~64% more ads per 100 songs. Both are statistically significant.
2. **Social connection protects.** Add-Friend is the single strongest signal (−42%, p=0.0002). Users who build a social graph stay.
3. **It is *not* a content-taste problem.** Thumbs-Up *rate* is identical across groups (p=0.75) — churned users enjoy what they play just as much; they simply play **less** and hit **more friction**. The problem is experience, not catalogue.

**And one thing that surprised us:** being a **paying user does not protect against churn** — paid churn 21.8% vs free 26.7%, and the gap is **not significant** (z=−0.76, p=0.45). Monetization status is the wrong place to look for retention risk.

## 4. Churn model (directional)
L2 logistic regression on 5 behavioural features, 5-fold CV:

- **ROC-AUC = 0.665 ± 0.086** — modest but real lift over the 0.50 baseline, honest for n=225.
- Largest standardized effects (odds ratio per +1 SD):
  - `dislikes_per_100` → **1.84×** churn odds
  - `add_friend` → **0.70×** (protective)
  - `sessions` → 0.83× (protective)
  - `ads_per_100` → 1.18×

The model agrees with the univariate tests: **friction up, social down → churn up.**

## 5. Limitations (read before acting)
- **n = 225.** Everything here is *directional*. Segment splits and the model are not production-grade; they justify an experiment, not a launch.
- **Observational, not causal.** Ads and dislikes correlate with churn; this study cannot prove ads *cause* churn. The recommended A/B test (see [EXEC_MEMO.md](EXEC_MEMO.md)) is how we'd establish causality.
- **Two-month window.** No seasonality captured; "retention" here is week-over-week active retention, not a 12-month cohort.

➡️ **Recommendation and experiment design:** [EXEC_MEMO.md](EXEC_MEMO.md)
