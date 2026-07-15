'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { buildReportPrompt } from '@/lib/prompts';
import { kpiData } from '@/lib/mockData';

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

const REPORT_TYPES = [
  { id: 'weekly', label: '📅 Weekly Report', desc: 'WoW trends, experiment updates, actions' },
  { id: 'monthly', label: '📆 Monthly Report', desc: 'MoM trends, cohort analysis, strategic recommendations' },
  { id: 'exec', label: '🎯 Executive Summary', desc: 'Concise 1-page leadership brief' },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState('weekly');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) { alert('Please add your Gemini API key in the AI Copilot page first.'); return; }

    setLoading(true);
    setReport('');

    const data = {
      dau: kpiData.dau.value,
      dauChange: kpiData.dau.change,
      mau: kpiData.mau.value,
      mauChange: kpiData.mau.change,
      d7Retention: kpiData.d7Retention.value,
      d30Retention: kpiData.d30Retention.value,
      premiumConversion: kpiData.premiumConversion.value,
      avgListenTime: kpiData.avgListenTime.value,
      churnRate: kpiData.churnRate.value,
      arpu: kpiData.arpu.value,
      episodeCompletionRate: kpiData.episodeCompletionRate.value,
    };

    const basePrompt = buildReportPrompt(data);
    const typeAddendum = reportType === 'monthly'
      ? '\n\nThis is a MONTHLY report. Focus on month-over-month trends, cohort analysis, and strategic 30-60-90 day priorities.'
      : reportType === 'exec'
      ? '\n\nThis is an EXECUTIVE SUMMARY. Keep it to 3-4 bullet points per section. No jargon. Focus on business impact and clear decisions needed.'
      : '';

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, prompt: basePrompt + typeAddendum }),
    });
    const resData = await res.json();
    setReport(resData.text || resData.error);
    setLoading(false);
  };

  const copyReport = () => {
    navigator.clipboard.writeText(report);
    alert('Report copied to clipboard!');
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar pathname="/reports" />
        <main className="page-body">
          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              {REPORT_TYPES.map(rt => (
                <div
                  key={rt.id}
                  className={`card${reportType === rt.id ? '' : ''}`}
                  id={`report-type-${rt.id}`}
                  style={{
                    cursor: 'pointer', padding: '12px 16px',
                    borderColor: reportType === rt.id ? 'rgba(99,102,241,0.5)' : 'var(--border-subtle)',
                    background: reportType === rt.id ? 'rgba(99,102,241,0.1)' : 'var(--bg-card)',
                  }}
                  onClick={() => setReportType(rt.id)}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: reportType === rt.id ? '#a5b4fc' : 'var(--text-primary)' }}>{rt.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{rt.desc}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
              {report && (
                <button className="btn btn-secondary" id="copy-report-btn" onClick={copyReport}>📋 Copy</button>
              )}
              <button
                className="btn btn-primary"
                id="generate-report-btn"
                onClick={generateReport}
                disabled={loading}
              >
                {loading ? '🤖 Generating...' : '📝 Generate Report'}
              </button>
            </div>
          </div>

          {/* Current data context */}
          <div className="card" style={{ marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>📊 REPORT DATA SOURCE</div>
            {[
              { k: 'DAU', v: '2.85M', c: '+4.2%', ok: true },
              { k: 'MAU', v: '18.3M', c: '+7.8%', ok: true },
              { k: 'D7 Retention', v: '26.1%', c: '-0.8%', ok: false },
              { k: 'D30 Retention', v: '14.2%', c: '+0.3%', ok: true },
              { k: 'Conversion', v: '7.4%', c: '+0.9%', ok: true },
              { k: 'Churn', v: '3.2%/mo', c: '-0.4%', ok: true },
              { k: 'Listen Time', v: '43.7 min', c: '-2.1%', ok: false },
              { k: 'ARPU', v: '₹84.5', c: '+5.1%', ok: true },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.k}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.v}</span>
                <span style={{ fontSize: 10, color: m.ok ? '#10b981' : '#ef4444' }}>{m.c}</span>
              </div>
            ))}
          </div>

          {/* Report Output */}
          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Generating your report...</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Analyzing metrics and crafting insights with Gemini AI</div>
            </div>
          )}

          {report && !loading && (
            <div className="card" style={{ maxHeight: 'calc(100vh - 360px)', overflowY: 'auto' }}>
              <MarkdownText text={report} />
            </div>
          )}

          {!report && !loading && (
            <div className="card" style={{ textAlign: 'center', padding: '70px 24px', borderStyle: 'dashed' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>📊</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
                AI-Generated Product Reports
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: 400, margin: '0 auto' }}>
                Select a report type and click Generate. The AI will analyze current metrics and produce a comprehensive, shareable product report in seconds.
              </div>
              <button className="btn btn-primary" onClick={generateReport} style={{ marginTop: 24 }} id="generate-report-main-btn">
                📝 Generate Weekly Report
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
