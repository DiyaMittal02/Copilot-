'use client';
import { useState } from 'react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell
} from 'recharts';
import AppShell from '@/components/AppShell';
import {
  dailyRetentionCurve, cohortTable, benchmarks,
  weeklyRetentionTrend, dropoffStages, retentionBySegment,
  showRetentionData, dailyStoryData
} from '@/lib/retentionData';

/* ─── Shared Tooltip ─────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label, suffix = '%' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0d1526', border: '1px solid rgba(99,102,241,0.35)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600, marginBottom: 2 }}>
          {p.name}: {typeof p.value === 'number' ? (p.value > 1000 ? (p.value / 1000).toFixed(1) + 'K' : p.value.toFixed(1) + suffix) : p.value}
        </div>
      ))}
    </div>
  );
};

/* ─── Score Badge ────────────────────────────────────────────── */
function ScoreBadge({ value, good, average }) {
  const color = value >= good ? '#10b981' : value >= average ? '#f59e0b' : '#ef4444';
  const label = value >= good ? 'Good' : value >= average ? 'Avg' : 'Below';
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: color + '22', color, border: `1px solid ${color}44` }}>{label}</span>
  );
}

/* ─── Section Header ─────────────────────────────────────────── */
function SectionHeader({ icon, title, subtitle, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{icon}</span> {title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{subtitle}</div>
      </div>
      {children}
    </div>
  );
}

/* ─── Info Card ──────────────────────────────────────────────── */
function InfoCard({ emoji, label, formula, note, color }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: `1px solid ${color}33`, borderRadius: 12, padding: 16, flex: 1, minWidth: 180 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{emoji} {label}</div>
      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: '#7dd3fc', background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: '6px 10px', marginBottom: 8 }}>{formula}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>{note}</div>
    </div>
  );
}

/* ─── Heatmap Cell ───────────────────────────────────────────── */
function HeatCell({ value, max = 55 }) {
  const intensity = value / max;
  const bg = `rgba(99,102,241,${0.1 + intensity * 0.8})`;
  const textColor = intensity > 0.5 ? '#f1f5f9' : '#94a3b8';
  return (
    <td style={{ background: bg, color: textColor, textAlign: 'center', fontSize: 12, fontWeight: 600, padding: '8px 10px', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 4, whiteSpace: 'nowrap' }}>
      {value.toFixed(1)}%
    </td>
  );
}

/* ─── Stat Pill ──────────────────────────────────────────────── */
function StatPill({ label, value, color }) {
  return (
    <div style={{ background: color + '15', border: `1px solid ${color}30`, borderRadius: 10, padding: '10px 14px', textAlign: 'center', flex: 1, minWidth: 80 }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  TAB: BY SHOW                                                  */
/* ═══════════════════════════════════════════════════════════════ */
function ShowTab() {
  const [selectedId, setSelectedId] = useState('ishq');
  const show = showRetentionData.find(s => s.id === selectedId);

  const statusConfig = {
    trending:  { label: '🚀 Trending Up',  color: '#10b981' },
    growing:   { label: '📈 Growing',      color: '#6366f1' },
    stable:    { label: '⚖️ Stable',        color: '#f59e0b' },
    declining: { label: '📉 Declining',     color: '#ef4444' },
  };

  return (
    <>
      {/* Show selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {showRetentionData.map(s => (
          <button
            key={s.id}
            onClick={() => setSelectedId(s.id)}
            style={{
              padding: '10px 16px', border: `1px solid ${selectedId === s.id ? s.color : 'var(--border-subtle)'}`,
              borderRadius: 12, background: selectedId === s.id ? s.color + '20' : 'var(--bg-card)',
              color: selectedId === s.id ? s.color : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.15s', boxShadow: selectedId === s.id ? `0 0 16px ${s.color}30` : 'none'
            }}
          >
            <span>{s.emoji}</span>
            <span>{s.title}</span>
            {s.status === 'declining' && <span style={{ fontSize: 10, color: '#ef4444' }}>⚠️</span>}
          </button>
        ))}
      </div>

      {show && (
        <>
          {/* Show header */}
          <div style={{
            background: `linear-gradient(135deg, ${show.color}18, ${show.color}06)`,
            border: `1px solid ${show.color}35`, borderRadius: 16, padding: 22, marginBottom: 20
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 40, lineHeight: 1 }}>{show.emoji}</div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{show.title}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 10px', borderRadius: 20 }}>{show.genre}</span>
                    <span style={{ fontSize: 11, color: '#fcd34d' }}>⭐ {show.rating}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{show.episodes} episodes</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: statusConfig[show.status].color, background: statusConfig[show.status].color + '15', padding: '2px 10px', borderRadius: 20, border: `1px solid ${statusConfig[show.status].color}30` }}>
                      {statusConfig[show.status].label}
                    </span>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', maxWidth: 600, lineHeight: 1.6 }}>{show.insight}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <StatPill label="Listeners" value={(show.totalListeners / 1000000).toFixed(1) + 'M'} color={show.color} />
                <StatPill label="Avg Eps/User" value={show.avgEpisodesPerUser} color="#8b5cf6" />
                <StatPill label="Completion" value={show.completionRate + '%'} color="#06b6d4" />
                <StatPill label="Avg Session" value={show.avgListenMinPerSession + 'm'} color="#10b981" />
              </div>
            </div>
          </div>

          {/* Retention KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
            {[
              { label: 'D1 Listener Return', value: show.d1, bm: benchmarks.d1, color: '#6366f1', desc: 'Came back next day' },
              { label: 'D7 Listener Return', value: show.d7, bm: benchmarks.d7, color: '#8b5cf6', desc: 'Still active after 1 week' },
              { label: 'D14 Listener Return', value: show.d14, bm: benchmarks.d14, color: '#06b6d4', desc: 'Active at 2 weeks' },
              { label: 'D30 Listener Return', value: show.d30, bm: benchmarks.d30, color: '#10b981', desc: 'Retained at 1 month' },
            ].map((k, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)', border: `1px solid ${k.color}30`,
                borderRadius: 14, padding: 18, position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: -16, right: -16, width: 60, height: 60, borderRadius: '50%', background: k.color, opacity: 0.08 }} />
                <div style={{ fontSize: 10, fontWeight: 600, color: k.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{k.label}</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 6 }}>{k.value}%</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                  <ScoreBadge value={k.value} good={k.bm.good} average={k.bm.average} />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Platform: {k.bm.pocketFM}%</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${Math.min((k.value / k.bm.good) * 100, 100)}%`, background: k.color, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Episode Funnel */}
            <div className="chart-card">
              <SectionHeader icon="📺" title="Episode Drop-off Funnel"
                subtitle="How many listeners reach each episode" />
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={show.episodeFunnel} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#475569' }} unit="%" domain={[0, 100]} />
                  <YAxis type="category" dataKey="ep" tick={{ fontSize: 11, fill: '#94a3b8' }} width={40} />
                  <Tooltip content={<ChartTooltip suffix="%" />} />
                  <Bar dataKey="pct" name="% Listeners Reached" fill={show.color} radius={[0, 4, 4, 0]}
                    label={{ position: 'right', style: { fontSize: 10, fill: '#94a3b8' }, formatter: v => v + '%' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly Listener Trend */}
            <div className="chart-card">
              <SectionHeader icon="📈" title="Weekly Listener Trend"
                subtitle="Total + new listeners per week" />
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={show.weeklyListeners}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} tickFormatter={v => (v / 1000).toFixed(0) + 'K'} />
                  <Tooltip content={<ChartTooltip suffix="" />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                  <Bar dataKey="listeners" name="Total Listeners" fill={show.color} radius={[4, 4, 0, 0]} opacity={0.7} />
                  <Bar dataKey="new" name="New Listeners" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Drop-off reasons */}
          <div className="chart-card">
            <SectionHeader icon="⚠️" title="Where Listeners Drop Off"
              subtitle="Key exit points in the show journey with root causes" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {show.dropReasons.map((drop, i) => {
                const colors = ['#ef4444', '#f59e0b', '#06b6d4'];
                const c = colors[i] || '#6366f1';
                return (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${c}25`, borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{drop.stage}</div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: c, background: c + '20', border: `1px solid ${c}35`, borderRadius: 20, padding: '3px 12px' }}>
                        -{drop.lost.toFixed(1)}% listeners lost
                      </span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, marginBottom: 10 }}>
                      <div style={{ height: '100%', width: `${(drop.lost / 30) * 100}%`, background: c, borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      <span style={{ color: c }}>◆ </span>{drop.reason}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  TAB: DAILY STORY                                              */
/* ═══════════════════════════════════════════════════════════════ */
function DailyStoryTab() {
  const [selectedDay, setSelectedDay] = useState(0);
  const story = dailyStoryData[selectedDay];

  return (
    <>
      {/* Date selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        {dailyStoryData.map((d, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(i)}
            style={{
              padding: '10px 18px', borderRadius: 12, border: `1px solid ${selectedDay === i ? '#6366f1' : 'var(--border-subtle)'}`,
              background: selectedDay === i ? 'rgba(99,102,241,0.15)' : 'var(--bg-card)',
              color: selectedDay === i ? '#818cf8' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.15s'
            }}
          >
            <div>{d.dayOfWeek}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{d.date}</div>
          </button>
        ))}
      </div>

      {story && (
        <>
          {/* Day summary banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.14), rgba(139,92,246,0.07))',
            border: '1px solid rgba(99,102,241,0.3)', borderRadius: 16, padding: 20, marginBottom: 24,
            display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{story.date}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{story.dayOfWeek} — Daily Cohort Story</div>
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <StatPill label="Total Installs" value={story.installs.toLocaleString()} color="#6366f1" />
              <StatPill label="Onboarded" value={story.steps[1].users.toLocaleString()} color="#8b5cf6" />
              <StatPill label="Listened" value={story.steps[2].users.toLocaleString()} color="#06b6d4" />
              <StatPill label="D1 Retained" value={story.steps[5].users.toLocaleString()} color="#f59e0b" />
            </div>
          </div>

          {/* ── USER JOURNEY FLOW ── */}
          <div className="chart-card" style={{ marginBottom: 20 }}>
            <SectionHeader icon="🛤️" title="User Journey — From Install to Loyal"
              subtitle="Every step of the funnel for this day's cohort" />
            <div style={{ position: 'relative' }}>
              {story.steps.map((step, i) => {
                const isLast = i === story.steps.length - 1;
                const nextStep = story.steps[i + 1];
                const dropPct = nextStep ? ((step.users - nextStep.users) / step.users * 100).toFixed(1) : null;
                return (
                  <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 4 }}>
                    {/* Left: step block */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        background: step.color + '12', border: `1px solid ${step.color}30`,
                        borderRadius: 12, padding: '14px 18px', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: 14
                      }}>
                        {/* Icon + label */}
                        <div style={{
                          width: 38, height: 38, borderRadius: 10, background: step.color + '25',
                          border: `1px solid ${step.color}40`, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: 18, flexShrink: 0
                        }}>{step.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{step.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{step.note}</div>
                        </div>
                        {/* Numbers */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: step.color }}>{step.pct}%</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{step.users.toLocaleString()} users</div>
                        </div>
                        {/* Bar */}
                        <div style={{ width: 120, flexShrink: 0 }}>
                          <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
                            <div style={{ height: '100%', width: `${step.pct}%`, background: step.color, borderRadius: 4, transition: 'width 0.4s ease' }} />
                          </div>
                        </div>
                      </div>

                      {/* Drop indicator between steps */}
                      {!isLast && dropPct && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 18px' }}>
                          <div style={{ width: 2, height: 16, background: 'rgba(239,68,68,0.3)', borderRadius: 1, marginLeft: 27 }} />
                          <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 600 }}>
                            ↓ {dropPct}% drop ({(step.users - nextStep.users).toLocaleString()} users left)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Two columns below */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Top Shows Listened */}
            <div className="chart-card">
              <SectionHeader icon="🎙️" title="What They Listened To"
                subtitle={`Top shows for ${story.date} new users`} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {story.topShows.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 20, flexShrink: 0 }}>{s.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{s.title}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.pct}%</span>
                      </div>
                      <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}>
                        <div style={{ height: '100%', width: `${s.pct}%`, background: s.color, borderRadius: 3 }} />
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.listeners.toLocaleString()} new listeners</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hourly Installs */}
            <div className="chart-card">
              <SectionHeader icon="⏰" title="Installs by Hour"
                subtitle="When did users discover the app?" />
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={story.hourlyInstalls}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="hour" tick={{ fontSize: 9, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 9, fill: '#475569' }} tickFormatter={v => v} />
                  <Tooltip content={<ChartTooltip suffix="" />} />
                  <Bar dataKey="installs" name="Installs" fill="#6366f1" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Insights */}
          <div className="chart-card">
            <SectionHeader icon="💡" title="AI Insights for This Cohort"
              subtitle="Patterns and anomalies detected for this day's install cohort" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {story.keyInsights.map((ins, i) => {
                const config = {
                  positive: { icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
                  warning:  { icon: '⚠️', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
                  info:     { icon: '💡', color: '#06b6d4', bg: 'rgba(6,182,212,0.08)'  },
                }[ins.type];
                return (
                  <div key={i} style={{
                    background: config.bg, border: `1px solid ${config.color}30`,
                    borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start'
                  }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{config.icon}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{ins.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/*  MAIN PAGE                                                     */
/* ═══════════════════════════════════════════════════════════════ */
export default function RetentionPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const tabs = [
    { id: 'overview',  label: '📈 Overview' },
    { id: 'show',      label: '📺 By Show' },
    { id: 'dailystory',label: '🗓️ Daily Story' },
    { id: 'daily',     label: '📅 Daily Curve' },
    { id: 'cohorts',   label: '🔬 Cohorts' },
    { id: 'segments',  label: '👥 Segments' },
    { id: 'howto',     label: '📚 How It Works' },
  ];

  return (
    <AppShell>
      <main className="page-body">

          {/* Page Title + Tabs */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>📊 Retention Analytics</h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Daily curves, show-level retention, cohort stories & benchmarks</p>
              </div>
              <span style={{ fontSize: 11, color: '#a5b4fc', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20, padding: '5px 14px', fontWeight: 600 }}>
                📅 May–Jun 2026
              </span>
            </div>
            <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                  color: activeTab === t.id ? '#818cf8' : 'var(--text-muted)',
                  borderBottom: activeTab === t.id ? '2px solid #6366f1' : '2px solid transparent',
                  transition: 'all 0.15s', marginBottom: -1
                }}>{t.label}</button>
              ))}
            </div>
          </div>

          {/* ── OVERVIEW ─────────────────────────────────── */}
          {activeTab === 'overview' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                {[
                  { label: 'D1 Retention', value: benchmarks.d1.pocketFM, bm: benchmarks.d1, color: '#6366f1', icon: '⚡' },
                  { label: 'D7 Retention', value: benchmarks.d7.pocketFM, bm: benchmarks.d7, color: '#8b5cf6', icon: '📅' },
                  { label: 'D14 Retention', value: benchmarks.d14.pocketFM, bm: benchmarks.d14, color: '#06b6d4', icon: '📆' },
                  { label: 'D30 Retention', value: benchmarks.d30.pocketFM, bm: benchmarks.d30, color: '#10b981', icon: '📊' },
                ].map((k, i) => (
                  <div key={i} style={{ background: 'var(--bg-card)', border: `1px solid ${k.color}33`, borderRadius: 16, padding: 20, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: k.color, opacity: 0.07 }} />
                    <div style={{ fontSize: 11, fontWeight: 600, color: k.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{k.icon} {k.label}</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 8 }}>{k.value}%</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <ScoreBadge value={k.value} good={k.bm.good} average={k.bm.average} />
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Good: ≥{k.bm.good}%</span>
                    </div>
                    <div style={{ marginTop: 12, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${Math.min((k.value / k.bm.good) * 100, 100)}%`, background: k.color, borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="chart-card" style={{ marginBottom: 20 }}>
                <SectionHeader icon="📈" title="Retention Trend Over Time" subtitle="D1, D7, D30 across monthly cohorts" />
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={weeklyRetentionTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#475569' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#475569' }} unit="%" domain={[0, 60]} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                    <Line type="monotone" dataKey="d1" name="D1" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 5, fill: '#6366f1' }} />
                    <Line type="monotone" dataKey="d7" name="D7" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 5, fill: '#8b5cf6' }} />
                    <Line type="monotone" dataKey="d30" name="D30" stroke="#10b981" strokeWidth={2.5} dot={{ r: 5, fill: '#10b981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card">
                <SectionHeader icon="⚠️" title="Platform Drop-off Stages" subtitle="Where users churn and why" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {dropoffStages.map((stage, i) => {
                    const c = ['#ef4444','#f59e0b','#06b6d4','#10b981'][i];
                    return (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${c}20`, borderRadius: 12, padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{stage.stage}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stage.from}% → {stage.to}%</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: c, background: c+'22', border:`1px solid ${c}44`, borderRadius: 20, padding: '2px 10px' }}>-{stage.lost.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, marginBottom: 8 }}>
                          <div style={{ height: '100%', width: `${(stage.lost / 55) * 100}%`, background: c, borderRadius: 3 }} />
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}><span style={{ color: c }}>◆ </span>{stage.reason}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ── BY SHOW ──────────────────────────────────── */}
          {activeTab === 'show' && <ShowTab />}

          {/* ── DAILY STORY ──────────────────────────────── */}
          {activeTab === 'dailystory' && <DailyStoryTab />}

          {/* ── DAILY CURVE ──────────────────────────────── */}
          {activeTab === 'daily' && (
            <>
              <div className="chart-card" style={{ marginBottom: 20 }}>
                <SectionHeader icon="📅" title="Daily Retention Curve — D0 to D30" subtitle="% of users from May 2026 cohort still active on each day" />
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyRetentionCurve}>
                    <defs>
                      <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#475569' }} interval={1} />
                    <YAxis tick={{ fontSize: 10, fill: '#475569' }} unit="%" domain={[0, 105]} />
                    <Tooltip content={<ChartTooltip />} />
                    <ReferenceLine y={48.3} stroke="#6366f1" strokeDasharray="4 4" />
                    <ReferenceLine y={26.1} stroke="#8b5cf6" strokeDasharray="4 4" />
                    <ReferenceLine y={14.2} stroke="#10b981" strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="pct" name="Retention %" stroke="#6366f1" strokeWidth={2.5} fill="url(#retGrad)"
                      dot={(props) => ['D1','D7','D14','D30'].includes(props.payload?.day)
                        ? <circle key={props.key} cx={props.cx} cy={props.cy} r={5} fill="#6366f1" stroke="#fff" strokeWidth={2}/>
                        : <g key={props.key}/>} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card">
                <SectionHeader icon="🔢" title="Day-by-Day Table" subtitle="Exact retention % and users from a 100K install cohort" />
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        {['Day','Retention %','Active Users (100K cohort)','Drop from prev day'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dailyRetentionCurve.map((row, i) => {
                        const prev = i > 0 ? dailyRetentionCurve[i-1].pct : row.pct;
                        const drop = i > 0 ? (prev - row.pct).toFixed(1) : '—';
                        const isKey = ['D1','D7','D14','D30'].includes(row.day);
                        return (
                          <tr key={row.day} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: isKey ? 'rgba(99,102,241,0.06)' : 'transparent' }}>
                            <td style={{ padding: '8px 12px', fontWeight: isKey ? 700 : 500, color: isKey ? '#818cf8' : 'var(--text-secondary)' }}>{row.day}</td>
                            <td style={{ padding: '8px 12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 60, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                                  <div style={{ width: `${row.pct}%`, height: '100%', background: '#6366f1', borderRadius: 2 }} />
                                </div>
                                {row.pct}%
                              </div>
                            </td>
                            <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', fontFamily: "'Fira Code', monospace" }}>{row.users.toLocaleString()}</td>
                            <td style={{ padding: '8px 12px', color: i > 0 ? '#ef4444' : 'var(--text-muted)' }}>{i > 0 ? `-${drop}%` : '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* ── COHORTS ──────────────────────────────────── */}
          {activeTab === 'cohorts' && (
            <>
              <div className="chart-card" style={{ marginBottom: 20 }}>
                <SectionHeader icon="🔬" title="Cohort Retention Heatmap" subtitle="Darker = higher retention. Rows = install cohorts." />
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 4, fontSize: 12 }}>
                    <thead>
                      <tr>
                        {['Cohort','Installs','D1','D3','D7','D14','D21','D30','Trend'].map(h => (
                          <th key={h} style={{ padding: '6px 10px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cohortTable.map((row, i) => (
                        <tr key={i}>
                          <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', whiteSpace: 'nowrap' }}>{row.cohort}</td>
                          <td style={{ padding: '8px 10px', color: 'var(--text-muted)', textAlign: 'center', fontSize: 11, fontFamily: "'Fira Code', monospace" }}>{(row.installSize / 1000).toFixed(0)}K</td>
                          <HeatCell value={row.d1} max={55} />
                          <HeatCell value={row.d3} max={40} />
                          <HeatCell value={row.d7} max={30} />
                          <HeatCell value={row.d14} max={22} />
                          <HeatCell value={row.d21} max={18} />
                          <HeatCell value={row.d30} max={15} />
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>{row.trend === 'up' ? '📈' : '📉'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Low</span>
                  {[0.1, 0.3, 0.5, 0.7, 0.9].map((op, i) => (
                    <div key={i} style={{ width: 28, height: 14, borderRadius: 3, background: `rgba(99,102,241,${0.1 + op * 0.8})` }} />
                  ))}
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>High</span>
                </div>
              </div>
              <div className="chart-card">
                <SectionHeader icon="📊" title="Cohort Comparison" subtitle="D1, D7, D30 across monthly cohorts" />
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={cohortTable}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="cohort" tick={{ fontSize: 10, fill: '#475569' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#475569' }} unit="%" domain={[0, 60]} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                    <Bar dataKey="d1" name="D1" fill="#6366f1" radius={[4,4,0,0]} />
                    <Bar dataKey="d7" name="D7" fill="#8b5cf6" radius={[4,4,0,0]} />
                    <Bar dataKey="d30" name="D30" fill="#10b981" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* ── SEGMENTS ─────────────────────────────────── */}
          {activeTab === 'segments' && (
            <>
              <div className="chart-card" style={{ marginBottom: 20 }}>
                <SectionHeader icon="👥" title="Retention by Segment" subtitle="Premium vs free vs casual — massive behavioural difference" />
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={[
                    { milestone: 'D1',  ...Object.fromEntries(retentionBySegment.map(s => [s.segment, s.d1])) },
                    { milestone: 'D7',  ...Object.fromEntries(retentionBySegment.map(s => [s.segment, s.d7])) },
                    { milestone: 'D14', ...Object.fromEntries(retentionBySegment.map(s => [s.segment, s.d14])) },
                    { milestone: 'D30', ...Object.fromEntries(retentionBySegment.map(s => [s.segment, s.d30])) },
                  ]} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#475569' }} unit="%" domain={[0, 90]} />
                    <YAxis type="category" dataKey="milestone" tick={{ fontSize: 12, fill: '#94a3b8' }} width={40} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                    {retentionBySegment.map(s => (<Bar key={s.segment} dataKey={s.segment} fill={s.color} radius={[0,4,4,0]} />))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
                {retentionBySegment.map((seg, i) => (
                  <div key={i} style={{ background: 'var(--bg-card)', border: `1px solid ${seg.color}33`, borderRadius: 14, padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: seg.color, boxShadow: `0 0 8px ${seg.color}` }} />
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{seg.segment}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                      {[{l:'D1',v:seg.d1},{l:'D7',v:seg.d7},{l:'D14',v:seg.d14},{l:'D30',v:seg.d30}].map((m, j) => (
                        <div key={j} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{m.l}</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: seg.color }}>{m.v}%</div>
                          <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginTop: 4 }}>
                            <div style={{ width: `${(m.v / 90) * 100}%`, height: '100%', background: seg.color, borderRadius: 2 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── HOW IT WORKS ─────────────────────────────── */}
          {activeTab === 'howto' && (
            <>
              <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>🧮 The Core Formula</div>
                <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, padding: '16px 20px', fontFamily: "'Fira Code', monospace", fontSize: 15, color: '#7dd3fc', marginBottom: 14 }}>
                  DX Retention = (Users active on Day X from cohort) ÷ (Total installs on Day 0) × 100
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  <strong style={{ color: '#a5b4fc' }}>Example:</strong> 100,000 users install on Jan 1. 26,100 of those same users open the app on Jan 8 (Day 7). D7 Retention = <strong style={{ color: '#7dd3fc' }}>26.1%</strong>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 }}>
                <InfoCard emoji="⚡" label="D1 Retention" color="#6366f1" formula="Active Day 1 ÷ Day 0 installs × 100" note="Onboarding quality signal. Did the user see value immediately? Industry good: ≥55%. PocketFM: 48.3%" />
                <InfoCard emoji="📅" label="D7 Retention" color="#8b5cf6" formula="Active Day 7 ÷ Day 0 installs × 100" note="Habit formation signal. Back at Day 7 = habit forming. Good: ≥30%. PocketFM: 26.1%" />
                <InfoCard emoji="📆" label="D14 Retention" color="#06b6d4" formula="Active Day 14 ÷ Day 0 installs × 100" note="Separates explorers from loyalists. Good: ≥22%. PocketFM: 18.0%" />
                <InfoCard emoji="📊" label="D30 Retention" color="#10b981" formula="Active Day 30 ÷ Day 0 installs × 100" note="Gold standard. D30 users rarely churn. Good: ≥15%. PocketFM: 14.2%" />
              </div>
              <div className="chart-card">
                <SectionHeader icon="🏆" title="Industry Benchmarks" subtitle="How PocketFM compares to mobile app industry standards" />
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {['Metric','Poor','Average','Good','PocketFM','Status'].map(h => (
                        <th key={h} style={{ padding: '8px 14px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[{label:'D1',key:'d1'},{label:'D7',key:'d7'},{label:'D14',key:'d14'},{label:'D30',key:'d30'}].map((row, i) => {
                      const bm = benchmarks[row.key];
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--text-primary)' }}>{row.label} Retention</td>
                          <td style={{ padding: '10px 14px', color: '#ef4444', fontWeight: 600 }}>{'<'}{bm.poor}%</td>
                          <td style={{ padding: '10px 14px', color: '#f59e0b', fontWeight: 600 }}>{bm.poor}–{bm.good}%</td>
                          <td style={{ padding: '10px 14px', color: '#10b981', fontWeight: 600 }}>≥{bm.good}%</td>
                          <td style={{ padding: '10px 14px', fontWeight: 800, color: 'var(--text-primary)' }}>{bm.pocketFM}%</td>
                          <td style={{ padding: '10px 14px' }}><ScoreBadge value={bm.pocketFM} good={bm.good} average={bm.average} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

        </main>
    </AppShell>
  );
}
