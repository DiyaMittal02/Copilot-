'use client';
import { useState } from 'react';
import AppShell from '@/components/AppShell';

const EXAMPLES = [
  'What is the overall churn rate?',
  'How many users upgraded to paid?',
  'Top 5 artists by number of plays',
  'How many ads do churned vs non-churned users see per song?',
  'Daily active users over time',
  'How many paid vs free users are there?',
];

export default function QueryPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);   // { sql, columns, rows, answer }
  const [error, setError] = useState('');
  const [showSql, setShowSql] = useState(false);
  const [editableSql, setEditableSql] = useState('');

  const ask = async (q) => {
    const text = q || question.trim();
    if (!text) return;
    setQuestion(text);
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Query failed.'); if (data.sql) setEditableSql(data.sql); }
      else { setResult(data); setEditableSql(data.sql); }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const runEditedSql = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: editableSql }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Query failed.');
      else setResult((prev) => ({ ...(prev || {}), ...data, answer: prev?.answer }));
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <AppShell>
      <main className="page-body">
        <div className="section-header" style={{ marginBottom: 16 }}>
          <div>
            <div className="section-title">Ask with SQL</div>
            <div className="section-subtitle">
              Ask in plain English — get an answer, the SQL behind it, and the data. Read-only, runs live on the event log.
            </div>
          </div>
        </div>

        {/* Ask box */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              className="form-input"
              style={{ flex: 1 }}
              placeholder="e.g. How many users upgraded to paid?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') ask(); }}
            />
            <button className="btn btn-primary" onClick={() => ask()} disabled={loading}>
              {loading ? '⏳ Running…' : '▶ Ask'}
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
            {EXAMPLES.map((ex) => (
              <button key={ex} className="chat-suggestion-chip" onClick={() => ask(ex)} disabled={loading}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="card" style={{ marginBottom: 16, borderColor: 'rgba(239,68,68,0.4)', color: '#fca5a5' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Answer */}
        {result?.answer && (
          <div className="card" style={{ marginBottom: 16, background: 'rgba(99,102,241,0.06)', borderColor: 'rgba(99,102,241,0.2)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#a5b4fc', marginBottom: 8 }}>💬 ANSWER</div>
            <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6 }}>{result.answer}</div>
          </div>
        )}

        {/* SQL (toggle + editable) */}
        {result && (
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setShowSql((s) => !s)}>
                {showSql ? '▾' : '▸'} SQL {showSql ? '(edit & re-run)' : ''}
              </button>
              {showSql && (
                <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={runEditedSql} disabled={loading}>
                  ▶ Run edited SQL
                </button>
              )}
            </div>
            {showSql && (
              <textarea
                className="form-textarea"
                style={{ marginTop: 10, width: '100%', minHeight: 110, fontFamily: 'Fira Code, monospace', fontSize: 12 }}
                value={editableSql}
                onChange={(e) => setEditableSql(e.target.value)}
                spellCheck={false}
              />
            )}
            {!showSql && (
              <pre style={{ marginTop: 10, padding: 12, background: 'rgba(0,0,0,0.25)', borderRadius: 8, overflowX: 'auto', fontSize: 12, color: '#93c5fd' }}>
                {result.sql}
              </pre>
            )}
          </div>
        )}

        {/* Result table */}
        {result?.rows && (
          <div className="card">
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10 }}>
              RESULT · {result.rows.length} row{result.rows.length === 1 ? '' : 's'}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    {result.columns.map((c) => (
                      <th key={c} style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', whiteSpace: 'nowrap', fontWeight: 600 }}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, i) => (
                    <tr key={i}>
                      {result.columns.map((c) => (
                        <td key={c} style={{ padding: '7px 12px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)', whiteSpace: 'nowrap' }}>
                          {String(row[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}
