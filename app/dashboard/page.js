'use client';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import AppShell from '@/components/AppShell';
import KPICard from '@/components/KPICard';
import {
  kpiCards, dauTrend, topArtists, weeklyRetention, funnel,
  churnDrivers, listeningByHour, DATASET,
} from '@/lib/metricsData';

const fmt = (n) => (typeof n === 'number' ? n.toLocaleString() : n);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d1526', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 12, color: p.color, fontWeight: 600 }}>
          {p.name}: {fmt(p.value)}
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  return (
    <AppShell>
      <main className="page-body">
          {/* Hero */}
          <div className="card hero-gradient-card" style={{ marginBottom: 24, padding: '28px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span className="custom-status-badge badge-active-glow">🟢 Live</span>
                  <span style={{ fontSize: 12, color: 'var(--text-accent)', fontWeight: 600 }}>CADENCE · STREAMING ANALYTICS COPILOT</span>
                </div>
                <h2 className="glow-text-purple" style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>
                  Product Insights Dashboard
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 680, lineHeight: 1.6 }}>
                  Self-serve retention, engagement and churn analytics. Every number below is
                  computed from the <strong>{DATASET.name}</strong> ({fmt(DATASET.users)} users,
                  {' '}{fmt(DATASET.events)} plays, {DATASET.window}) — ask the copilot or write a
                  query to go deeper.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <a href="/query" className="btn btn-primary" style={{ padding: '10px 16px', fontSize: 12 }}>⌨️ Ask with SQL</a>
                <a href="/copilot" className="btn btn-secondary" style={{ padding: '10px 16px', fontSize: 12 }}>🤖 Consult Copilot</a>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div style={{ marginBottom: 20 }}>
            <div className="section-header">
              <div>
                <div className="section-title">Key Performance Indicators</div>
                <div className="section-subtitle">Computed from the event log · {DATASET.window}</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '4px 10px', borderRadius: 20 }}>
                📦 {DATASET.name}
              </span>
            </div>
            <div className="kpi-grid">
              {kpiCards.map((k) => (
                <KPICard key={k.label} label={k.label} value={k.value} unit={k.unit} color={k.color} />
              ))}
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="chart-grid" style={{ marginBottom: 20 }}>
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Daily Active Users</div>
                  <div className="chart-subtitle">Distinct users per day · {DATASET.window}</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dauTrend}>
                  <defs>
                    <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#475569' }} interval={6} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="dau" name="DAU" stroke="#6366f1" fill="url(#dauGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Top Artists</div>
                  <div className="chart-subtitle">Most-played artists by song plays</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topArtists} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#475569' }} />
                  <YAxis type="category" dataKey="artist" tick={{ fontSize: 9, fill: '#94a3b8' }} width={110} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="plays" name="Plays" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="chart-grid" style={{ marginBottom: 20 }}>
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Weekly Active Retention</div>
                  <div className="chart-subtitle">Share of week W users active again in W+1</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={weeklyRetention}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="week_start" tick={{ fontSize: 9, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} unit="%" domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="retention_pct" name="Retention %" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Listening by Hour</div>
                  <div className="chart-subtitle">Song plays by hour of day (UTC)</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={listeningByHour}>
                  <defs>
                    <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="plays" name="Plays" stroke="#8b5cf6" fill="url(#hourGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Funnel + Churn drivers */}
          <div className="chart-grid">
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Funnel</div>
                  <div className="chart-subtitle">Registered → played → upgraded → retained</div>
                </div>
              </div>
              <div style={{ padding: '8px 0' }}>
                {funnel.map((step, i) => (
                  <div key={i} className="funnel-bar">
                    <div className="funnel-label">{step.stage}</div>
                    <div className="funnel-track">
                      <div className="funnel-fill" style={{ width: `${step.pct}%` }}>
                        <span className="funnel-value">{fmt(step.users)} · {step.pct}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">Churn Signals</div>
                  <div className="chart-subtitle">Churned vs retained · see Churn Analysis for tests</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={churnDrivers} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#475569' }} />
                  <YAxis type="category" dataKey="metric" tick={{ fontSize: 9, fill: '#94a3b8' }} width={120} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="churned" name="Churned" fill="#ef4444" radius={[0, 3, 3, 0]} />
                  <Bar dataKey="retained" name="Retained" fill="#10b981" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
      </main>
    </AppShell>
  );
}
