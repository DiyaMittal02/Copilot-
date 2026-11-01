-- Acquisition / monetization funnel: registered -> played -> upgraded -> retained.
WITH ev AS (
    SELECT * FROM read_json_auto('data/raw/mini_sparkify_event_data.json',
                                 format='newline_delimited')
    WHERE userId IS NOT NULL AND userId <> ''
),
stages AS (
    SELECT 'Registered users'       AS stage, count(DISTINCT userId) AS users, 1 AS ord FROM ev
    UNION ALL SELECT 'Played a song',  count(DISTINCT userId), 2 FROM ev WHERE page='NextSong'
    UNION ALL SELECT 'Upgraded to paid', count(DISTINCT userId), 3 FROM ev WHERE page='Submit Upgrade'
    UNION ALL SELECT 'Retained (not churned)',
        count(DISTINCT userId), 4 FROM ev
        WHERE userId NOT IN (SELECT userId FROM ev WHERE page='Cancellation Confirmation')
)
SELECT stage, users,
       round(100.0 * users / first_value(users) OVER (ORDER BY ord), 1) AS pct_of_top
FROM stages ORDER BY ord;
