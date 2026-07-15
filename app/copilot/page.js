'use client';
import AppShell from '@/components/AppShell';
import CopilotChat from '@/components/CopilotChat';
import { kpiData } from '@/lib/mockData';

const kpiContext = {
  dau: kpiData.dau.value,
  mau: kpiData.mau.value,
  d7Retention: kpiData.d7Retention.value,
  d30Retention: kpiData.d30Retention.value,
  premiumConversion: kpiData.premiumConversion.value,
  avgListenTime: kpiData.avgListenTime.value,
  churnRate: kpiData.churnRate.value,
  arpu: kpiData.arpu.value,
};

export default function CopilotPage() {
  return (
    <AppShell>
      <main className="page-body" style={{ display: 'flex', gap: 20, overflow: 'auto', flexWrap: 'wrap', height: 'calc(100vh - var(--topbar-height))' }}>
          {/* Chat Panel */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
            <CopilotChat kpiContext={kpiContext} />
          </div>

          {/* Context Panel */}
          <div style={{ width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
                📊 Current Context
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
                The AI has access to these live metrics:
              </div>
              {[
                { label: 'DAU', value: '2.85M', change: '+4.2%', good: true },
                { label: 'MAU', value: '18.3M', change: '+7.8%', good: true },
                { label: 'D7 Retention', value: '26.1%', change: '-0.8%', good: false },
                { label: 'Premium Conv.', value: '7.4%', change: '+0.9%', good: true },
                { label: 'Churn Rate', value: '3.2%/mo', change: '-0.4%', good: true },
                { label: 'Avg Listen Time', value: '43.7 min', change: '-2.1%', good: false },
                { label: 'ARPU', value: '₹84.5', change: '+5.1%', good: true },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.label}</span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{m.value}</span>
                    <span style={{ fontSize: 10, color: m.good ? '#10b981' : '#ef4444' }}>{m.change}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                💡 Try Asking
              </div>
              {[
                { emoji: '🔍', q: 'Root cause analysis for D7 retention dip' },
                { emoji: '🧪', q: 'Design an experiment to improve listen time' },
                { emoji: '💰', q: 'Which metrics drive premium conversion?' },
                { emoji: '📈', q: 'What does a healthy DAU/MAU look like?' },
                { emoji: '🚨', q: 'What churn signals should I watch?' },
                { emoji: '🎯', q: 'How to set up cohort analysis?' },
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
                Powered by <strong style={{ color: 'var(--text-secondary)' }}>Groq · Llama 3.3 70B</strong><br />
                Context-aware of PocketFM's audio streaming domain and Indian market benchmarks.
              </div>
            </div>
          </div>
        </main>
    </AppShell>
  );
}
