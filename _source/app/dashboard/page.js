'use client';
import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import KPICard from '@/components/KPICard';
import InsightBadge from '@/components/InsightBadge';
import {
  kpiData, dauTrend, genrePerformance, retentionCohort,
  conversionFunnel, revenueData, topShows, anomalies
} from '@/lib/mockData';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d1526', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 12, color: p.color, fontWeight: 600 }}>
          {p.name}: {typeof p.value === 'number' && p.value > 10000
            ? (p.value / 1000000).toFixed(2) + 'M'
            : p.value}
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [activeRetentionView, setActiveRetentionView] = useState('chart');

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar pathname="/dashboard" />
        <main className="page-body">
          {/* KPI Cards */}
          <div style={{ marginBottom: 20 }}>
            <div className="section-header">
              <div>
                <div className="section-title">Key Performance Indicators</div>
                <div className="section-subtitle">Live metrics · Updated daily · PocketFM Audio Platform</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '4px 10px', borderRadius: 20 }}>
                📅 Week ending Jun 20, 2026
              </span>
            </div>
            <div className="kpi-grid">
              <KPICard label="Daily Active Users" value={kpiData.dau.value} change={kpiData.dau.change} unit="users" trend={kpiData.dau.trend} color="#6366f1" />
              <KPICard label="Monthly Active Users" value={kpiData.mau.value} change={kpiData.mau.change} unit="users" trend={kpiData.mau.trend} color="#8b5cf6" />
              <KPICard label="Avg. Listen Time" value={kpiData.avgListenTime.value} change={kpiData.avgListenTime.change} unit="min/day" trend={kpiData.avgListenTime.trend} color="#06b6d4" />
              <KPICard label="D1 Retention" value={kpiData.d1Retention.value} change={kpiData.d1Retention.change} unit="%" trend={kpiData.d1Retention.trend} color="#10b981" />
              <KPICard label="D7 Retention" value={kpiData.d7Retention.value} change={kpiData.d7Retention.change} unit="%" trend={kpiData.d7Retention.trend} color="#818cf8" />
              <KPICard label="D30 Retention" value={kpiData.d30Retention.value} change={kpiData.d30Retention.change} unit="%" trend={kpiData.d30Retention.trend} color="#a78bfa" />
              <KPICard label="Premium Conversion" value={kpiData.premiumConversion.value} change={kpiData.premiumConversion.change} unit="%" trend={kpiData.premiumConversion.trend} color="#f59e0b" />
              <KPICard label="Churn Rate" value={kpiData.churnRate.value} change={kpiData.churnRate.change} unit="%/month" trend={kpiData.churnRate.trend} color="#ef4444" />
              <KPICard label="ARPU" value={`₹${kpiData.arpu.value}`} change={kpiData.arpu.change} unit="₹/month" trend={kpiData.arpu.trend} color="#34d399" />
              <KPICard label="Episode Completion" value={kpiData.episodeCompletionRate.value} change={kpiData.episodeCompletionRate.change} unit="%" trend={kpiData.episodeCompletionRate.trend} color="#ec4899" />
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="chart-grid" style={{ marginBottom: 20 }}>
            {/* DAU/MAU Trend */}
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">DAU & MAU Trend</div>
                  <div className="chart-subtitle">Jan – May 2026 · Weekly data</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dauTrend}>
                  <defs>
                    <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="mauGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} tickFormatter={v => (v/1000000).toFixed(1)+'M'} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  <Area type="monotone" dataKey="dau" name="DAU" stroke="#6366f1" fill="url(#dauGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="mau" name="MAU" stroke="#8b5cf6" fill="url(#mauGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Genre Performance */}
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Genre Performance</div>
                  <div className="chart-subtitle">Listeners by content category</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={genrePerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#475569' }} tickFormatter={v => (v/1000000).toFixed(1)+'M'} />
                  <YAxis type="category" dataKey="genre" tick={{ fontSize: 10, fill: '#94a3b8' }} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="listeners" name="Listeners" fill="#6366f1" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="chart-grid" style={{ marginBottom: 20 }}>
            {/* Revenue */}
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Revenue Breakdown</div>
                  <div className="chart-subtitle">Subscription · Ads · Creator economy (₹)</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} tickFormatter={v => '₹'+(v/1000000).toFixed(1)+'M'} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  <Bar dataKey="subscription" name="Subscription" fill="#6366f1" stackId="a" />
                  <Bar dataKey="ads" name="Ads" fill="#06b6d4" stackId="a" />
                  <Bar dataKey="creator" name="Creator" fill="#10b981" stackId="a" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Retention Cohort */}
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Retention Cohorts</div>
                  <div className="chart-subtitle">D1, D7, D14, D30 by install month</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={retentionCohort}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="cohort" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} unit="%" domain={[0, 60]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  <Line type="monotone" dataKey="d1" name="D1" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="d7" name="D7" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="d14" name="D14" stroke="#06b6d4" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="d30" name="D30" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Funnel + Insights Row */}
          <div className="chart-grid">
            {/* Conversion Funnel */}
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Conversion Funnel</div>
                  <div className="chart-subtitle">Install → Premium subscriber</div>
                </div>
              </div>
              <div style={{ padding: '8px 0' }}>
                {conversionFunnel.map((step, i) => (
                  <div key={i} className="funnel-bar">
                    <div className="funnel-label">{step.stage}</div>
                    <div className="funnel-track">
                      <div className="funnel-fill" style={{ width: `${step.pct}%` }}>
                        <span className="funnel-value">{(step.users/1000000).toFixed(1)}M · {step.pct}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Anomaly Feed */}
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">AI Anomaly Feed</div>
                  <div className="chart-subtitle">Auto-detected signals & insights</div>
                </div>
              </div>
              {anomalies.map((a, i) => (
                <InsightBadge key={i} type={a.type} metric={a.metric} message={a.message} date={a.date} />
              ))}

              {/* Top Shows */}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>🎵 Top Shows This Week</div>
                {topShows.slice(0, 3).map((show, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: `hsl(${i * 60 + 220},60%,50%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0
                    }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{show.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(show.listeners/1000000).toFixed(1)}M listeners · ⭐ {show.rating}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
