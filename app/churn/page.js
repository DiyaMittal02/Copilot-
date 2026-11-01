'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import AppShell from '@/components/AppShell';
import KPICard from '@/components/KPICard';
import { churnStats, churnModel, churnDrivers, kpis } from '@/lib/metricsData';

const pretty = (f) => ({
  ads_per_100: 'Ads / 100 songs',
  dislikes_per_100: 'Dislikes / 100 songs',
  likes_per_100: 'Thumbs-Up / 100 songs',
  add_friend: 'Add-Friend actions',
  sessions: 'Sessions',
  songs: 'Songs played',
}[f] || f);

export default function ChurnPage() {
  const { feature_tests, paid_vs_free, n_churned, n_retained } = churnStats;

  return (
    <AppShell>
      <main className="page-body">
        <div className="section-header" style={{ marginBottom: 16 }}>
          <div>
            <div className="section-title">Churn Analysis</div>
            <div className="section-subtitle">
              Why users cancel — significance tests + a logistic-regression model. n = {n_churned + n_retained} users.
            </div>
          </div>
          <a className="btn btn-secondary" href="https://github.com" onClick={(e) => e.preventDefault()}
             style={{ fontSize: 12 }} title="See analysis/EXEC_MEMO.md in the repo">📄 Full memo in repo</a>
        </div>

        <div className="kpi-grid" style={{ marginBottom: 20 }}>
          <KPICard label="Churn Rate" value={kpis.churn_rate_pct} unit="%" color="#ef4444" />
          <KPICard label="Churned Users" value={n_churned} unit="users" color="#f59e0b" />
          <KPICard label="Retained Users" value={n_retained} unit="users" color="#10b981" />
          <KPICard label="Model ROC-AUC" value={churnModel.cv_auc_mean} unit={`± ${churnModel.cv_auc_std} (5-fold CV)`} color="#8b5cf6" />
        </div>

        {/* Key takeaway */}
        <div className="card" style={{ marginBottom: 20, background: 'rgba(99,102,241,0.06)', borderColor: 'rgba(99,102,241,0.2)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#a5b4fc', marginBottom: 8 }}>🔍 WHAT PREDICTS CHURN</div>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7 }}>
            Friction drives churn: churned users hit far more <strong>ads</strong> and <strong>dislikes</strong> per song,
            while <strong>Add-Friend</strong> (social connection) is the strongest protector (p = 0.0002).
            Their <em>enjoyment rate</em> (Thumbs-Up/100) is identical to retained users (p = 0.75) — it&apos;s an
            experience problem, not a taste problem. And being a paying user does <strong>not</strong> protect against
            churn (paid {paid_vs_free.paid_churn_rate}% vs free {paid_vs_free.free_churn_rate}%, p = {paid_vs_free.p_value}).
          </div>
        </div>

        <div className="chart-grid" style={{ marginBottom: 20 }}>
          {/* Driver comparison */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Churned vs Retained</div>
                <div className="chart-subtitle">Mean per-user values</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={churnDrivers} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#475569' }} />
                <YAxis type="category" dataKey="metric" tick={{ fontSize: 9, fill: '#94a3b8' }} width={130} />
                <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="churned" name="Churned" fill="#ef4444" radius={[0, 3, 3, 0]} />
                <Bar dataKey="retained" name="Retained" fill="#10b981" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Model odds ratios */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <div className="chart-title">Model: odds ratio per +1 SD</div>
                <div className="chart-subtitle">&gt;1 raises churn odds · &lt;1 protects</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={churnModel.features.map((f) => ({ ...f, name: pretty(f.feature) }))} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#475569' }} domain={[0, 2]} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} width={130} />
                <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8 }} />
                <Bar dataKey="odds_ratio" name="Odds ratio" fill="#8b5cf6" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Significance table */}
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            Significance tests (Welch&apos;s t-test, churned vs retained)
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  {['Signal', 'Churned', 'Retained', 'Lift', 'p-value', ''].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {feature_tests.map((t) => (
                  <tr key={t.feature}>
                    <td style={{ padding: '8px 12px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}>{pretty(t.feature)}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>{t.churned_mean}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>{t.retained_mean}</td>
                    <td style={{ padding: '8px 12px', color: t.lift_pct > 0 ? '#ef4444' : '#10b981', borderBottom: '1px solid var(--border-subtle)' }}>{t.lift_pct > 0 ? '+' : ''}{t.lift_pct}%</td>
                    <td style={{ padding: '8px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>{t.p_value}</td>
                    <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)' }}>{t.significant_05 ? '✅' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.6 }}>
            n = {n_churned} churned / {n_retained} retained. Small sample — treat as directional. Totals (songs,
            sessions) are partly confounded by observation time; rate features (per-100-songs) are the robust signals.
            Reproduce with <code>python analysis/churn_analysis.py</code>.
          </div>
        </div>
      </main>
    </AppShell>
  );
}
