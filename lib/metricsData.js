// lib/metricsData.js — the app's single data source.
// Everything here is computed by analysis/build_metrics.py + churn_analysis.py
// from the raw Sparkify event log. Regenerate with: npm run build:metrics
import kpis from '@/data/derived/kpis.json';
import dauTrend from '@/data/derived/dau_trend.json';
import mauTrend from '@/data/derived/mau_trend.json';
import churnCompare from '@/data/derived/churn_compare.json';
import churnDrivers from '@/data/derived/churn_drivers.json';
import churnStats from '@/data/derived/churn_stats.json';
import churnModel from '@/data/derived/churn_model.json';
import topArtists from '@/data/derived/top_artists.json';
import listeningByHour from '@/data/derived/listening_by_hour.json';
import funnel from '@/data/derived/funnel.json';
import weeklyRetention from '@/data/derived/weekly_retention.json';
import genderSplit from '@/data/derived/gender_split.json';

export {
  kpis, dauTrend, mauTrend, churnCompare, churnDrivers, churnStats,
  churnModel, topArtists, listeningByHour, funnel, weeklyRetention, genderSplit,
};

export const DATASET = {
  name: 'Sparkify public event log (mini sample)',
  users: kpis.total_users,
  events: kpis.total_plays,
  window: 'Oct–Dec 2018',
};

const avgWeeklyRetention = Math.round(
  weeklyRetention.reduce((s, w) => s + w.retention_pct, 0) / weeklyRetention.length
);

// Grounding context handed to the AI copilot — real numbers only.
export const kpiContext = {
  totalUsers: kpis.total_users,
  churnRatePct: kpis.churn_rate_pct,
  paidSharePct: kpis.paid_share_pct,
  avgDau: kpis.dau_avg,
  peakDau: kpis.dau_peak,
  totalPlays: kpis.total_plays,
  upgrades: kpis.upgrades,
  avgSongsPerUser: kpis.avg_songs_per_user,
  avgWeeklyRetentionPct: avgWeeklyRetention,
  dataset: DATASET.name,
  window: DATASET.window,
};

// KPI cards shown on the dashboard (all computed).
export const kpiCards = [
  { label: 'Total Users', value: kpis.total_users, unit: 'users', color: '#6366f1' },
  { label: 'Churn Rate', value: kpis.churn_rate_pct, unit: '%', color: '#ef4444' },
  { label: 'Paid Share', value: kpis.paid_share_pct, unit: '%', color: '#34d399' },
  { label: 'Avg DAU', value: kpis.dau_avg, unit: 'users/day', color: '#8b5cf6' },
  { label: 'Peak DAU', value: kpis.dau_peak, unit: 'users', color: '#06b6d4' },
  { label: 'Total Plays', value: kpis.total_plays, unit: 'songs', color: '#818cf8' },
  { label: 'Upgrades', value: kpis.upgrades, unit: 'users', color: '#f59e0b' },
  { label: 'Weekly Retention', value: avgWeeklyRetention, unit: '% avg', color: '#10b981' },
];
