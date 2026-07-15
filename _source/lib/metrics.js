// lib/metrics.js — 50+ product metric definitions for audio streaming

export const metricCategories = ["All", "Engagement", "Retention", "Monetization", "Acquisition", "Content", "Technical"];

export const metrics = [
  // ENGAGEMENT
  {
    id: "dau",
    name: "Daily Active Users (DAU)",
    category: "Engagement",
    definition: "The count of unique users who open and use the app on a given day.",
    formula: "COUNT(DISTINCT user_id) WHERE session_date = TODAY()",
    benchmark: "DAU/MAU ratio of 15-25% is healthy for streaming apps.",
    whenToTrack: "Daily. Core north-star for engagement health.",
    relatedMetrics: ["MAU", "DAU/MAU Ratio", "Session Count"],
    pocketfmTip: "Segment by new vs. returning users to understand if growth is driven by acquisition or retention."
  },
  {
    id: "mau",
    name: "Monthly Active Users (MAU)",
    category: "Engagement",
    definition: "Count of unique users who engage with the app at least once in a 30-day rolling window.",
    formula: "COUNT(DISTINCT user_id) WHERE session_date >= DATE_SUB(TODAY(), 30)",
    benchmark: "Healthy streaming MAU growth is 5-10% MoM.",
    whenToTrack: "Monthly for exec reporting; daily as rolling 30-day.",
    relatedMetrics: ["DAU", "DAU/MAU Ratio", "Stickiness"],
    pocketfmTip: "Compare MAU growth to install growth to detect if activation is keeping pace."
  },
  {
    id: "dau_mau",
    name: "DAU/MAU Ratio (Stickiness)",
    category: "Engagement",
    definition: "The ratio of daily to monthly active users, indicating how sticky the product is.",
    formula: "DAU / MAU × 100",
    benchmark: "20-25% is good; Spotify is ~25%, podcast apps average ~18%.",
    whenToTrack: "Weekly. Key stickiness signal.",
    relatedMetrics: ["DAU", "MAU"],
    pocketfmTip: "A declining DAU/MAU ratio even while MAU grows signals re-engagement problems."
  },
  {
    id: "avg_listen_time",
    name: "Average Daily Listen Time",
    category: "Engagement",
    definition: "Average total audio consumed per active user per day.",
    formula: "SUM(listen_duration) / COUNT(DISTINCT active_user_id)",
    benchmark: "Spotify: ~30min/day. Podcast-first apps: 45-60min/day.",
    whenToTrack: "Daily. Core consumption metric.",
    relatedMetrics: ["Session Duration", "Episode Completion Rate"],
    pocketfmTip: "Break down by genre — romance drama typically drives 2x listen time vs. news."
  },
  {
    id: "session_frequency",
    name: "Session Frequency",
    category: "Engagement",
    definition: "Average number of sessions per active user per week.",
    formula: "COUNT(sessions) / COUNT(DISTINCT active_user_id) over 7 days",
    benchmark: "3-5 sessions/week for narrative audio apps.",
    whenToTrack: "Weekly. Tracks habit formation.",
    relatedMetrics: ["DAU", "Avg. Listen Time"],
    pocketfmTip: "Power users (top 20%) often drive 60%+ of total listen time. Track their session frequency separately."
  },
  {
    id: "episode_completion",
    name: "Episode Completion Rate",
    category: "Content",
    definition: "Percentage of started episodes that are listened to at least 80% through.",
    formula: "COUNT(episodes with >80% listened) / COUNT(episodes started) × 100",
    benchmark: "55-65% is typical; >70% indicates highly compelling content.",
    whenToTrack: "Weekly, per show and genre.",
    relatedMetrics: ["Avg. Listen Time", "Show Rating", "Series Finish Rate"],
    pocketfmTip: "Low completion on Episode 1 of a series kills discovery. Audit top-of-funnel shows."
  },
  {
    id: "series_finish_rate",
    name: "Series Finish Rate",
    category: "Content",
    definition: "% of users who started a series and completed all available episodes.",
    formula: "COUNT(users who hit last episode) / COUNT(users who played episode 1) × 100",
    benchmark: "20-35% for long-form audio series.",
    whenToTrack: "Per series launch and ongoing.",
    relatedMetrics: ["Episode Completion Rate", "Binge Rate"],
    pocketfmTip: "High series finish rate strongly correlates with subscription upgrades."
  },
  // RETENTION
  {
    id: "d1_retention",
    name: "Day 1 Retention",
    category: "Retention",
    definition: "% of new users who return and use the app the day after install.",
    formula: "COUNT(users active on Day 1) / COUNT(installs on Day 0) × 100",
    benchmark: "40-50% is good; below 30% signals onboarding problems.",
    whenToTrack: "Daily per cohort.",
    relatedMetrics: ["D7 Retention", "Onboarding Completion Rate"],
    pocketfmTip: "If D1 drops after an onboarding change, roll back immediately. It's your most sensitive signal."
  },
  {
    id: "d7_retention",
    name: "Day 7 Retention",
    category: "Retention",
    definition: "% of new users still active 7 days after install.",
    formula: "COUNT(users active on Day 7) / COUNT(installs on Day 0) × 100",
    benchmark: "20-30% for audio apps. Spotify benchmarks ~35%.",
    whenToTrack: "Weekly per install cohort.",
    relatedMetrics: ["D1 Retention", "D30 Retention", "Habit Moment"],
    pocketfmTip: "Users who subscribe to a show by Day 3 have 3x D7 retention. Track 'show subscribe' as a habit moment."
  },
  {
    id: "d30_retention",
    name: "Day 30 Retention",
    category: "Retention",
    definition: "% of users still active 30 days after first use.",
    formula: "COUNT(users active on Day 30) / COUNT(users active on Day 0) × 100",
    benchmark: "10-18% for streaming apps; >15% is considered strong.",
    whenToTrack: "Monthly per cohort.",
    relatedMetrics: ["D7 Retention", "Churn Rate", "LTV"],
    pocketfmTip: "D30 retention is the best predictor of long-term LTV. Optimize for it over DAU."
  },
  {
    id: "churn_rate",
    name: "Monthly Churn Rate",
    category: "Retention",
    definition: "% of active users (or subscribers) who stop using the product in a given month.",
    formula: "Users Lost in Month / Users at Start of Month × 100",
    benchmark: "2-4% monthly churn for subscription streaming is healthy.",
    whenToTrack: "Monthly. Critical for revenue forecasting.",
    relatedMetrics: ["D30 Retention", "LTV", "Win-Back Rate"],
    pocketfmTip: "Segment churn by subscription tenure — users who churn in Month 1 vs. Month 6+ need different interventions."
  },
  {
    id: "reactivation_rate",
    name: "Reactivation Rate",
    category: "Retention",
    definition: "% of lapsed users who return to the app after 30+ days of inactivity.",
    formula: "COUNT(lapsed users active this month) / COUNT(total lapsed users) × 100",
    benchmark: "5-10% monthly reactivation is achievable with push/email campaigns.",
    whenToTrack: "Monthly.",
    relatedMetrics: ["Churn Rate", "Win-Back Rate"],
    pocketfmTip: "'New content in your favorite series' push notifications are most effective for reactivation."
  },
  // MONETIZATION
  {
    id: "premium_conversion",
    name: "Free-to-Premium Conversion Rate",
    category: "Monetization",
    definition: "% of free users who upgrade to a paid subscription.",
    formula: "COUNT(new premium users) / COUNT(active free users) × 100",
    benchmark: "5-10% is typical for freemium audio. Spotify is ~8%.",
    whenToTrack: "Monthly and per acquisition channel.",
    relatedMetrics: ["ARPU", "LTV", "Trial Conversion Rate"],
    pocketfmTip: "Users who complete a full series on free are 4x more likely to convert. Surface 'series finale locked' paywall."
  },
  {
    id: "arpu",
    name: "Average Revenue Per User (ARPU)",
    category: "Monetization",
    definition: "Total revenue divided by total active users in a period.",
    formula: "Total Revenue / MAU",
    benchmark: "₹60-100/month for Indian audio streaming apps.",
    whenToTrack: "Monthly.",
    relatedMetrics: ["ARPPU", "LTV", "Premium Conversion"],
    pocketfmTip: "Track ARPU separately for premium subscribers (ARPPU) vs. ad-supported users."
  },
  {
    id: "ltv",
    name: "Customer Lifetime Value (LTV)",
    category: "Monetization",
    definition: "Total revenue expected from a user over their entire relationship with the product.",
    formula: "ARPU × (1 / Churn Rate)",
    benchmark: "LTV should be 3x+ your CAC for sustainable growth.",
    whenToTrack: "Quarterly. Input for UA budget decisions.",
    relatedMetrics: ["ARPU", "Churn Rate", "CAC"],
    pocketfmTip: "High-genre affinity users (e.g., romance drama loyalists) have 2-3x higher LTV."
  },
  {
    id: "ltv_cac",
    name: "LTV:CAC Ratio",
    category: "Monetization",
    definition: "Ratio of customer lifetime value to customer acquisition cost. Measures ROI of growth spend.",
    formula: "LTV / CAC",
    benchmark: ">3 is healthy; >5 means you're underinvesting in growth.",
    whenToTrack: "Monthly per acquisition channel.",
    relatedMetrics: ["LTV", "CAC", "Payback Period"],
    pocketfmTip: "Organic (referral + ASO) users typically have 5-8x LTV:CAC vs. paid UA."
  },
  {
    id: "arppu",
    name: "Average Revenue Per Paying User (ARPPU)",
    category: "Monetization",
    definition: "Total subscription revenue divided by number of paying subscribers.",
    formula: "Subscription Revenue / COUNT(paying subscribers)",
    benchmark: "₹150-300/month for Indian premium audio subscriptions.",
    whenToTrack: "Monthly.",
    relatedMetrics: ["ARPU", "LTV"],
    pocketfmTip: "ARPPU increases with annual plan adoption. Track monthly vs. annual plan mix."
  },
  // ACQUISITION
  {
    id: "cac",
    name: "Customer Acquisition Cost (CAC)",
    category: "Acquisition",
    definition: "Total marketing + sales spend divided by number of new paying customers acquired.",
    formula: "Total UA Spend / New Premium Subscribers",
    benchmark: "₹200-600 for Indian mobile app paid UA.",
    whenToTrack: "Monthly per channel.",
    relatedMetrics: ["LTV", "LTV:CAC", "Install Rate"],
    pocketfmTip: "Track blended CAC vs. paid CAC. Referral programs can halve your blended CAC."
  },
  {
    id: "install_to_register",
    name: "Install-to-Register Rate",
    category: "Acquisition",
    definition: "% of app installs that complete account registration.",
    formula: "COUNT(registered users) / COUNT(installs) × 100",
    benchmark: "60-75% is typical. Below 50% signals onboarding friction.",
    whenToTrack: "Daily per traffic source.",
    relatedMetrics: ["D1 Retention", "Onboarding Completion"],
    pocketfmTip: "Social login (Google/Facebook) significantly improves install-to-register rate."
  },
  {
    id: "organic_ratio",
    name: "Organic Install Ratio",
    category: "Acquisition",
    definition: "% of new installs coming from organic sources (ASO, word-of-mouth, referral).",
    formula: "Organic Installs / Total Installs × 100",
    benchmark: ">40% organic is a sign of strong product-market fit.",
    whenToTrack: "Monthly.",
    relatedMetrics: ["CAC", "Referral Rate", "ASO Rank"],
    pocketfmTip: "Track App Store keyword rankings for 'audio stories', 'Hindi podcast', 'audio drama'."
  },
  {
    id: "referral_rate",
    name: "Referral Rate",
    category: "Acquisition",
    definition: "% of new users acquired through referral/invite from existing users.",
    formula: "Referred New Users / Total New Users × 100",
    benchmark: "5-15% referral rate for social/audio products.",
    whenToTrack: "Monthly.",
    relatedMetrics: ["CAC", "Viral Coefficient", "Organic Ratio"],
    pocketfmTip: "Referred users have 30% higher D30 retention on average. Double down on referral programs."
  },
  // CONTENT
  {
    id: "content_diversity_index",
    name: "Content Diversity Index",
    category: "Content",
    definition: "Measures how broadly users consume across genres, as opposed to being stuck in one genre.",
    formula: "1 - Σ(genre_share²) per user, averaged across users (Herfindahl Index inverse)",
    benchmark: "Higher index = healthier library engagement. Monitor for concentration risk.",
    whenToTrack: "Monthly.",
    relatedMetrics: ["Genre Penetration", "Discovery Rate"],
    pocketfmTip: "Users who consume 3+ genres have 2x retention vs. single-genre users."
  },
  {
    id: "discovery_rate",
    name: "Content Discovery Rate",
    category: "Content",
    definition: "% of content consumed that comes from algorithmic recommendations vs. search/browse.",
    formula: "Plays from Recommendation / Total Plays × 100",
    benchmark: "Netflix: ~80% from recommendations. Audio apps target 50-60%.",
    whenToTrack: "Weekly.",
    relatedMetrics: ["Episode Completion Rate", "CTR on Recommendations"],
    pocketfmTip: "Personalization quality directly impacts listen time. A/B test recommendation algorithms aggressively."
  },
  {
    id: "creator_retention",
    name: "Creator Retention Rate",
    category: "Content",
    definition: "% of active content creators still uploading content month-over-month.",
    formula: "Creators uploading this month / Creators who uploaded last month × 100",
    benchmark: ">70% monthly creator retention ensures library growth.",
    whenToTrack: "Monthly.",
    relatedMetrics: ["Content Volume Growth", "Creator Monetization"],
    pocketfmTip: "Creators who earn >₹5000/month from the platform have 90%+ retention."
  },
  // TECHNICAL
  {
    id: "crash_rate",
    name: "App Crash Rate",
    category: "Technical",
    definition: "% of sessions that end due to an app crash.",
    formula: "Crash Sessions / Total Sessions × 100",
    benchmark: "<1% crash rate. >2% causes significant churn.",
    whenToTrack: "Daily. Spike alerts should be automated.",
    relatedMetrics: ["ANR Rate", "D1 Retention"],
    pocketfmTip: "Crashes on the player screen are highest severity — they break the core loop."
  },
  {
    id: "load_time",
    name: "Player Load Time (P95)",
    category: "Technical",
    definition: "95th percentile time from 'play' tap to first audio byte delivered.",
    formula: "P95(audio_start_time - play_tap_time) in milliseconds",
    benchmark: "<1.5 seconds P95. >3s causes 15%+ drop-off.",
    whenToTrack: "Daily. Regression alerts on deploys.",
    relatedMetrics: ["Crash Rate", "Avg. Listen Time"],
    pocketfmTip: "Pre-buffering the next episode while current is playing is the highest-impact listen time lever."
  },
  {
    id: "buffering_rate",
    name: "Buffering/Rebuffering Rate",
    category: "Technical",
    definition: "% of listening sessions that experience mid-playback buffering interruptions.",
    formula: "Sessions with buffering > 2s / Total Sessions × 100",
    benchmark: "<5% buffering rate across network conditions.",
    whenToTrack: "Daily, segmented by network type (2G/3G/4G/WiFi).",
    relatedMetrics: ["Player Load Time", "Avg. Listen Time"],
    pocketfmTip: "Adaptive bitrate streaming can reduce buffering by 40% on 2G/3G connections."
  },
];
