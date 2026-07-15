'use client';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import { bufferDataPoints, bufferOptimizedDataPoints, bufferingAnomaliesList } from '@/lib/bufferDiagnosticsData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';

export default function DiagnosticsPage() {
  const [lowDataOptimized, setLowDataOptimized] = useState(false);

  const activePoints = lowDataOptimized ? bufferOptimizedDataPoints : bufferDataPoints;

  // Chart Tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#0d1526', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '10px 14px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ fontSize: 11, color: p.color, margin: '2px 0' }}>
            {p.name}: <strong>{p.value}{p.name.includes('Churn') || p.name.includes('Ratio') ? '%' : 'ms'}</strong>
          </div>
        ))}
      </div>
    );
  };

  return (
    <AppShell>
      <main className="page-body">

        {/* Intro Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(99,102,241,0.06))',
          border: '1px solid rgba(239,68,68,0.25)', borderRadius: 16, padding: '18px 22px', marginBottom: 24
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span>🛠️</span> Playback Buffer Diagnostics (Technical Churn)
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 800, lineHeight: 1.7 }}>
            Identify where app latency and audio buffering directly drive Day 1 user uninstalls. Model optimizations (e.g. 64kbps HE-AAC streams) to reduce connection drops across regional 3G and spotty 4G cell networks.
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', marginBottom: 24, border: '1px solid rgba(99,102,241,0.2)' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>⚡ Enable Low-Data Stream Optimizations</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Simulates switching streams from standard 128kbps to optimized 64kbps HE-AACv2 for latency thresholds exceeding 200ms.
            </div>
          </div>
          <button
            onClick={() => setLowDataOptimized(!lowDataOptimized)}
            style={{
              padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 12,
              border: `1px solid ${lowDataOptimized ? '#10b981' : 'var(--border-subtle)'}`,
              background: lowDataOptimized ? 'rgba(16,185,129,0.15)' : 'var(--bg-card)',
              color: lowDataOptimized ? '#34d399' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
          >
            {lowDataOptimized ? 'ON (Optimized 64kbps)' : 'OFF (Standard 128kbps)'}
          </button>
        </div>

        {/* Charts Grid */}
        <div className="chart-grid" style={{ marginBottom: 24 }}>
          
          {/* Chart 1: Buffering vs Latency */}
          <div className="chart-card">
            <div style={{ marginBottom: 16 }}>
              <div className="chart-title">📡 Network Latency vs Buffering Ratio</div>
              <div className="chart-subtitle">Buffering duration as a percentage of total play time</div>
            </div>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activePoints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#475569' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 9, fill: '#475569' }} label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', style: { fill: '#475569', fontSize: 10 } }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: '#475569' }} label={{ value: 'Buffering Ratio (%)', angle: 90, position: 'insideRight', style: { fill: '#475569', fontSize: 10 } }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Line yAxisId="left" type="monotone" dataKey="latency" name="Latency" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="bufferingRatio" name="Buffering Ratio" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Churn Correlation */}
          <div className="chart-card">
            <div style={{ marginBottom: 16 }}>
              <div className="chart-title">📉 Buffering Impact on Day 1 Churn</div>
              <div className="chart-subtitle">Direct correlation between network performance and uninstall rate</div>
            </div>
            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activePoints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 9, fill: '#475569' }} unit="%" />
                  <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid rgba(239,68,68,0.3)', fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="bufferingRatio" name="Buffering Ratio" fill="rgba(239,68,68,0.4)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="d1Churn" name="D1 Churn Rate" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Regional Diagnostic Feed */}
        <div>
          <div className="section-header" style={{ marginBottom: 16 }}>
            <div>
              <div className="section-title">🚨 Buffer Anomalies by Region & Network</div>
              <div className="section-subtitle">Real-time alerts connecting local cell towers to app churn spikes</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {bufferingAnomaliesList.map((anom, idx) => (
              <div key={idx} className="card" style={{ borderLeft: '3px solid #ef4444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 10 }}>
                  <div>
                    <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>{anom.region}</strong>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Operator Scope: {anom.network}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 4 }}>
                      Churn Impact: {anom.d1ChurnImpact}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: 'rgba(0,0,0,0.15)', padding: 12, borderRadius: 8, marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Latency</span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#8b5cf6', marginTop: 2 }}>{anom.avgLatency}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Playback Failures</span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginTop: 2 }}>{anom.playbackFailures}</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', padding: 12, borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>🔧 AI Suggested Remedy:</span>
                  <span style={{ lineHeight: 1.5 }}>{anom.remedy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>
    </AppShell>
  );
}
