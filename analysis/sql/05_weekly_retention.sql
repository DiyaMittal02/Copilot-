-- Week-over-week active retention: of users active in week W, what share are
-- active again in week W+1. Trailing weeks whose "next week" is outside the
-- data window are dropped so retention is not spuriously low.
WITH ev AS (
    SELECT userId, to_timestamp(ts/1000) AS t
    FROM read_json_auto('data/raw/mini_sparkify_event_data.json',
                        format='newline_delimited')
    WHERE userId IS NOT NULL AND userId <> ''
),
ua AS (SELECT DISTINCT userId, date_trunc('week', t) AS wk FROM ev)
SELECT strftime(a.wk, '%Y-%m-%d')                                  AS week_start,
       count(DISTINCT a.userId)                                    AS active,
       round(100.0 * count(DISTINCT b.userId)
                   / nullif(count(DISTINCT a.userId), 0), 1)       AS retention_pct
FROM ua a
LEFT JOIN ua b ON a.userId = b.userId AND b.wk = a.wk + INTERVAL 7 DAY
WHERE a.wk < date_trunc('week', (SELECT max(t) FROM ev)) - INTERVAL 7 DAY
GROUP BY a.wk ORDER BY a.wk;
