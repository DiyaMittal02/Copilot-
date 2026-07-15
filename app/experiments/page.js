'use client';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import { buildExperimentPrompt } from '@/lib/prompts';

function MarkdownText({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="md-content">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={i}>{line.slice(4)}</h3>;
        if (line.startsWith('# ')) return <h2 key={i}>{line.slice(2)}</h2>;
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} style={{ marginLeft: '16px' }} dangerouslySetInnerHTML={{ __html: fmt(line.slice(2)) }} />;
        if (/^\d+\.\s/.test(line)) return <li key={i} style={{ marginLeft: '16px' }} dangerouslySetInnerHTML={{ __html: fmt(line.replace(/^\d+\.\s/, '')) }} />;
        if (line.trim() === '') return <br key={i} />;
        if (line.startsWith('---')) return <hr key={i} />;
        return <p key={i} dangerouslySetInnerHTML={{ __html: fmt(line) }} />;
      })}
    </div>
  );
}

function fmt(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

const EXAMPLE_EXPERIMENTS = [
  {
    feature: 'Show "Episode 2 Preview" after Episode 1 completes',
    hypothesis: 'Showing a 30-second preview of Episode 2 immediately after Episode 1 ends will increase series binge rate',
    targetMetric: 'Series Finish Rate',
    userSegment: 'New users who just completed Episode 1 of any series',
  },
  {
    feature: '7-day free premium trial for new users',
    hypothesis: 'Offering a 7-day free trial at onboarding Day 3 will improve premium conversion rate',
    targetMetric: 'Free-to-Premium Conversion Rate',
    userSegment: 'Free users with 3+ days of activity who have not seen paywall before',
  },
  {
    feature: 'Personalized "Continue Listening" notification at 8 PM',
    hypothesis: 'Sending a personalized push notification at 8 PM with last listened show will improve D7 retention',
    targetMetric: 'D7 Retention',
    userSegment: 'Users who were active in the past 3 days but not today',
  },
];

export default function ExperimentsPage() {
  const [form, setForm] = useState({ feature: '', hypothesis: '', targetMetric: '', userSegment: '' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedExperiments, setSavedExperiments] = useState([]);

  const handleGenerate = async () => {
    const apiKey = localStorage.getItem('groq_api_key');
    if (!apiKey) { alert('Please add your Groq API key in the AI Copilot page first.'); return; }
    if (!form.feature || !form.hypothesis || !form.targetMetric) { alert('Please fill in Feature, Hypothesis, and Target Metric.'); return; }

    setLoading(true);
    setResult('');
    const prompt = buildExperimentPrompt(form);
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, prompt }),
    });
    const data = await res.json();
    setResult(data.text || data.error);
    setLoading(false);
  };

  const saveExperiment = () => {
    if (!result) return;
    setSavedExperiments(prev => [...prev, { ...form, plan: result, date: new Date().toLocaleDateString() }]);
    alert('Experiment saved!');
  };

  const loadExample = (ex) => {
    setForm(ex);
    setResult('');
  };

  return (
    <AppShell>
      <main className="page-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Form */}
            <div>
              <div className="section-header" style={{ marginBottom: 16 }}>
                <div>
                  <div className="section-title">Design a New Experiment</div>
                  <div className="section-subtitle">AI generates a complete A/B test plan</div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 16 }}>
                <div className="form-group">
                  <label className="form-label">Feature / Change Being Tested *</label>
                  <input className="form-input" id="exp-feature" placeholder="e.g. Show episode preview after completion" value={form.feature} onChange={e => setForm(f => ({ ...f, feature: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Hypothesis *</label>
                  <textarea className="form-textarea" id="exp-hypothesis" placeholder="If we [do X], then [Y metric] will [improve/decrease] because [reason]..." value={form.hypothesis} onChange={e => setForm(f => ({ ...f, hypothesis: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Primary Metric to Move *</label>
                  <input className="form-input" id="exp-metric" placeholder="e.g. D7 Retention, Episode Completion Rate, Premium Conversion" value={form.targetMetric} onChange={e => setForm(f => ({ ...f, targetMetric: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Target User Segment</label>
                  <input className="form-input" id="exp-segment" placeholder="e.g. New users, D3-D7 active users, Free users..." value={form.userSegment} onChange={e => setForm(f => ({ ...f, userSegment: e.target.value }))} />
                </div>
                <button className="btn btn-primary" id="generate-experiment-btn" onClick={handleGenerate} disabled={loading} style={{ width: '100%' }}>
                  {loading ? '🤖 Generating Experiment Plan...' : '🧪 Generate A/B Test Plan'}
                </button>
              </div>

              {/* Example experiments */}
              <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                💡 EXAMPLE EXPERIMENTS — click to load
              </div>
              {EXAMPLE_EXPERIMENTS.map((ex, i) => (
                <div key={i} className="card" style={{ marginBottom: 10, cursor: 'pointer', transition: 'all 0.15s' }}
                  onClick={() => loadExample(ex)}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    🧪 {ex.feature}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Target metric: <span style={{ color: '#818cf8' }}>{ex.targetMetric}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Result */}
            <div>
              <div className="section-header" style={{ marginBottom: 16 }}>
                <div>
                  <div className="section-title">AI Experiment Plan</div>
                  <div className="section-subtitle">Generated by Groq AI · Powered by experimentation best practices</div>
                </div>
                {result && (
                  <button className="btn btn-secondary" onClick={saveExperiment} id="save-experiment-btn">
                    💾 Save
                  </button>
                )}
              </div>

              {loading && (
                <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Designing your experiment...</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Applying statistical best practices</div>
                </div>
              )}

              {result && !loading && (
                <div className="card" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                  <MarkdownText text={result} />
                </div>
              )}

              {!result && !loading && (
                <div className="card" style={{ textAlign: 'center', padding: '60px 24px', borderStyle: 'dashed' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🧪</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Ready to Design an Experiment
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Fill in your feature idea and hypothesis on the left,<br />
                    or click an example experiment to load it instantly.
                  </div>
                </div>
              )}

              {/* Saved experiments */}
              {savedExperiments.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
                    💾 Saved Experiments ({savedExperiments.length})
                  </div>
                  {savedExperiments.map((exp, i) => (
                    <div key={i} className="card" style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{exp.feature}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Metric: {exp.targetMetric} · Saved {exp.date}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
    </AppShell>
  );
}
