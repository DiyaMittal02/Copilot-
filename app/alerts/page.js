'use client';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import { churnAlerts, userFeedbackData } from '@/lib/feedbackData';

export default function ChurnMonitoringPage() {
  const [alerts, setAlerts] = useState(churnAlerts);
  const [selectedTopic, setSelectedTopic] = useState(userFeedbackData.topics[0].name);
  const [newThreshold, setNewThreshold] = useState('');
  const [newMetric, setNewMetric] = useState('d7Retention');
  
  const currentTopic = userFeedbackData.topics.find(t => t.name === selectedTopic);

  const handleResolveAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
  };

  const handleAddAlert = (e) => {
    e.preventDefault();
    if (!newThreshold) return;
    const metricLabels = {
      d7Retention: "D7 Retention",
      avgListenTime: "Avg. Listen Time",
      d30Retention: "D30 Retention",
      premiumConversion: "Premium Conv."
    };
    const newAlertRule = {
      id: `alert-${Date.now()}`,
      metric: metricLabels[newMetric],
      currentValue: "Active Monitor",
      threshold: `< ${newThreshold}`,
      severity: "warning",
      timeDetected: "Just now",
      status: "Active",
      triggerReason: `User defined alert rules configured to trigger when ${metricLabels[newMetric]} drops below ${newThreshold}.`,
      actionPlan: ["Trigger custom cohort audit report.", "Verify API telemetry data integrity."]
    };
    setAlerts(prev => [newAlertRule, ...prev]);
    setNewThreshold('');
  };

  return (
    <AppShell>
      <main className="page-body">
        
        {/* Header Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          <div className="card" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <span style={{ fontSize: 32 }}>🚨</span>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Active Alert Feeds</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
                {alerts.filter(a => a.status !== 'Resolved').length} Active
              </div>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <span style={{ fontSize: 32 }}>💬</span>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Reviews Analyzed</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
                {userFeedbackData.summary.totalAnalyzed} App Reviews
              </div>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <span style={{ fontSize: 32 }}>⭐</span>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Average Rating</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fcd34d' }}>
                {userFeedbackData.summary.averageRating} / 5.0
              </div>
            </div>
          </div>
        </div>

        <div className="chart-grid">
          
          {/* COLUMN 1: Alerts Setup & Monitoring */}
          <div>
            <div className="section-header" style={{ marginBottom: 16 }}>
              <div>
                <div className="section-title">⚠️ Churn Threshold Alert Panel</div>
                <div className="section-subtitle">Real-time alerts triggered on metric anomalies</div>
              </div>
            </div>

            {/* Custom Alert Configurator */}
            <div className="card" style={{ marginBottom: 20, border: '1px solid rgba(99,102,241,0.2)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                ⚙️ Set Custom Alert Threshold
              </div>
              <form onSubmit={handleAddAlert} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <select 
                  className="form-select" 
                  value={newMetric}
                  onChange={e => setNewMetric(e.target.value)}
                  style={{ flex: 1, minWidth: 140, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', outline: 'none' }}
                >
                  <option value="d7Retention">D7 Retention</option>
                  <option value="avgListenTime">Avg. Listen Time</option>
                  <option value="d30Retention">D30 Retention</option>
                  <option value="premiumConversion">Premium Conv.</option>
                </select>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="e.g. 26.5% or 35m" 
                  value={newThreshold}
                  onChange={e => setNewThreshold(e.target.value)}
                  style={{ flex: 1, minWidth: 120, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', outline: 'none' }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>
                  Create Alert
                </button>
              </form>
            </div>

            {/* Alerts List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {alerts.map(alert => {
                const isResolved = alert.status === 'Resolved';
                const severityColor = alert.severity === 'danger' ? '#ef4444' : '#f59e0b';
                return (
                  <div key={alert.id} className="card" style={{ opacity: isResolved ? 0.65 : 1, transition: 'opacity 0.25s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: isResolved ? '#64748b' : severityColor }} />
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{alert.metric}</span>
                          <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: 20 }}>
                            {alert.status}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                          Triggered threshold: <strong style={{ color: severityColor }}>{alert.threshold}</strong> · Current: {alert.currentValue}
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{alert.timeDetected}</span>
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14, paddingLeft: 16, borderLeft: `2px solid ${isResolved ? '#64748b' : severityColor}` }}>
                      {alert.triggerReason}
                    </div>

                    {!isResolved && (
                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, marginBottom: 14 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', uppercase: true, letterSpacing: '0.04em', marginBottom: 8 }}>
                          🛠️ CORE ACTION STRATEGIES
                        </div>
                        {alert.actionPlan.map((act, idx) => (
                          <div key={idx} style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', gap: 6 }}>
                            <span>•</span> <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {!isResolved && (
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => handleResolveAlert(alert.id)}
                        style={{ width: '100%', padding: '6px 12px', fontSize: 11 }}
                      >
                        Resolve Alert & Dismiss
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2: App Store Reviews & Feedback Sentiment */}
          <div>
            <div className="section-header" style={{ marginBottom: 16 }}>
              <div>
                <div className="section-title">📊 Sentiment & Churn Drivers Analysis</div>
                <div className="section-subtitle">Categorized App Reviews and Retention Actions</div>
              </div>
            </div>

            {/* Keyword Clouds */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: 8 }}>
                    💚 High Retention Hooks
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {userFeedbackData.summary.topPositiveKeywords.map(kw => (
                      <span key={kw} style={{ fontSize: 11, background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 20, padding: '3px 10px' }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', marginBottom: 8 }}>
                    💔 Top Churn Triggers
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {userFeedbackData.summary.topNegativeKeywords.map(kw => (
                      <span key={kw} style={{ fontSize: 11, background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 20, padding: '3px 10px' }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Topic Navigation */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
              {userFeedbackData.topics.map(t => (
                <button 
                  key={t.name}
                  onClick={() => setSelectedTopic(t.name)}
                  style={{
                    padding: '8px 14px', borderRadius: 20,
                    border: `1px solid ${selectedTopic === t.name ? '#6366f1' : 'var(--border-subtle)'}`,
                    background: selectedTopic === t.name ? 'rgba(99,102,241,0.12)' : 'var(--bg-card)',
                    color: selectedTopic === t.name ? '#818cf8' : 'var(--text-secondary)',
                    cursor: 'pointer', fontSize: 11, fontWeight: 600, transition: 'all 0.15s', whiteSpace: 'nowrap'
                  }}
                >
                  {t.name} ({t.mentions})
                </button>
              ))}
            </div>

            {/* Topic Details & Action Plan */}
            {currentTopic && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {currentTopic.name}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: currentTopic.sentiment.includes('Negative') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                    color: currentTopic.sentiment.includes('Negative') ? '#ef4444' : '#10b981',
                    border: `1px solid ${currentTopic.sentiment.includes('Negative') ? '#ef4444' : '#10b981'}33`
                  }}>
                    {currentTopic.sentiment}
                  </span>
                </div>

                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 18 }}>
                  {currentTopic.summary}
                </div>

                {/* Quotes */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
                    🎙️ Voice of the Customer
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {currentTopic.quotes.map((q, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-subtle)', padding: 12, borderRadius: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 6 }}>
                          <span style={{ color: '#fcd34d' }}>{'★'.repeat(q.rating)}{'☆'.repeat(5 - q.rating)}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{q.date}</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.5 }}>
                          "{q.text}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Strategies */}
                <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#a5b4fc', marginBottom: 10 }}>
                    🚀 Proposed Product Strategies to Prevent Churn
                  </div>
                  {currentTopic.recommendations.map((rec, idx) => (
                    <div key={idx} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ color: '#818cf8', fontWeight: 'bold' }}>✓</span>
                      <span style={{ lineHeight: 1.5 }}>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </main>
    </AppShell>
  );
}
