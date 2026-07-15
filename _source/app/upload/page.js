'use client';
import { useState, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { buildDataAnalysisPrompt } from '@/lib/prompts';

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

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (f) => {
    if (!f || !f.name.endsWith('.csv')) { alert('Please upload a CSV file.'); return; }
    setFile(f);
    const Papa = (await import('papaparse')).default;
    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => setParsed(result),
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const analyzeWithAI = async () => {
    if (!parsed) return;
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) { alert('Please add your Gemini API key in the AI Copilot page first.'); return; }

    setLoading(true);
    const columns = parsed.meta.fields || [];
    const sampleRows = parsed.data.slice(0, 3);
    const prompt = buildDataAnalysisPrompt(columns, sampleRows);

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, prompt }),
    });
    const data = await res.json();
    setAnalysis(data.text || data.error);
    setLoading(false);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar pathname="/upload" />
        <main className="page-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Upload zone */}
            <div>
              <div className="section-header" style={{ marginBottom: 16 }}>
                <div>
                  <div className="section-title">Upload Your Data</div>
                  <div className="section-subtitle">CSV from Mixpanel, Amplitude, BigQuery, or internal BI</div>
                </div>
              </div>

              <div
                className={`upload-zone${dragOver ? ' drag-over' : ''}`}
                id="upload-dropzone"
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-icon">📊</div>
                <div className="upload-title">Drop your CSV file here</div>
                <div className="upload-subtitle">or click to browse · Supports exports from Mixpanel, Amplitude, Looker, BigQuery</div>
                <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} id="csv-file-input" onChange={e => handleFile(e.target.files[0])} />
              </div>

              {file && (
                <div className="card" style={{ marginTop: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 32 }}>📄</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {(file.size / 1024).toFixed(1)} KB · {parsed?.data.length || '—'} rows · {parsed?.meta.fields?.length || '—'} columns
                      </div>
                    </div>
                    <button className="btn btn-secondary" onClick={() => { setFile(null); setParsed(null); setAnalysis(''); }}>Remove</button>
                  </div>

                  {parsed && (
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>DETECTED COLUMNS</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {parsed.meta.fields?.map(col => (
                          <span key={col} style={{
                            fontSize: 11, padding: '3px 8px', background: 'rgba(99,102,241,0.1)',
                            border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20,
                            color: '#818cf8'
                          }}>{col}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {parsed && (
                    <button
                      className="btn btn-primary"
                      id="analyze-csv-btn"
                      onClick={analyzeWithAI}
                      disabled={loading}
                      style={{ marginTop: 16, width: '100%' }}
                    >
                      {loading ? '🤖 Analyzing...' : '🤖 Analyze with AI'}
                    </button>
                  )}
                </div>
              )}

              {/* Sample data preview */}
              {parsed && parsed.data.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>DATA PREVIEW (first 5 rows)</div>
                  <div style={{ overflowX: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr>
                          {parsed.meta.fields?.map(col => (
                            <th key={col} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', whiteSpace: 'nowrap', fontWeight: 600 }}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parsed.data.slice(0, 5).map((row, i) => (
                          <tr key={i}>
                            {parsed.meta.fields?.map(col => (
                              <td key={col} style={{ padding: '7px 12px', color: 'var(--text-secondary)', borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none', whiteSpace: 'nowrap' }}>
                                {String(row[col] || '—').slice(0, 30)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis output */}
            <div>
              <div className="section-header" style={{ marginBottom: 16 }}>
                <div>
                  <div className="section-title">AI Analysis</div>
                  <div className="section-subtitle">Gemini identifies patterns, anomalies, and suggested queries</div>
                </div>
              </div>

              {loading && (
                <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Analyzing your data...</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Detecting patterns, data quality, and insights</div>
                </div>
              )}

              {analysis && !loading && (
                <div className="card" style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}>
                  <MarkdownText text={analysis} />
                </div>
              )}

              {!analysis && !loading && (
                <div className="card" style={{ textAlign: 'center', padding: '60px 24px', borderStyle: 'dashed' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    Upload a CSV to get started
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    The AI will auto-detect your data type,<br />
                    suggest analyses, flag quality issues,<br />
                    and generate BigQuery SQL queries.
                  </div>
                  <div style={{ marginTop: 20, fontSize: 11, color: 'var(--text-muted)' }}>
                    Supported: Mixpanel exports · Amplitude data · Retention cohorts · Event logs
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
