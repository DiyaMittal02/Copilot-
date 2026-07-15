'use client';
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import { metrics, metricCategories } from '@/lib/metrics';
import { buildMetricExplainerPrompt } from '@/lib/prompts';

function MarkdownText({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <div className="md-content">
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={i}>{line.slice(4)}</h3>;
        if (line.startsWith('# ')) return <h2 key={i}>{line.slice(2)}</h2>;
        if (line.startsWith('- ') || line.startsWith('* ')) return (
          <li key={i} style={{ marginLeft: '16px' }} dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
        );
        if (/^\d+\.\s/.test(line)) return (
          <li key={i} style={{ marginLeft: '16px' }} dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^\d+\.\s/, '')) }} />
        );
        if (line.trim() === '') return <br key={i} />;
        return <p key={i} dangerouslySetInnerHTML={{ __html: formatInline(line) }} />;
      })}
    </div>
  );
}

function formatInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

function MetricModal({ metric, onClose, apiKey }) {
  const [aiExplanation, setAiExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const getAIExplanation = async () => {
    if (!apiKey) { alert('Add your Groq API key in the AI Copilot section first.'); return; }
    setLoading(true);
    const prompt = buildMetricExplainerPrompt(metric);
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, prompt }),
    });
    const data = await res.json();
    setAiExplanation(data.text || data.error);
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)', padding: 28, maxWidth: 700, width: '100%',
        maxHeight: '85vh', overflowY: 'auto', boxShadow: 'var(--shadow-glow)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{metric.name}</div>
            <span className={`metric-category-badge badge-${metric.category}`}>{metric.category}</span>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: 18 }}>✕</button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>DEFINITION</div>
          <div className="metric-definition" style={{ fontSize: 13 }}>{metric.definition}</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>FORMULA</div>
          <div className="metric-formula">{metric.formula}</div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>INDUSTRY BENCHMARK</div>
          <div className="metric-benchmark">
            <span>📊</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{metric.benchmark}</span>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>WHEN TO TRACK</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{metric.whenToTrack}</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>POCKETFM TIP</div>
          <div className="metric-pocketfm-tip">
            <span>🎯</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{metric.pocketfmTip}</span>
          </div>
        </div>

        {!aiExplanation ? (
          <button className="btn btn-primary" onClick={getAIExplanation} disabled={loading} id={`ai-explain-${metric.id}`}>
            {loading ? '🤖 Generating AI Deep Dive...' : '🤖 Get AI Deep Dive'}
          </button>
        ) : (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#a5b4fc', marginBottom: 10 }}>🤖 AI Deep Dive</div>
            <div style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 16 }}>
              <MarkdownText text={aiExplanation} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MetricsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedMetric, setSelectedMetric] = useState(null);
  const apiKey = typeof window !== 'undefined' ? localStorage.getItem('groq_api_key') : '';

  const filtered = metrics.filter(m => {
    const matchCategory = activeCategory === 'All' || m.category === activeCategory;
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.definition.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <AppShell>
      <main className="page-body">
          {/* Header */}
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className="section-title">Product Metric Library</div>
              <div className="section-subtitle">{metrics.length} metrics · Audio streaming & subscription platform focus</div>
            </div>
            <input
              className="form-input"
              style={{ width: 280 }}
              id="metric-search"
              placeholder="🔍 Search metrics..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Category filters */}
          <div className="filter-bar">
            {metricCategories.map(cat => (
              <button
                key={cat}
                className={`filter-chip${activeCategory === cat ? ' active' : ''}`}
                id={`filter-${cat.toLowerCase()}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat} {cat !== 'All' ? `(${metrics.filter(m => m.category === cat).length})` : `(${metrics.length})`}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="metric-grid">
            {filtered.map(metric => (
              <div key={metric.id} className="metric-card" id={`metric-${metric.id}`} onClick={() => setSelectedMetric(metric)}>
                <div className="metric-card-header">
                  <div className="metric-name">{metric.name}</div>
                  <span className={`metric-category-badge badge-${metric.category}`}>{metric.category}</span>
                </div>
                <div className="metric-definition">{metric.definition}</div>
                <div className="metric-formula">{metric.formula}</div>
                <div className="metric-benchmark">
                  <span>📊</span>
                  <span>{metric.benchmark}</span>
                </div>
                <div className="metric-pocketfm-tip">
                  <span>🎯</span>
                  <span>{metric.pocketfmTip}</span>
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: '#818cf8', fontWeight: 500 }}>
                  Click for AI deep dive →
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>No metrics found</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Try a different search or category</div>
            </div>
          )}
        </main>
      {selectedMetric && (
        <MetricModal metric={selectedMetric} onClose={() => setSelectedMetric(null)} apiKey={apiKey} />
      )}
    </AppShell>
  );
}
