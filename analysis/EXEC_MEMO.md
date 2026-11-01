# Memo: Cut early friction to defend retention

**To:** Product leadership  **From:** Product Analytics  **Re:** Q4 churn
**One-line:** 23% of users churn; friction (ads + dislikes) and weak social connection are the signals — not price. Recommend an ad-load experiment on at-risk free users.

---

## What we found
- **Churn is 23.1%** (52 / 225 users).
- **Friction, not taste, drives it.** Churned users hit **+72% dislikes** and **+64% ads** per 100 songs (both significant). Their *enjoyment rate* (Thumbs-Up / 100) is identical to retained users (p=0.75) — they like the content; the experience wears them down.
- **Social connection is the strongest protector** (Add-Friend −42%, p=0.0002).
- **Paying does not protect** (paid 21.8% vs free 26.7%, p=0.45) — so retention spend should target *behaviour*, not *plan*.

## Recommendation
**Reduce ad load for free users who show early friction**, and **nudge social-graph formation in onboarding.** Ads are the most controllable lever we own and carry the clearest causal hypothesis, so test that first.

## Proposed experiment (A/B)
| | |
|---|---|
| **Hypothesis** | If we cut ad frequency ~40% for free users flagged as high-friction in week 1, then their 30-day churn falls, because reduced friction is the largest controllable churn signal. |
| **Unit / arms** | User-level, 50/50. Control = current ad load; Treatment = reduced ad load. |
| **Primary metric** | 30-day churn rate (Cancellation Confirmation). |
| **Guardrails** | Ad revenue per free user; total listening time; upgrade rate (don't kill the upgrade incentive). |
| **Target effect** | Free-user churn **26.7% → 21.7%** (−5 pts absolute). |
| **Sample size** | **~1,151 users per arm** (α=0.05 two-sided, 80% power). |
| **Duration** | Until each arm reaches ~1,150 exposed free users with 30 days of follow-up. |
| **Decision rule** | Ship if treatment churn is significantly lower **and** ad-revenue guardrail drop ≤ pre-agreed threshold; else iterate on the friction threshold. |

> **Caveat, stated plainly:** the 225-user sample is far too small to run this live (we'd need ~2,300 users). This study *sizes and justifies* the experiment on the full population; it does not replace it. Sample size is computed in [`lib/stats.js`](../lib/stats.js) and testable via `npm test`.

## Why this matters
If the treatment hits the −5pt target, that is a **~19% relative reduction** in free-user churn — the single biggest retention lever we can pull without touching price or catalogue.
