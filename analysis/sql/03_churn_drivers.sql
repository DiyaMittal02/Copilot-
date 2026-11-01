-- Behavioural comparison of churned vs retained users.
-- Lead with time-normalized RATES (per 100 songs) so the comparison is not
-- biased by churned users simply having shorter observation windows.
WITH ev AS (
    SELECT * FROM read_json_auto('data/raw/mini_sparkify_event_data.json',
                                 format='newline_delimited')
    WHERE userId IS NOT NULL AND userId <> ''
),
feats AS (
    SELECT userId,
           max(CASE WHEN page='Cancellation Confirmation' THEN 1 ELSE 0 END) AS churned,
           count(*) FILTER (WHERE page='NextSong')    AS songs,
           count(*) FILTER (WHERE page='Roll Advert') AS adverts,
           count(*) FILTER (WHERE page='Thumbs Down') AS dislikes,
           count(*) FILTER (WHERE page='Thumbs Up')   AS likes,
           count(*) FILTER (WHERE page='Add Friend')  AS add_friend,
           count(DISTINCT sessionId)                  AS sessions
    FROM ev GROUP BY userId
)
SELECT CASE churned WHEN 1 THEN 'Churned' ELSE 'Retained' END AS segment,
       count(*)                                               AS users,
       round(avg(100.0*adverts /nullif(songs,0)), 2)         AS ads_per_100_songs,
       round(avg(100.0*dislikes/nullif(songs,0)), 2)         AS dislikes_per_100_songs,
       round(avg(add_friend), 1)                             AS avg_add_friend,
       round(avg(likes), 1)                                  AS avg_thumbs_up,
       round(avg(sessions), 1)                               AS avg_sessions
FROM feats GROUP BY churned ORDER BY churned;
