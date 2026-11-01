'use client';
import { useState, useEffect } from 'react';

const pageTitles = {
  '/dashboard':  { title: 'Dashboard',           subtitle: 'Product metrics computed from the event log' },
  '/churn':      { title: 'Churn Analysis',      subtitle: 'What predicts cancellation — significance tests & model' },
  '/copilot':    { title: 'AI Copilot',          subtitle: 'Ask anything about your product metrics — powered by Groq AI' },
  '/query':      { title: 'Ask with SQL',        subtitle: 'Plain-English questions → live SQL on the event log' },
  '/metrics':    { title: 'Metric Library',      subtitle: 'Product metrics with definitions, formulas & benchmarks' },
  '/experiments':{ title: 'Experiment Planner',  subtitle: 'Design A/B tests and size them with real statistics' },
  '/upload':     { title: 'Data Upload',         subtitle: 'Upload CSV data for instant AI-powered analysis' },
  '/reports':    { title: 'Report Generator',    subtitle: 'One-click AI-generated product reports' },
};

export default function TopBar({ pathname, onMenuClick }) {
  const page = pageTitles[pathname] || { title: 'Cadence', subtitle: 'Streaming Analytics Copilot' };
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  // Theme: lazy-init from localStorage (client only), then sync the DOM class.
  const [theme, setTheme] = useState(() =>
    (typeof window !== 'undefined' && localStorage.getItem('pfmt_theme')) || 'dark'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', theme === 'light');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('pfmt_theme', newTheme);
  };

  return (
    <header className="topbar">
      {/* Hamburger — only visible on mobile via CSS */}
      <button
        className="hamburger-btn"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        ☰
      </button>

      <div className="topbar-left" style={{ flex: 1, minWidth: 0 }}>
        <h1 className="topbar-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {page.title}
        </h1>
        <p className="topbar-subtitle">{page.subtitle}</p>
      </div>

      <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          suppressHydrationWarning
          aria-label="Toggle theme mode"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 10,
            border: '1px solid var(--border-subtle)', background: 'var(--bg-card)',
            cursor: 'pointer', color: 'var(--text-primary)', fontSize: 16,
            transition: 'all 0.2s', outline: 'none'
          }}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <span className="topbar-date">🗓 {dateStr}</span>
      </div>
    </header>
  );
}
