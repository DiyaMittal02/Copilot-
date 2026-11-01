-- Overall churn rate.
-- Churn = user reached the 'Cancellation Confirmation' page.
-- Run: duckdb -c ".read analysis/sql/01_churn_rate.sql"
WITH ev AS (
    SELECT * FROM read_json_auto('data/raw/mini_sparkify_event_data.json',
                                 format='newline_delimited')
    WHERE userId IS NOT NULL AND userId <> ''
),
labelled AS (
    SELECT userId,
           max(CASE WHEN page = 'Cancellation Confirmation' THEN 1 ELSE 0 END) AS churned
    FROM ev GROUP BY userId
)
SELECT count(*)                            AS users,
       sum(churned)                        AS churned_users,
       round(100.0 * avg(churned), 1)      AS churn_rate_pct
FROM labelled;
