-- Daily active users (DAU) and the DAU/MAU stickiness ratio.
WITH ev AS (
    SELECT userId, to_timestamp(ts/1000) AS t
    FROM read_json_auto('data/raw/mini_sparkify_event_data.json',
                        format='newline_delimited')
    WHERE userId IS NOT NULL AND userId <> ''
),
daily AS (
    SELECT date_trunc('day', t) AS d, count(DISTINCT userId) AS dau FROM ev GROUP BY 1
)
SELECT round(avg(dau), 1)                                        AS avg_dau,
       max(dau)                                                  AS peak_dau,
       (SELECT count(DISTINCT userId) FROM ev)                   AS mau_window,
       round(100.0 * avg(dau) /
             (SELECT count(DISTINCT userId) FROM ev), 1)         AS stickiness_pct
FROM daily;
