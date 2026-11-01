'use client';
import AppShell from '@/components/AppShell';
import CopilotChat from '@/components/CopilotChat';
import { kpiContext } from '@/lib/metricsData';

const contextRows = [
  { label: 'Total Users', value: kpiContext.totalUsers.toLocaleString() },
  { label: 'Churn Rate', value: `${kpiContext.churnRatePct}%` },
  { label: 'Paid Share', value: `${kpiContext.paidSharePct}%` },
  { label: 'Avg DAU', value: `${kpiContext.avgDau} (peak ${kpiContext.peakDau})` },
  { label: 'Weekly Retention', value: `${kpiContext.avgWeeklyRetentionPct}%` },
  { label: 'Upgrades', value: kpiContext.upgrades.toLocaleString() },
];

export default function CopilotPage() {
  return (
    <AppShell>
      <main className="page-body" style={{ display: 'flex', gap: 20, overflow: 'auto', flexWrap: 'wrap', height: 'calc(100vh - var(--topbar-height))' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
            <CopilotChat kpiContext={kpiContext} />
          </div>

          <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
                📊 Current Context
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                The copilot is grounded on these computed metrics:
              </div>
              {contextRows.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{m.value}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                💡 Try Asking
              </div>
              {[
                { emoji: '🔍', q: 'Why might users be churning?' },
                { emoji: '🧪', q: 'Design an experiment to cut churn' },
                { emoji: '💰', q: 'What drives upgrades to paid?' },
                { emoji: '📈', q: 'Is this weekly retention healthy?' },
                { emoji: '🚨', q: 'What churn signals should I watch?' },
                { emoji: '🎯', q: 'How do I set up cohort analysis?' },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '7px 0',
                  borderBottom: i < 5 ? '1px solid var(--border-subtle)' : 'none',
                  fontSize: 12, color: 'var(--text-secondary)',
                  display: 'flex', gap: 8, alignItems: 'flex-start'
                }}>
                  <span>{item.emoji}</span>
                  <span style={{ lineHeight: 1.4 }}>{item.q}</span>
                </div>
              ))}
            </div>

            <div className="card" style={{ background: 'rgba(99,102,241,0.06)', borderColor: 'rgba(99,102,241,0.2)' }}>
              <div style={{ fontSize: 11, color: '#a5b4fc', fontWeight: 600, marginBottom: 6 }}>🤖 AI Model</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Pluggable provider — <strong style={{ color: 'var(--text-secondary)' }}>Gemini / Groq / OpenAI / Ollama</strong><br />
                Grounded on the dashboard&apos;s computed metrics. The API key is held server-side.
              </div>
            </div>
          </div>
        </main>
    </AppShell>
  );
}
