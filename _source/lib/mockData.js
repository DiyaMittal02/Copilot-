// lib/mockData.js — PocketFM-flavored realistic mock data

export const kpiData = {
  dau: { value: 2847500, change: 4.2, unit: "users", trend: "up" },
  mau: { value: 18320000, change: 7.8, unit: "users", trend: "up" },
  avgListenTime: { value: 43.7, change: -2.1, unit: "min/day", trend: "down" },
  d1Retention: { value: 48.3, change: 1.4, unit: "%", trend: "up" },
  d7Retention: { value: 26.1, change: -0.8, unit: "%", trend: "down" },
  d30Retention: { value: 14.2, change: 0.3, unit: "%", trend: "up" },
  premiumConversion: { value: 7.4, change: 0.9, unit: "%", trend: "up" },
  churnRate: { value: 3.2, change: -0.4, unit: "%/month", trend: "up" },
  arpu: { value: 84.5, change: 5.1, unit: "₹/month", trend: "up" },
  episodeCompletionRate: { value: 61.8, change: 2.3, unit: "%", trend: "up" },
};

export const dauTrend = [
  { date: "Jan 1", dau: 2100000, mau: 15200000 },
  { date: "Jan 8", dau: 2180000, mau: 15400000 },
  { date: "Jan 15", dau: 2240000, mau: 15700000 },
  { date: "Jan 22", dau: 2190000, mau: 15900000 },
  { date: "Feb 1", dau: 2310000, mau: 16100000 },
  { date: "Feb 8", dau: 2380000, mau: 16400000 },
  { date: "Feb 15", dau: 2420000, mau: 16600000 },
  { date: "Feb 22", dau: 2460000, mau: 16900000 },
  { date: "Mar 1", dau: 2510000, mau: 17100000 },
  { date: "Mar 8", dau: 2490000, mau: 17300000 },
  { date: "Mar 15", dau: 2540000, mau: 17500000 },
  { date: "Mar 22", dau: 2590000, mau: 17700000 },
  { date: "Apr 1", dau: 2650000, mau: 17900000 },
  { date: "Apr 8", dau: 2680000, mau: 18000000 },
  { date: "Apr 15", dau: 2710000, mau: 18100000 },
  { date: "Apr 22", dau: 2760000, mau: 18200000 },
  { date: "May 1", dau: 2790000, mau: 18250000 },
  { date: "May 8", dau: 2820000, mau: 18290000 },
  { date: "May 15", dau: 2810000, mau: 18300000 },
  { date: "May 22", dau: 2847500, mau: 18320000 },
];

export const genrePerformance = [
  { genre: "Romance Drama", listeners: 5820000, completionRate: 71, avgEpisodes: 8.4 },
  { genre: "Thriller", listeners: 4130000, completionRate: 68, avgEpisodes: 7.1 },
  { genre: "Mythology", listeners: 3790000, completionRate: 64, avgEpisodes: 6.8 },
  { genre: "Comedy", listeners: 2940000, completionRate: 55, avgEpisodes: 5.2 },
  { genre: "Horror", listeners: 2210000, completionRate: 62, avgEpisodes: 6.1 },
  { genre: "Self Help", listeners: 1870000, completionRate: 48, avgEpisodes: 4.3 },
  { genre: "News & Politics", listeners: 1340000, completionRate: 52, avgEpisodes: 3.9 },
  { genre: "Crime", listeners: 2680000, completionRate: 73, avgEpisodes: 9.2 },
];

export const retentionCohort = [
  { cohort: "Jan", d1: 51.2, d7: 27.4, d14: 19.1, d30: 14.8 },
  { cohort: "Feb", d1: 49.8, d7: 26.9, d14: 18.7, d30: 14.1 },
  { cohort: "Mar", d1: 48.1, d7: 25.8, d14: 17.9, d30: 13.6 },
  { cohort: "Apr", d1: 48.9, d7: 26.3, d14: 18.2, d30: 14.0 },
  { cohort: "May", d1: 48.3, d7: 26.1, d14: 18.0, d30: 14.2 },
];

export const conversionFunnel = [
  { stage: "App Install", users: 18320000, pct: 100 },
  { stage: "Onboarding Done", users: 14120000, pct: 77.1 },
  { stage: "First Listen (>5min)", users: 10840000, pct: 59.2 },
  { stage: "Day 7 Active", users: 4784760, pct: 26.1 },
  { stage: "Free → Premium", users: 1355680, pct: 7.4 },
  { stage: "Premium Retained 3mo", users: 812000, pct: 4.4 },
];

export const revenueData = [
  { month: "Jan", subscription: 8200000, ads: 1100000, creator: 320000 },
  { month: "Feb", subscription: 8700000, ads: 1050000, creator: 370000 },
  { month: "Mar", subscription: 9100000, ads: 1200000, creator: 410000 },
  { month: "Apr", subscription: 9600000, ads: 1180000, creator: 450000 },
  { month: "May", subscription: 10200000, ads: 1240000, creator: 490000 },
];

export const topShows = [
  { title: "Ishq Mein Marjawan (Audio)", genre: "Romance Drama", listeners: 1240000, rating: 4.7, episodes: 320 },
  { title: "Crime Patrol Stories", genre: "Crime", listeners: 980000, rating: 4.5, episodes: 215 },
  { title: "Mahabharata Retold", genre: "Mythology", listeners: 870000, rating: 4.8, episodes: 180 },
  { title: "Kahaani", genre: "Thriller", listeners: 760000, rating: 4.4, episodes: 95 },
  { title: "Raat Ka Safar", genre: "Horror", listeners: 640000, rating: 4.3, episodes: 88 },
];

export const anomalies = [
  { type: "warning", metric: "D7 Retention", message: "D7 retention dipped 0.8% — correlates with new onboarding flow A/B test rollout on Apr 15.", date: "May 12" },
  { type: "positive", metric: "Premium Conversion", message: "Conversion rate up 0.9% after introduction of 7-day free trial. Cohort analysis shows 68% trial-to-paid.", date: "May 18" },
  { type: "info", metric: "Avg. Listen Time", message: "Listen time slightly down on weekdays. Weekend DAU is 34% higher than weekday average.", date: "May 20" },
];
