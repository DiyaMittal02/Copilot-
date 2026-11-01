"""
churn_analysis.py — the Cadence churn case study.

Answers the business question: *Which behaviours predict that a user will
cancel, and how large is the effect?* Produces:
  - data/derived/churn_stats.json   (per-feature means + significance tests)
  - data/derived/churn_model.json   (logistic-regression odds ratios + CV AUC)
These feed both the dashboard's Churn view and analysis/FINDINGS.md.

Method:
  - Welch's t-test (unequal variance) for continuous behavioural features.
  - Two-proportion z-test for the paid-vs-free churn gap.
  - L2 logistic regression with 5-fold cross-validated ROC-AUC; coefficients
    reported as odds ratios on standardized features (comparable effect sizes).

Caveat handled explicitly: raw totals (songs, sessions, tenure) are confounded
by observation time — a user who cancels early simply has fewer days to
accumulate events. We therefore lead with *rate* features (ads per 100 songs,
dislikes per 100 songs) that are time-normalized, and report totals only as
secondary context.
"""
import os, json, sys
import numpy as np
import pandas as pd
import duckdb
from scipy import stats
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline

RAW = sys.argv[1] if len(sys.argv) > 1 else os.path.join("data", "raw", "mini_sparkify_event_data.json")
OUT = os.path.join("data", "derived")
os.makedirs(OUT, exist_ok=True)


def load_features():
    con = duckdb.connect()
    con.execute("SET TimeZone='UTC';")
    con.execute(f"""
        CREATE VIEW ev AS
        SELECT *, to_timestamp(ts/1000) AS t
        FROM read_json_auto('{RAW.replace(chr(92), '/')}', format='newline_delimited')
        WHERE userId IS NOT NULL AND userId <> '';
    """)
    return con.execute("""
        SELECT
            userId,
            max(CASE WHEN page='Cancellation Confirmation' THEN 1 ELSE 0 END) AS churned,
            count(*) FILTER (WHERE page='NextSong')          AS songs,
            count(DISTINCT sessionId)                        AS sessions,
            count(*) FILTER (WHERE page='Thumbs Up')         AS thumbs_up,
            count(*) FILTER (WHERE page='Thumbs Down')       AS thumbs_down,
            count(*) FILTER (WHERE page='Roll Advert')       AS adverts,
            count(*) FILTER (WHERE page='Add Friend')        AS add_friend,
            max(CASE WHEN level='paid' THEN 1 ELSE 0 END)    AS ever_paid
        FROM ev GROUP BY userId;
    """).fetchdf()


def main():
    df = load_features()
    # time-normalized rate features (robust to observation-window bias)
    df["ads_per_100"] = 100 * df["adverts"] / df["songs"].clip(lower=1)
    df["dislikes_per_100"] = 100 * df["thumbs_down"] / df["songs"].clip(lower=1)
    df["likes_per_100"] = 100 * df["thumbs_up"] / df["songs"].clip(lower=1)

    churned = df[df.churned == 1]
    retained = df[df.churned == 0]

    # ---- 1. Significance tests on each feature -----------------------------
    tested = ["ads_per_100", "dislikes_per_100", "likes_per_100",
              "add_friend", "sessions", "songs"]
    stats_rows = []
    for f in tested:
        t, p = stats.ttest_ind(churned[f], retained[f], equal_var=False)
        stats_rows.append({
            "feature": f,
            "churned_mean": round(float(churned[f].mean()), 2),
            "retained_mean": round(float(retained[f].mean()), 2),
            "lift_pct": round(float(churned[f].mean() / retained[f].mean() - 1) * 100, 0),
            "t_stat": round(float(t), 2),
            "p_value": round(float(p), 4),
            "significant_05": bool(p < 0.05),
        })

    # two-proportion z-test: do paid users churn differently from free?
    paid_churn = df[df.ever_paid == 1]["churned"]
    free_churn = df[df.ever_paid == 0]["churned"]
    c1, n1 = int(paid_churn.sum()), len(paid_churn)
    c2, n2 = int(free_churn.sum()), len(free_churn)
    pz, nz = (c1 + c2) / (n1 + n2), None
    se = np.sqrt(pz * (1 - pz) * (1 / n1 + 1 / n2))
    z = (c1 / n1 - c2 / n2) / se
    p_paid = 2 * (1 - stats.norm.cdf(abs(z)))
    paid_test = {
        "paid_churn_rate": round(100 * c1 / n1, 1),
        "free_churn_rate": round(100 * c2 / n2, 1),
        "z_stat": round(float(z), 2),
        "p_value": round(float(p_paid), 4),
        "significant_05": bool(p_paid < 0.05),
    }

    with open(os.path.join(OUT, "churn_stats.json"), "w", encoding="utf-8") as f:
        json.dump({"feature_tests": stats_rows, "paid_vs_free": paid_test,
                   "n_churned": len(churned), "n_retained": len(retained)},
                  f, ensure_ascii=False, indent=2)

    # ---- 2. Logistic-regression churn model --------------------------------
    model_feats = ["ads_per_100", "dislikes_per_100", "likes_per_100",
                   "add_friend", "sessions"]
    X, y = df[model_feats].values, df["churned"].values
    pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
    auc = cross_val_score(pipe, X, y, cv=5, scoring="roc_auc")
    pipe.fit(X, y)
    coefs = pipe.named_steps["logisticregression"].coef_[0]
    odds = np.exp(coefs)  # odds ratio per 1 SD increase
    model_rows = sorted(
        [{"feature": fn, "coef": round(float(c), 3), "odds_ratio": round(float(o), 2)}
         for fn, c, o in zip(model_feats, coefs, odds)],
        key=lambda r: abs(r["coef"]), reverse=True)

    model_out = {
        "cv_auc_mean": round(float(auc.mean()), 3),
        "cv_auc_std": round(float(auc.std()), 3),
        "n_users": int(len(df)),
        "features": model_rows,
        "note": "Odds ratio = multiplicative change in churn odds per +1 SD. "
                "n=225, so treat as directional, not production-grade.",
    }
    with open(os.path.join(OUT, "churn_model.json"), "w", encoding="utf-8") as f:
        json.dump(model_out, f, ensure_ascii=False, indent=2)

    # ---- console summary ---------------------------------------------------
    print("Churn case study")
    print(f"  churned={len(churned)}  retained={len(retained)}  "
          f"rate={100*len(churned)/len(df):.1f}%")
    print(f"  CV ROC-AUC = {auc.mean():.3f} ± {auc.std():.3f}")
    print("  Significant feature gaps (p<0.05):")
    for r in stats_rows:
        if r["significant_05"]:
            print(f"    {r['feature']:<18} churned {r['churned_mean']:<7} vs "
                  f"retained {r['retained_mean']:<7} (lift {r['lift_pct']:+.0f}%, p={r['p_value']})")
    print(f"  paid vs free churn: {paid_test['paid_churn_rate']}% vs "
          f"{paid_test['free_churn_rate']}% (p={paid_test['p_value']})")


if __name__ == "__main__":
    main()
