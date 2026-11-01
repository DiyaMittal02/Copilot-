"""
build_metrics.py — Cadence analytics pipeline.

Reads the raw Sparkify event log (newline-delimited JSON) and computes every
metric the dashboard shows, writing small aggregate JSON files to data/derived/.
Nothing in the app is hand-typed: this script is the single source of truth.

Reproduce:
    python -m pip install duckdb pandas
    python analysis/build_metrics.py            # uses default raw path

Design notes:
  - A "user" = a non-empty userId. Logged-out/guest rows (blank userId) are
    excluded from user-grain metrics but kept for traffic counts.
  - Churn = the user hit the 'Cancellation Confirmation' page (Sparkify's
    definitive account-deletion event).
  - All timestamps are interpreted in UTC for stable day/month bucketing.
"""
import os, json, sys
import duckdb

RAW = sys.argv[1] if len(sys.argv) > 1 else os.path.join("data", "raw", "mini_sparkify_event_data.json")
OUT = os.path.join("data", "derived")
os.makedirs(OUT, exist_ok=True)


def main():
    con = duckdb.connect()
    con.execute("SET TimeZone='UTC';")
    # Base views -------------------------------------------------------------
    con.execute(f"""
        CREATE VIEW raw AS
        SELECT *, to_timestamp(ts/1000) AS t
        FROM read_json_auto('{RAW.replace(chr(92), '/')}', format='newline_delimited');
    """)
    con.execute("CREATE VIEW ev AS SELECT * FROM raw WHERE userId IS NOT NULL AND userId <> '';")

    # Per-user churn label + behavioural features ----------------------------
    con.execute("""
        CREATE VIEW feats AS
        SELECT
            userId,
            max(CASE WHEN page='Cancellation Confirmation' THEN 1 ELSE 0 END)         AS churned,
            count(*) FILTER (WHERE page='NextSong')                                   AS songs,
            count(DISTINCT sessionId)                                                 AS sessions,
            count(*) FILTER (WHERE page='Thumbs Up')                                  AS thumbs_up,
            count(*) FILTER (WHERE page='Thumbs Down')                                AS thumbs_down,
            count(*) FILTER (WHERE page='Roll Advert')                                AS adverts,
            count(*) FILTER (WHERE page='Add Friend')                                 AS add_friend,
            count(*) FILTER (WHERE page='Add to Playlist')                            AS add_playlist,
            count(*) FILTER (WHERE page='Error')                                      AS errors,
            max(CASE WHEN level='paid' THEN 1 ELSE 0 END)                             AS ever_paid,
            (max(ts)-min(ts))/1000.0/86400                                            AS tenure_days,
            any_value(gender)                                                         AS gender
        FROM ev GROUP BY userId;
    """)

    derived = {}

    # 1. Headline KPIs -------------------------------------------------------
    kpi = con.execute("""
        SELECT
            (SELECT count(DISTINCT userId) FROM ev)                                   AS total_users,
            (SELECT round(avg(churned)*100,1) FROM feats)                             AS churn_rate_pct,
            (SELECT count(DISTINCT userId) FILTER (WHERE ever_paid=1) FROM feats)     AS paid_users,
            (SELECT round(avg(songs),0) FROM feats)                                   AS avg_songs_per_user,
            (SELECT count(*) FROM ev WHERE page='NextSong')                           AS total_plays,
            (SELECT count(DISTINCT userId) FROM ev WHERE page='Submit Upgrade')       AS upgrades,
            (SELECT count(DISTINCT userId) FROM ev WHERE page='Submit Downgrade')     AS downgrades,
    """ + """
            (SELECT round(avg(d),0) FROM (SELECT count(DISTINCT userId) d FROM ev
                GROUP BY date_trunc('day', t)))                                       AS dau_avg,
            (SELECT max(d) FROM (SELECT count(DISTINCT userId) d FROM ev
                GROUP BY date_trunc('day', t)))                                       AS dau_peak
    """).fetchdf().iloc[0].to_dict()
    kpi = {k: (int(v) if float(v).is_integer() else float(v)) for k, v in kpi.items()}
    kpi["paid_share_pct"] = round(100 * kpi["paid_users"] / kpi["total_users"], 1)
    derived["kpis"] = kpi

    # 2. DAU trend (daily) ---------------------------------------------------
    derived["dau_trend"] = con.execute("""
        SELECT strftime(date_trunc('day', t), '%Y-%m-%d') AS date,
               count(DISTINCT userId) AS dau
        FROM ev GROUP BY 1 ORDER BY 1;
    """).fetchdf().to_dict("records")

    # 3. MAU by month --------------------------------------------------------
    derived["mau_trend"] = con.execute("""
        SELECT strftime(date_trunc('month', t), '%Y-%m') AS month,
               count(DISTINCT userId) AS mau
        FROM ev GROUP BY 1 ORDER BY 1;
    """).fetchdf().to_dict("records")

    # 4. Churn comparison: churned vs retained means -------------------------
    derived["churn_compare"] = con.execute("""
        SELECT CASE churned WHEN 1 THEN 'Churned' ELSE 'Retained' END AS segment,
               count(*) AS users,
               round(avg(songs),0)        AS avg_songs,
               round(avg(sessions),1)     AS avg_sessions,
               round(avg(thumbs_up),1)    AS avg_thumbs_up,
               round(avg(thumbs_down),1)  AS avg_thumbs_down,
               round(avg(add_friend),1)   AS avg_add_friend,
               round(100.0*sum(thumbs_down)/nullif(sum(songs),0),2) AS dislikes_per_100,
               round(100.0*sum(adverts)/nullif(sum(songs),0),2)     AS ads_per_100,
               round(avg(tenure_days),1)  AS avg_tenure_days
        FROM feats GROUP BY churned ORDER BY churned;
    """).fetchdf().to_dict("records")

    # 5. Churn drivers: lift of each normalized signal (churned / retained) --
    derived["churn_drivers"] = con.execute("""
        WITH g AS (
          SELECT churned,
                 100.0*sum(adverts)/nullif(sum(songs),0)      AS ads_per_100,
                 100.0*sum(thumbs_down)/nullif(sum(songs),0)  AS dislikes_per_100,
                 avg(add_friend)                              AS add_friend,
                 avg(thumbs_up)                               AS thumbs_up,
                 avg(sessions)                                AS sessions
          FROM feats GROUP BY churned)
        SELECT metric, round(churned_v,2) AS churned, round(retained_v,2) AS retained,
               round((churned_v/nullif(retained_v,0)-1)*100,0) AS lift_pct
        FROM (
          SELECT 'Ads per 100 songs' metric,
                 max(CASE WHEN churned=1 THEN ads_per_100 END) churned_v,
                 max(CASE WHEN churned=0 THEN ads_per_100 END) retained_v FROM g
          UNION ALL SELECT 'Dislikes per 100 songs',
                 max(CASE WHEN churned=1 THEN dislikes_per_100 END),
                 max(CASE WHEN churned=0 THEN dislikes_per_100 END) FROM g
          UNION ALL SELECT 'Add-Friend actions',
                 max(CASE WHEN churned=1 THEN add_friend END),
                 max(CASE WHEN churned=0 THEN add_friend END) FROM g
          UNION ALL SELECT 'Thumbs-Up actions',
                 max(CASE WHEN churned=1 THEN thumbs_up END),
                 max(CASE WHEN churned=0 THEN thumbs_up END) FROM g
          UNION ALL SELECT 'Sessions',
                 max(CASE WHEN churned=1 THEN sessions END),
                 max(CASE WHEN churned=0 THEN sessions END) FROM g
        ) ORDER BY abs(lift_pct) DESC;
    """).fetchdf().to_dict("records")

    # 6. Top artists (content performance) -----------------------------------
    derived["top_artists"] = con.execute("""
        SELECT artist, count(*) AS plays, count(DISTINCT userId) AS listeners
        FROM ev WHERE page='NextSong' AND artist IS NOT NULL
        GROUP BY artist ORDER BY plays DESC LIMIT 10;
    """).fetchdf().to_dict("records")

    # 7. Listening by hour-of-day --------------------------------------------
    derived["listening_by_hour"] = con.execute("""
        SELECT extract('hour' FROM t) AS hour, count(*) AS plays
        FROM ev WHERE page='NextSong' GROUP BY 1 ORDER BY 1;
    """).fetchdf().to_dict("records")

    # 8. Acquisition funnel --------------------------------------------------
    funnel = con.execute("""
        SELECT 'Registered users' stage, count(DISTINCT userId) users, 1 ord FROM ev
        UNION ALL SELECT 'Played a song', count(DISTINCT userId), 2 FROM ev WHERE page='NextSong'
        UNION ALL SELECT 'Upgraded to paid', count(DISTINCT userId), 3 FROM ev WHERE page='Submit Upgrade'
        UNION ALL SELECT 'Retained (not churned)', count(DISTINCT userId), 4
            FROM feats WHERE churned=0
        ORDER BY ord;
    """).fetchdf()
    top = funnel["users"].iloc[0]
    funnel["pct"] = (100 * funnel["users"] / top).round(1)
    derived["funnel"] = funnel.drop(columns="ord").to_dict("records")

    # 9. Weekly active retention (W -> W+1) ----------------------------------
    derived["weekly_retention"] = con.execute("""
        WITH ua AS (
          SELECT DISTINCT userId, date_trunc('week', t) AS wk FROM ev
        ), nxt AS (
          SELECT a.wk, count(DISTINCT a.userId) active,
                 count(DISTINCT b.userId) retained
          FROM ua a LEFT JOIN ua b
            ON a.userId=b.userId AND b.wk = a.wk + INTERVAL 7 DAY
          GROUP BY a.wk)
        -- drop trailing weeks whose "next week" falls outside the observed
        -- window (otherwise W->W+1 retention is spuriously low)
        SELECT strftime(wk,'%Y-%m-%d') AS week_start, active,
               round(100.0*retained/nullif(active,0),1) AS retention_pct
        FROM nxt
        WHERE wk < date_trunc('week', (SELECT max(t) FROM ev)) - INTERVAL 7 DAY
        ORDER BY wk;
    """).fetchdf().to_dict("records")

    # 10. Demographics -------------------------------------------------------
    derived["gender_split"] = con.execute("""
        SELECT gender, count(*) users,
               round(avg(churned)*100,1) churn_rate_pct
        FROM feats WHERE gender IS NOT NULL GROUP BY gender ORDER BY gender;
    """).fetchdf().to_dict("records")

    # Compact Parquet for the app's live text-to-SQL feature ----------------
    # (the raw 128MB JSON is gitignored; this slim, committed file lets the
    #  query copilot work on a fresh clone)
    con.execute(f"""
        COPY (
            SELECT userId, ts, to_timestamp(ts/1000) AS event_time, sessionId,
                   page, level, artist, song, length, gender, location,
                   itemInSession
            FROM ev
        ) TO '{os.path.join(OUT, "events.parquet").replace(chr(92), "/")}'
        (FORMAT parquet, COMPRESSION zstd);
    """)

    # Write ------------------------------------------------------------------
    for name, data in derived.items():
        with open(os.path.join(OUT, f"{name}.json"), "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    with open(os.path.join(OUT, "metrics.json"), "w", encoding="utf-8") as f:
        json.dump(derived, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(derived)} aggregates to {OUT}/")
    print(f"  total_users={kpi['total_users']}  churn_rate={kpi['churn_rate_pct']}%  "
          f"dau_avg={kpi['dau_avg']}  upgrades={kpi['upgrades']}")


if __name__ == "__main__":
    main()
